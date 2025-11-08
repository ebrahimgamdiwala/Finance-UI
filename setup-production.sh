#!/bin/bash

# OneFlow Production Setup Script
# This script helps you set up all required secrets and environment variables for Cloud Run

set -e

PROJECT_ID="xenon-notch-477511-g5"
REGION="us-central1"
SERVICE_NAME="oneflow"
BUCKET_NAME="oneflow-storage"

echo "🚀 OneFlow Production Setup"
echo "=============================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ Error: Not logged in to gcloud"
    echo "Please run: gcloud auth login"
    exit 1
fi

echo "✅ gcloud CLI detected"
echo ""

# Set project
echo "📦 Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}
echo ""

# Step 1: Get Cloud Run URL
echo "🔍 Step 1: Getting Cloud Run service URL..."
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --region=${REGION} \
  --format='value(status.url)' 2>/dev/null || echo "")

if [ -z "$SERVICE_URL" ]; then
    echo "⚠️  Service not yet deployed. Please deploy first, then run this script."
    echo "   Or enter your expected Cloud Run URL manually when prompted."
    read -p "   Enter Cloud Run URL (or press Enter to skip): " SERVICE_URL
    if [ -z "$SERVICE_URL" ]; then
        SERVICE_URL="https://${SERVICE_NAME}-REPLACE-ME.a.run.app"
        echo "   Using placeholder: ${SERVICE_URL}"
        echo "   ⚠️  Remember to update this after first deployment!"
    fi
else
    echo "   Found: ${SERVICE_URL}"
fi
echo ""

# Step 2: Create secrets in Secret Manager
echo "🔐 Step 2: Creating secrets in Secret Manager..."

# Check if service-account-key.json exists
if [ ! -f "service-account-key.json" ]; then
    echo "❌ Error: service-account-key.json not found"
    echo "   Please ensure the file exists in the current directory"
    exit 1
fi

# Create GCP Storage Key secret
echo "   Creating GCP_STORAGE_KEY secret..."
if gcloud secrets describe GCP_STORAGE_KEY --project=${PROJECT_ID} &> /dev/null; then
    echo "   Secret already exists, creating new version..."
    gcloud secrets versions add GCP_STORAGE_KEY \
      --data-file=service-account-key.json \
      --project=${PROJECT_ID}
else
    gcloud secrets create GCP_STORAGE_KEY \
      --data-file=service-account-key.json \
      --project=${PROJECT_ID}
fi
echo "   ✅ GCP_STORAGE_KEY created"

# Create NEXTAUTH_SECRET
echo "   Creating NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
if gcloud secrets describe NEXTAUTH_SECRET --project=${PROJECT_ID} &> /dev/null; then
    echo "   Secret already exists, creating new version..."
    echo -n "${NEXTAUTH_SECRET}" | gcloud secrets versions add NEXTAUTH_SECRET \
      --data-file=- \
      --project=${PROJECT_ID}
else
    echo -n "${NEXTAUTH_SECRET}" | gcloud secrets create NEXTAUTH_SECRET \
      --data-file=- \
      --project=${PROJECT_ID}
fi
echo "   ✅ NEXTAUTH_SECRET created"
echo ""

# Step 3: Grant Cloud Run access to secrets
echo "🔑 Step 3: Granting Cloud Run access to secrets..."
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "   Service Account: ${SERVICE_ACCOUNT}"

for SECRET in "GCP_STORAGE_KEY" "NEXTAUTH_SECRET" "DATABASE_URL"; do
    if gcloud secrets describe ${SECRET} --project=${PROJECT_ID} &> /dev/null; then
        echo "   Granting access to ${SECRET}..."
        gcloud secrets add-iam-policy-binding ${SECRET} \
          --member="serviceAccount:${SERVICE_ACCOUNT}" \
          --role="roles/secretmanager.secretAccessor" \
          --project=${PROJECT_ID} &> /dev/null
        echo "   ✅ Access granted to ${SECRET}"
    else
        echo "   ⚠️  ${SECRET} not found, skipping..."
    fi
done
echo ""

# Step 4: Update Google OAuth redirect URIs
echo "🔗 Step 4: Google OAuth Configuration"
echo "   You need to manually add this redirect URI to Google OAuth Console:"
echo ""
echo "   📋 Redirect URI: ${SERVICE_URL}/api/auth/callback/google"
echo ""
echo "   1. Go to: https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}"
echo "   2. Click on your OAuth 2.0 Client ID"
echo "   3. Add the redirect URI above to 'Authorized redirect URIs'"
echo "   4. Click Save"
echo ""
read -p "   Press Enter when you've added the redirect URI..."
echo ""

# Step 5: Add GitHub Secret for NEXTAUTH_URL
echo "📝 Step 5: GitHub Secrets Configuration"
echo "   You need to add this secret to your GitHub repository:"
echo ""
echo "   Secret Name: NEXTAUTH_URL"
echo "   Secret Value: ${SERVICE_URL}"
echo ""
echo "   1. Go to: https://github.com/ebrahimgamdiwala/OneFlow/settings/secrets/actions"
echo "   2. Click 'New repository secret'"
echo "   3. Name: NEXTAUTH_URL"
echo "   4. Value: ${SERVICE_URL}"
echo "   5. Click 'Add secret'"
echo ""
read -p "   Press Enter when you've added the GitHub secret..."
echo ""

# Step 6: Deploy or update Cloud Run
echo "🚀 Step 6: Deploying to Cloud Run..."
echo "   Updating Cloud Run service with environment variables and secrets..."

gcloud run services update ${SERVICE_NAME} \
  --region=${REGION} \
  --update-env-vars="NODE_ENV=production,NEXTAUTH_URL=${SERVICE_URL},GCP_PROJECT_ID=${PROJECT_ID},GCP_BUCKET_NAME=${BUCKET_NAME}" \
  --update-secrets="DATABASE_URL=DATABASE_URL:latest,NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,GCP_SERVICE_ACCOUNT_KEY=GCP_STORAGE_KEY:latest" \
  --project=${PROJECT_ID}

echo ""
echo "✅ Deployment updated successfully!"
echo ""

# Final verification
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Service URL: ${SERVICE_URL}"
echo ""
echo "✅ Checklist:"
echo "   [✓] Secrets created in Secret Manager"
echo "   [✓] Cloud Run has access to secrets"
echo "   [✓] Environment variables configured"
echo "   [ ] Google OAuth redirect URI added (verify manually)"
echo "   [ ] GitHub secret NEXTAUTH_URL added (verify manually)"
echo ""
echo "🧪 Test Your Deployment:"
echo "   1. Open: ${SERVICE_URL}"
echo "   2. Click 'Sign in with Google'"
echo "   3. Upload a profile picture"
echo "   4. Verify image uploads to GCS"
echo ""
echo "📊 View Logs:"
echo "   gcloud run services logs read ${SERVICE_NAME} --region=${REGION}"
echo ""
echo "🔧 Troubleshooting:"
echo "   See PRODUCTION_SETUP.md for detailed troubleshooting steps"
echo ""
