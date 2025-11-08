# OneFlow Production Setup Script (PowerShell)
# This script helps you set up all required secrets and environment variables for Cloud Run

$ErrorActionPreference = "Stop"

$PROJECT_ID = "xenon-notch-477511-g5"
$REGION = "us-central1"
$SERVICE_NAME = "oneflow"
$BUCKET_NAME = "oneflow-storage"

Write-Host "🚀 OneFlow Production Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
    Write-Host "✅ gcloud CLI detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: gcloud CLI is not installed" -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
}
Write-Host ""

# Set project
Write-Host "📦 Setting project to $PROJECT_ID..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID
Write-Host ""

# Step 1: Get Cloud Run URL
Write-Host "🔍 Step 1: Getting Cloud Run service URL..." -ForegroundColor Yellow
try {
    $SERVICE_URL = gcloud run services describe $SERVICE_NAME `
        --region=$REGION `
        --format='value(status.url)' 2>$null
    
    if ([string]::IsNullOrWhiteSpace($SERVICE_URL)) {
        throw "Service not found"
    }
    Write-Host "   Found: $SERVICE_URL" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Service not yet deployed." -ForegroundColor Yellow
    $SERVICE_URL = Read-Host "   Enter Cloud Run URL (or press Enter to use placeholder)"
    if ([string]::IsNullOrWhiteSpace($SERVICE_URL)) {
        $SERVICE_URL = "https://$SERVICE_NAME-REPLACE-ME.a.run.app"
        Write-Host "   Using placeholder: $SERVICE_URL" -ForegroundColor Yellow
        Write-Host "   ⚠️  Remember to update this after first deployment!" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 2: Create secrets in Secret Manager
Write-Host "🔐 Step 2: Creating secrets in Secret Manager..." -ForegroundColor Yellow

# Check if service-account-key.json exists
if (-not (Test-Path "service-account-key.json")) {
    Write-Host "❌ Error: service-account-key.json not found" -ForegroundColor Red
    Write-Host "   Please ensure the file exists in the current directory"
    exit 1
}

# Create GCP Storage Key secret
Write-Host "   Creating GCP_STORAGE_KEY secret..." -ForegroundColor Gray
try {
    gcloud secrets describe GCP_STORAGE_KEY --project=$PROJECT_ID 2>$null
    Write-Host "   Secret already exists, creating new version..." -ForegroundColor Gray
    gcloud secrets versions add GCP_STORAGE_KEY `
        --data-file=service-account-key.json `
        --project=$PROJECT_ID
} catch {
    gcloud secrets create GCP_STORAGE_KEY `
        --data-file=service-account-key.json `
        --project=$PROJECT_ID
}
Write-Host "   ✅ GCP_STORAGE_KEY created" -ForegroundColor Green

# Create NEXTAUTH_SECRET
Write-Host "   Creating NEXTAUTH_SECRET..." -ForegroundColor Gray
$NEXTAUTH_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$NEXTAUTH_SECRET = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($NEXTAUTH_SECRET))

try {
    gcloud secrets describe NEXTAUTH_SECRET --project=$PROJECT_ID 2>$null
    Write-Host "   Secret already exists, creating new version..." -ForegroundColor Gray
    $NEXTAUTH_SECRET | gcloud secrets versions add NEXTAUTH_SECRET `
        --data-file=- `
        --project=$PROJECT_ID
} catch {
    $NEXTAUTH_SECRET | gcloud secrets create NEXTAUTH_SECRET `
        --data-file=- `
        --project=$PROJECT_ID
}
Write-Host "   ✅ NEXTAUTH_SECRET created" -ForegroundColor Green
Write-Host ""

# Step 3: Grant Cloud Run access to secrets
Write-Host "🔑 Step 3: Granting Cloud Run access to secrets..." -ForegroundColor Yellow
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format='value(projectNumber)'
$SERVICE_ACCOUNT = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

Write-Host "   Service Account: $SERVICE_ACCOUNT" -ForegroundColor Gray

$SECRETS = @("GCP_STORAGE_KEY", "NEXTAUTH_SECRET", "DATABASE_URL")
foreach ($SECRET in $SECRETS) {
    try {
        gcloud secrets describe $SECRET --project=$PROJECT_ID 2>$null
        Write-Host "   Granting access to $SECRET..." -ForegroundColor Gray
        gcloud secrets add-iam-policy-binding $SECRET `
            --member="serviceAccount:$SERVICE_ACCOUNT" `
            --role="roles/secretmanager.secretAccessor" `
            --project=$PROJECT_ID 2>$null | Out-Null
        Write-Host "   ✅ Access granted to $SECRET" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  $SECRET not found, skipping..." -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 4: Update Google OAuth redirect URIs
Write-Host "🔗 Step 4: Google OAuth Configuration" -ForegroundColor Yellow
Write-Host "   You need to manually add this redirect URI to Google OAuth Console:" -ForegroundColor White
Write-Host ""
Write-Host "   📋 Redirect URI: $SERVICE_URL/api/auth/callback/google" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Go to: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
Write-Host "   2. Click on your OAuth 2.0 Client ID"
Write-Host "   3. Add the redirect URI above to 'Authorized redirect URIs'"
Write-Host "   4. Click Save"
Write-Host ""
Read-Host "   Press Enter when you've added the redirect URI"
Write-Host ""

# Step 5: Add GitHub Secret for NEXTAUTH_URL
Write-Host "📝 Step 5: GitHub Secrets Configuration" -ForegroundColor Yellow
Write-Host "   You need to add this secret to your GitHub repository:" -ForegroundColor White
Write-Host ""
Write-Host "   Secret Name: NEXTAUTH_URL" -ForegroundColor Cyan
Write-Host "   Secret Value: $SERVICE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Go to: https://github.com/ebrahimgamdiwala/OneFlow/settings/secrets/actions"
Write-Host "   2. Click 'New repository secret'"
Write-Host "   3. Name: NEXTAUTH_URL"
Write-Host "   4. Value: $SERVICE_URL"
Write-Host "   5. Click 'Add secret'"
Write-Host ""
Read-Host "   Press Enter when you've added the GitHub secret"
Write-Host ""

# Step 6: Deploy or update Cloud Run
Write-Host "🚀 Step 6: Deploying to Cloud Run..." -ForegroundColor Yellow
Write-Host "   Updating Cloud Run service with environment variables and secrets..." -ForegroundColor Gray

gcloud run services update $SERVICE_NAME `
    --region=$REGION `
    --update-env-vars="NODE_ENV=production,NEXTAUTH_URL=$SERVICE_URL,GCP_PROJECT_ID=$PROJECT_ID,GCP_BUCKET_NAME=$BUCKET_NAME" `
    --update-secrets="DATABASE_URL=DATABASE_URL:latest,NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,GCP_SERVICE_ACCOUNT_KEY=GCP_STORAGE_KEY:latest" `
    --project=$PROJECT_ID

Write-Host ""
Write-Host "✅ Deployment updated successfully!" -ForegroundColor Green
Write-Host ""

# Final verification
Write-Host "🎉 Setup Complete!" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service URL: $SERVICE_URL" -ForegroundColor White
Write-Host ""
Write-Host "✅ Checklist:" -ForegroundColor Green
Write-Host "   [✓] Secrets created in Secret Manager"
Write-Host "   [✓] Cloud Run has access to secrets"
Write-Host "   [✓] Environment variables configured"
Write-Host "   [ ] Google OAuth redirect URI added (verify manually)"
Write-Host "   [ ] GitHub secret NEXTAUTH_URL added (verify manually)"
Write-Host ""
Write-Host "🧪 Test Your Deployment:" -ForegroundColor Yellow
Write-Host "   1. Open: $SERVICE_URL"
Write-Host "   2. Click 'Sign in with Google'"
Write-Host "   3. Upload a profile picture"
Write-Host "   4. Verify image uploads to GCS"
Write-Host ""
Write-Host "📊 View Logs:" -ForegroundColor Yellow
Write-Host "   gcloud run services logs read $SERVICE_NAME --region=$REGION"
Write-Host ""
Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
Write-Host "   See PRODUCTION_SETUP.md for detailed troubleshooting steps"
Write-Host ""
