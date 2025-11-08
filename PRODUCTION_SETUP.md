# Production Deployment Setup Guide

This guide walks you through setting up environment variables and secrets in Google Cloud for production deployment.

## 🚨 Important Issues Fixed

### 1. Google OAuth Not Working in Production
**Problem:** `NEXTAUTH_URL` was set to `http://localhost:3000` instead of your production URL.

**Solution:** Update the authorized redirect URIs and set the correct production URL.

### 2. GCP Storage Not Working in Production
**Problem:** Service account key file (`service-account-key.json`) only exists locally, not in Cloud Run.

**Solution:** Store the service account credentials as an environment variable in Cloud Run.

---

## Part 1: Google OAuth Setup for Production

### Step 1: Add Production URL to Google OAuth Console

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=xenon-notch-477511-g5)

2. Click on your OAuth 2.0 Client ID: `965833054875-l64kanaq2347demjon4n8brtibll551e.apps.googleusercontent.com`

3. Under **Authorized redirect URIs**, add your Cloud Run URL:
   ```
   https://YOUR-SERVICE-URL/api/auth/callback/google
   ```
   
   Example:
   ```
   https://oneflow-abc123xyz-uc.a.run.app/api/auth/callback/google
   ```

4. Click **Save**

### Step 2: Get Your Cloud Run Service URL

Run this command to get your service URL:
```bash
gcloud run services describe oneflow \
  --platform=managed \
  --region=us-central1 \
  --format='value(status.url)'
```

