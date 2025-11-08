# Google Cloud Storage Setup Guide for OneFlow

This guide will help you set up Google Cloud Storage for storing user profile images and other files in OneFlow.

## Prerequisites

- A Google Cloud Platform (GCP) account
- GCP Project created
- Billing enabled on your GCP project

## Step 1: Create a GCP Project (If you don't have one)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name (e.g., "oneflow-project")
5. Click "Create"

## Step 2: Enable Cloud Storage API

1. Go to [API Library](https://console.cloud.google.com/apis/library)
2. Search for "Cloud Storage"
3. Click on "Cloud Storage API"
4. Click "Enable"

## Step 3: Create a Storage Bucket

1. Go to [Cloud Storage Browser](https://console.cloud.google.com/storage/browser)
2. Click "Create Bucket"
3. Configure your bucket:
   - **Name**: `oneflow-storage` (or your preferred name, must be globally unique)
   - **Location type**: 
     - Choose "Region" for better performance and lower costs
     - Select your nearest region (e.g., `asia-south1` for India)
   - **Storage class**: Standard
   - **Access control**: Uniform (recommended)
   - **Protection tools**: None (or configure as needed)
4. Click "Create"

## Step 4: Make Bucket Public (For Profile Images)

1. Select your bucket from the list
2. Go to the "Permissions" tab
3. Click "Grant Access"
4. In "New principals", add: `allUsers`
5. In "Role", select: "Storage Object Viewer"
6. Click "Save"
7. Confirm by clicking "Allow Public Access"

> ⚠️ **Security Note**: This makes uploaded files publicly accessible via URL. For private files, skip this step and use signed URLs instead.

## Step 5: Create a Service Account

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Fill in details:
   - **Name**: `oneflow-storage-service`
   - **Description**: "Service account for OneFlow storage operations"
4. Click "Create and Continue"
5. Grant role: "Storage Admin" or "Storage Object Admin"
6. Click "Continue" then "Done"

## Step 6: Generate Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. The JSON key file will download automatically
7. **IMPORTANT**: Keep this file secure and never commit it to version control!

## Step 7: Configure OneFlow Environment Variables

### For Local Development:

1. Place the downloaded JSON key file in your project root (e.g., `service-account-key.json`)
2. Add it to `.gitignore`:
   ```
   service-account-key.json
   ```

3. Update your `.env` file:
   ```env
   # Google Cloud Storage Configuration
   GCP_PROJECT_ID="your-project-id"
   GCP_BUCKET_NAME="oneflow-storage"
   GCP_KEY_FILE="./service-account-key.json"
   ```

### For Production (Cloud Run, GKE, GCE):

If deploying to Google Cloud services, you can use default credentials:

1. Update your `.env` file:
   ```env
   # Google Cloud Storage Configuration
   GCP_PROJECT_ID="your-project-id"
   GCP_BUCKET_NAME="oneflow-storage"
   # GCP_KEY_FILE is not needed - default credentials will be used
   ```

2. Attach the service account to your compute instance or Cloud Run service

## Step 8: Update Storage Utility (If Needed)

The `lib/storage.js` file is already configured. If you used a service account key file, uncomment this line in `lib/storage.js`:

```javascript
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE, // Uncomment this line
});
```

## Step 9: Test the Setup

1. Start your Next.js app:
   ```bash
   npm run dev
   ```

2. Go to the profile page: `http://localhost:3000/dashboard/profile`
3. Try uploading a profile picture
4. Check your GCS bucket to see if the file was uploaded

## Folder Structure in GCS

The storage utility organizes files as follows:

```
oneflow-storage/
├── avatars/
│   ├── {userId}/
│   │   ├── uuid-1.jpg
│   │   └── uuid-2.png
├── documents/
│   └── {userId}/
│       └── uuid-3.pdf
└── attachments/
    └── {userId}/
        └── uuid-4.doc
```

## Cost Estimation

### Storage Costs (Regional - asia-south1):
- Storage: $0.020 per GB per month
- Class A operations (write): $0.05 per 10,000 operations
- Class B operations (read): $0.004 per 10,000 operations

### Example Monthly Cost:
- 100 users × 1 MB avatar = 100 MB ≈ $0.002
- 1,000 uploads (Class A) ≈ $0.005
- 10,000 views (Class B) ≈ $0.004
- **Total**: ~$0.011/month

### Free Tier:
Google Cloud offers a free tier with:
- 5 GB of Regional Storage per month
- 5,000 Class A operations per month
- 50,000 Class B operations per month

## Security Best Practices

1. **Never commit service account keys** to version control
2. **Use environment variables** for all sensitive configuration
3. **Implement file validation** (already done in the API route):
   - File type validation
   - File size limits (5MB for images, 10MB for documents)
4. **Use signed URLs** for private files instead of public access
5. **Rotate service account keys** periodically
6. **Monitor bucket access** in Cloud Console

## Troubleshooting

### Error: "Could not load the default credentials"
- Make sure `GCP_KEY_FILE` path is correct
- Ensure the service account key file exists
- Check that the file has proper read permissions

### Error: "Permission denied"
- Verify the service account has "Storage Admin" role
- Check that the bucket name is correct
- Ensure the API is enabled

### Error: "Bucket does not exist"
- Verify the bucket name in `.env` matches your GCS bucket
- Check that you're using the correct GCP project

### Files not appearing in bucket
- Check Cloud Storage browser in GCP Console
- Verify the API route is receiving the file correctly
- Check server logs for upload errors

## Additional Features

The storage utility (`lib/storage.js`) provides these functions:

1. **uploadAvatar()** - Upload user profile pictures
2. **uploadFile()** - Upload any file (documents, attachments, receipts)
3. **deleteFromGCS()** - Delete files from storage
4. **extractPathFromUrl()** - Get file path from public URL

## Next Steps

- Implement file deletion when users update their avatar
- Add support for document uploads (for expense receipts, task attachments)
- Implement signed URLs for private files
- Set up lifecycle policies to auto-delete old files
- Add image optimization (resize, compress) before upload

## Useful Links

- [Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Cloud Storage Pricing](https://cloud.google.com/storage/pricing)
- [Node.js Client Library](https://googleapis.dev/nodejs/storage/latest/)
- [Best Practices](https://cloud.google.com/storage/docs/best-practices)
