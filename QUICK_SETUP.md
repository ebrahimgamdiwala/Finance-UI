# 🚀 Quick Production Setup Guide

## TL;DR - Fast Setup

### Prerequisites
- ✅ Google Cloud CLI installed (`gcloud`)
- ✅ Logged in: `gcloud auth login`
- ✅ `service-account-key.json` in project root

### Option 1: Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
.\setup-production.ps1
```

**Mac/Linux:**
```bash
chmod +x setup-production.sh
./setup-production.sh
```

### Option 2: Manual Setup (5 Steps)

#### 1️⃣ Get Your Cloud Run URL
```bash
gcloud run services describe oneflow --region=us-central1 --format='value(status.url)'
```
Save this URL! Example: `https://oneflow-abc123.a.run.app`

#### 2️⃣ Create Secrets
```bash
# Storage credentials
cat service-account-key.json | gcloud secrets create GCP_STORAGE_KEY \
  --data-file=- --project=xenon-notch-477511-g5

# NextAuth secret
openssl rand -base64 32 | gcloud secrets create NEXTAUTH_SECRET \
  --data-file=- --project=xenon-notch-477511-g5
```

#### 3️⃣ Grant Permissions
```bash
PROJECT_NUMBER=$(gcloud projects describe xenon-notch-477511-g5 --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in GCP_STORAGE_KEY NEXTAUTH_SECRET DATABASE_URL; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --project=xenon-notch-477511-g5
done
```

#### 4️⃣ Add Google OAuth Redirect URI
1. Go to: https://console.cloud.google.com/apis/credentials?project=xenon-notch-477511-g5
2. Click your OAuth 2.0 Client ID
3. Add: `https://YOUR-CLOUD-RUN-URL/api/auth/callback/google`
4. Click **Save**

#### 5️⃣ Add GitHub Secret
1. Go to: https://github.com/ebrahimgamdiwala/OneFlow/settings/secrets/actions
2. Click **New repository secret**
3. Name: `NEXTAUTH_URL`
4. Value: `https://YOUR-CLOUD-RUN-URL`
5. Click **Add secret**

#### 6️⃣ Deploy
```bash
gcloud run services update oneflow \
  --region=us-central1 \
  --update-env-vars="NODE_ENV=production,NEXTAUTH_URL=https://YOUR-URL,GCP_PROJECT_ID=xenon-notch-477511-g5,GCP_BUCKET_NAME=oneflow-storage" \
  --update-secrets="DATABASE_URL=DATABASE_URL:latest,NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,GCP_SERVICE_ACCOUNT_KEY=GCP_STORAGE_KEY:latest" \
  --project=xenon-notch-477511-g5
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Service is running: `gcloud run services list`
- [ ] Environment variables set: Check Cloud Console
- [ ] Google OAuth works: Try logging in
- [ ] Image upload works: Upload profile picture
- [ ] No errors in logs: `gcloud run services logs read oneflow --region=us-central1`

---

## 🔧 Common Issues & Quick Fixes

### "Redirect URI mismatch"
**Fix:** Ensure `YOUR-URL/api/auth/callback/google` is added to Google OAuth Console

### "Failed to upload to GCS"
**Fix:** Check `GCP_SERVICE_ACCOUNT_KEY` secret exists and service account has Storage Admin role

### "Invalid session"
**Fix:** Ensure `NEXTAUTH_SECRET` is set in Cloud Run

### Environment vars not updating
**Fix:** Force new revision:
```bash
gcloud run services update oneflow --region=us-central1 --update-env-vars="FORCE=$(date +%s)"
```

---

## 📚 Detailed Documentation

- **Full Setup Guide:** `PRODUCTION_SETUP.md`
- **GCP Storage Setup:** `GCP_STORAGE_SETUP.md`
- **Node.js Version Fix:** `NODE_VERSION_FIX.md`

---

## 🆘 Need Help?

1. Check logs: `gcloud run services logs read oneflow --region=us-central1 --limit=50`
2. Review `PRODUCTION_SETUP.md` for detailed troubleshooting
3. Verify all secrets exist: `gcloud secrets list --project=xenon-notch-477511-g5`

---

## 🎯 What's Configured

After running setup, you'll have:

✅ **Secrets in Secret Manager:**
- `GCP_STORAGE_KEY` - Service account for Cloud Storage
- `NEXTAUTH_SECRET` - NextAuth session encryption
- `DATABASE_URL` - PostgreSQL connection (should already exist)

✅ **Environment Variables in Cloud Run:**
- `NODE_ENV=production`
- `NEXTAUTH_URL` - Your Cloud Run URL
- `GCP_PROJECT_ID` - Your GCP project
- `GCP_BUCKET_NAME` - Storage bucket name

✅ **GitHub Secrets:**
- `NEXTAUTH_URL` - For CI/CD deployments
- `GCP_SA_KEY` - For deployment (should already exist)

✅ **Google OAuth:**
- Redirect URI configured for production

---

## 🚀 Deploy Changes

After making code changes:

```bash
git add .
git commit -m "your changes"
git push
```

GitHub Actions will automatically deploy to Cloud Run! 🎉