Or find it in the [Cloud Run Console](https://console.cloud.google.com/run?project=xenon-notch-477511-g5).

---

## Part 2: Set Up Cloud Run Environment Variables

You need to set these environment variables in Cloud Run. You have two options:

### Option A: Using gcloud CLI (Recommended)

#### 1. Set NEXTAUTH_URL (Replace with YOUR actual Cloud Run URL)

```bash
gcloud run services update oneflow \
  --region=us-central1 \
  --update-env-vars="NEXTAUTH_URL=https://YOUR-CLOUD-RUN-URL" \
  --project=xenon-notch-477511-g5
```

Example:
```bash
gcloud run services update oneflow \
  --region=us-central1 \
  --update-env-vars="NEXTAUTH_URL=https://oneflow-abc123xyz-uc.a.run.app" \
  --project=xenon-notch-477511-g5
```

#### 2. Set GCP Service Account Key (for storage)

First, create a single-line JSON string from your service account key:

**On Windows (PowerShell):**
```powershell
$json = Get-Content service-account-key.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
echo $json
```

**On Mac/Linux:**
```bash
cat service-account-key.json | jq -c .
```

Copy the output (it will be one long line), then run:

```bash
gcloud run services update oneflow \
  --region=us-central1 \
  --update-env-vars="GCP_SERVICE_ACCOUNT_KEY='YOUR-JSON-HERE'" \
  --project=xenon-notch-477511-g5
```

Example:
```bash
gcloud run services update oneflow \
  --region=us-central1 \
  --update-env-vars='GCP_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"xenon-notch-477511-g5","private_key_id":"d006c06e6a30...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEv...","client_email":"oneflow-storage-service@xenon-notch-477511-g5.iam.gserviceaccount.com",...}' \
  --project=xenon-notch-477511-g5
```

#### 3. Set GCP Storage Configuration

```bash
gcloud run services update oneflow \
  --region=us-central1 \
  --update-env-vars="GCP_PROJECT_ID=xenon-notch-477511-g5,GCP_BUCKET_NAME=oneflow-storage" \
  --project=xenon-notch-477511-g5
```

#### 4. Update All Environment Variables at Once

You can also set everything in one command:

```bash
gcloud run services update oneflow \
  --region=us-central1 \
  --update-env-vars="\
NEXTAUTH_URL=https://YOUR-CLOUD-RUN-URL,\
GCP_PROJECT_ID=xenon-notch-477511-g5,\
GCP_BUCKET_NAME=oneflow-storage,\
NODE_ENV=production" \
  --set-env-vars="GCP_SERVICE_ACCOUNT_KEY=$(cat service-account-key.json | jq -c .)" \
  --project=xenon-notch-477511-g5
```

### Option B: Using Cloud Console (GUI)

1. Go to [Cloud Run Console](https://console.cloud.google.com/run?project=xenon-notch-477511-g5)

2. Click on your service: **oneflow**

3. Click **Edit & Deploy New Revision**

4. Go to the **Variables & Secrets** tab

5. Click **+ Add Variable** for each:

   | Name | Value |
   |------|-------|
   | `NEXTAUTH_URL` | `https://YOUR-CLOUD-RUN-URL` |
   | `GCP_PROJECT_ID` | `xenon-notch-477511-g5` |
   | `GCP_BUCKET_NAME` | `oneflow-storage` |
   | `GCP_SERVICE_ACCOUNT_KEY` | Paste the entire JSON from `service-account-key.json` as ONE LINE |
   | `NODE_ENV` | `production` |

6. Click **Deploy**

---

## Part 3: Using Google Secret Manager (Most Secure - Recommended)

For better security, store sensitive credentials in Secret Manager instead of environment variables.

### Step 1: Create Secrets

```bash
# Store the service account key as a secret
cat service-account-key.json | gcloud secrets create gcp-storage-key \
  --data-file=- \
  --project=xenon-notch-477511-g5

# Store NextAuth secret
echo "your-nextauth-secret-here" | gcloud secrets create nextauth-secret \
  --data-file=- \
  --project=xenon-notch-477511-g5
```

### Step 2: Grant Cloud Run Access to Secrets

```bash
# Get the Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe xenon-notch-477511-g5 --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant access to secrets
gcloud secrets add-iam-policy-binding gcp-storage-key \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --project=xenon-notch-477511-g5

gcloud secrets add-iam-policy-binding nextauth-secret \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --project=xenon-notch-477511-g5
```

### Step 3: Update Cloud Run to Use Secrets

Update your `ci-cd.yml` deployment step to include secrets:

```yaml
gcloud run deploy oneflow \
  --image="${IMAGE_TAG}" \
  --platform=managed \
  --region=${{ env.REGION }} \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,GCP_PROJECT_ID=xenon-notch-477511-g5,GCP_BUCKET_NAME=oneflow-storage,NEXTAUTH_URL=https://YOUR-SERVICE-URL" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,GCP_SERVICE_ACCOUNT_KEY=gcp-storage-key:latest,NEXTAUTH_SECRET=nextauth-secret:latest"
```

---

## Part 4: Update GitHub Actions Workflow

Your CI/CD pipeline needs to know the production URL. Update `.github/workflows/ci-cd.yml`:

### Before:
```yaml
--set-env-vars="NODE_ENV=production" \
--set-secrets="DATABASE_URL=DATABASE_URL:latest" \
```

### After:
```yaml
--set-env-vars="NODE_ENV=production,NEXTAUTH_URL=https://YOUR-SERVICE-URL,GCP_PROJECT_ID=xenon-notch-477511-g5,GCP_BUCKET_NAME=oneflow-storage" \
--set-secrets="DATABASE_URL=DATABASE_URL:latest,GCP_SERVICE_ACCOUNT_KEY=gcp-storage-key:latest,NEXTAUTH_SECRET=nextauth-secret:latest" \
```

Or use environment variables from secrets:

```yaml
env:
  PROJECT_ID: xenon-notch-477511-g5
  SERVICE_NAME: oneflow
  REGION: us-central1
  REGISTRY: us-central1-docker.pkg.dev
  SERVICE_URL: ${{ secrets.CLOUD_RUN_URL }}  # Add this to GitHub secrets
```

---

## Part 5: Verification Checklist

After deployment, verify everything works:

### ✅ 1. Check Environment Variables

```bash
gcloud run services describe oneflow \
  --region=us-central1 \
  --format='get(spec.template.spec.containers[0].env)' \
  --project=xenon-notch-477511-g5
```

### ✅ 2. Test Google OAuth Login

1. Go to your production URL
2. Click "Sign in with Google"
3. Should redirect correctly and log you in
4. Check that your profile picture loads from GCS

### ✅ 3. Test Image Upload

1. Log in to production
2. Go to Profile Settings
3. Upload a profile picture
4. Verify it uploads to GCS bucket
5. Check that it displays correctly

### ✅ 4. Check Service Logs

```bash
gcloud run services logs read oneflow \
  --region=us-central1 \
  --limit=50 \
  --project=xenon-notch-477511-g5
```

Look for:
- ✅ No "GCP_SERVICE_ACCOUNT_KEY not found" errors
- ✅ No "NEXTAUTH_URL" errors
- ✅ Successful OAuth callbacks

---

## Part 6: Troubleshooting

### Issue: "Redirect URI Mismatch" when logging in with Google

**Solution:**
1. Get your exact Cloud Run URL
2. Add it to Google OAuth Console with `/api/auth/callback/google` suffix
3. Make sure `NEXTAUTH_URL` in Cloud Run matches exactly

### Issue: "Failed to upload to GCS" in production

**Solution:**
1. Verify `GCP_SERVICE_ACCOUNT_KEY` is set correctly
2. Check the service account has "Storage Object Admin" role
3. Verify the bucket is public or service account has access

### Issue: "Session callback error" or "Invalid token"

**Solution:**
1. Ensure `NEXTAUTH_SECRET` is set in production
2. Should be a strong random string (not the same as development)
3. Generate a new one: `openssl rand -base64 32`

### Issue: Environment variables not updating

**Solution:**
```bash
# Force a new revision
gcloud run services update oneflow \
  --region=us-central1 \
  --update-env-vars="FORCE_UPDATE=$(date +%s)" \
  --project=xenon-notch-477511-g5
```

---

## Quick Commands Reference

### Get Service URL
```bash
gcloud run services describe oneflow --region=us-central1 --format='value(status.url)'
```

### View All Environment Variables
```bash
gcloud run services describe oneflow --region=us-central1 --format='yaml(spec.template.spec.containers[0].env)'
```

### View Service Logs
```bash
gcloud run services logs read oneflow --region=us-central1 --limit=100
```

### Manually Trigger Deployment
```bash
# Trigger via GitHub Actions
gh workflow run ci-cd.yml

# Or deploy directly
gcloud run deploy oneflow --source . --region=us-central1
```

### Update Single Environment Variable
```bash
gcloud run services update oneflow \
  --region=us-central1 \
  --update-env-vars="KEY=value"
```

### Remove Environment Variable
```bash
gcloud run services update oneflow \
  --region=us-central1 \
  --remove-env-vars="KEY"
```

---

## Security Best Practices

1. ✅ **Use Secret Manager** for sensitive data (service account keys, secrets)
2. ✅ **Rotate secrets regularly** (every 90 days)
3. ✅ **Use different secrets** for dev/staging/production
4. ✅ **Never commit secrets** to GitHub (they're in .gitignore)
5. ✅ **Limit service account permissions** (principle of least privilege)
6. ✅ **Enable Cloud Audit Logs** to track secret access
7. ✅ **Use HTTPS only** (Cloud Run does this by default)

---

## Next Steps

1. ✅ Update Google OAuth redirect URIs
2. ✅ Get your Cloud Run service URL
3. ✅ Set NEXTAUTH_URL in Cloud Run
4. ✅ Set GCP_SERVICE_ACCOUNT_KEY in Cloud Run
5. ✅ Test OAuth login on production
6. ✅ Test image upload on production
7. ✅ Update GitHub Actions workflow with production URL
8. ✅ Consider moving to Secret Manager for better security

---

## Support

If you encounter issues:

1. Check Cloud Run logs: `gcloud run services logs read oneflow --region=us-central1`
2. Verify environment variables are set
3. Test locally with production-like environment variables
4. Check Google Cloud Console for service account permissions
