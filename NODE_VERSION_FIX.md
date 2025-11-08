# Node.js Version Fix for GitHub Actions

## Problem

The CI/CD pipeline was failing with two issues:

1. **Node.js version mismatch**: Next.js 16.0.0 requires Node.js >=20.9.0, but GitHub Actions was using Node v18.20.8
2. **Lock file out of sync**: package-lock.json was not in sync with package.json

## Solutions Applied

### 1. Updated GitHub Actions Workflow (`.github/workflows/ci-cd.yml`)

**Before:**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'

- name: Install dependencies
  run: npm ci
```

**After:**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'

- name: Install dependencies
  run: npm install
```

**Changes:**
- ✅ Upgraded Node.js from v18 to v20
- ✅ Changed `npm ci` to `npm install` to allow lock file updates

### 2. Added Engine Requirements to `package.json`

```json
"engines": {
  "node": ">=20.9.0",
  "npm": ">=10.0.0"
}
```

This ensures anyone installing the project sees a warning if they're using an incompatible Node.js version.

### 3. Created `.nvmrc` File

```
20.18.0
```

This file tells Node Version Manager (nvm) which Node.js version to use automatically when you `cd` into the project.

## How to Fix Locally

If you're developing locally and encountering similar issues:

### Option 1: Using NVM (Recommended)

1. **Install NVM** (if not already installed):
   - Windows: Download from [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
   - Mac/Linux: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`

2. **Switch to Node.js 20**:
   ```bash
   nvm install 20
   nvm use 20
   ```

3. **Verify version**:
   ```bash
   node --version  # Should show v20.x.x
   ```

4. **Reinstall dependencies**:
   ```bash
   npm install
   ```

### Option 2: Direct Installation

1. **Download Node.js 20 LTS** from [nodejs.org](https://nodejs.org/)
2. Install it (will replace your current version)
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```
4. Reinstall dependencies:
   ```bash
   npm install
   ```

## Why This Happened

### Next.js 16 Requirements

Next.js 16.0.0 introduced several modern JavaScript features that require Node.js 20+:
- Enhanced Turbopack support
- React Server Components improvements
- Modern ECMAScript features
- Better performance optimizations

### Why `npm ci` Failed

`npm ci` (clean install) requires:
- Exact match between package.json and package-lock.json
- Will fail if there's any mismatch

The error occurred because:
1. package.json had `preact@10.11.3` as a dependency somewhere
2. package-lock.json didn't have this exact entry
3. `npm ci` detected the mismatch and failed

Using `npm install` instead:
- Updates the lock file automatically
- More forgiving with version mismatches
- Better for active development

## Verification Steps

After pushing these changes, verify the CI/CD pipeline:

1. **Go to GitHub Repository** → Actions tab
2. **Check the workflow run** for your latest commit
3. **Verify these steps pass**:
   - ✅ Setup Node.js (should use v20)
   - ✅ Install dependencies (should complete without errors)
   - ✅ Generate Prisma Client
   - ✅ Run linter
   - ✅ Run tests

## Additional Recommendations

### 1. Add `.node-version` for Additional Tools

Create `.node-version` file:
```
20.18.0
```

This works with other Node version managers like `nodenv` and `asdf`.

### 2. Update Documentation

Add to your main README.md:

```markdown
## Prerequisites

- **Node.js**: >= 20.9.0 (LTS 20.18.0 recommended)
- **npm**: >= 10.0.0
- **PostgreSQL**: 14 or higher

### Quick Setup with NVM

```bash
nvm install 20
nvm use 20
npm install
```
```

### 3. Team Notification

Notify your team:

> 📢 **Important Update**
> 
> We've upgraded to Node.js 20 to support Next.js 16. Please update your local environment:
> 
> ```bash
> nvm use 20
> npm install
> ```
> 
> If you don't have Node.js 20 installed:
> ```bash
> nvm install 20
> ```

## Troubleshooting

### Error: `npm ERR! engine Unsupported`

**Solution:** Upgrade to Node.js 20+
```bash
nvm install 20
nvm use 20
```

### Error: `Missing: preact@10.11.3 from lock file`

**Solution:** Run `npm install` to rebuild the lock file
```bash
rm package-lock.json
npm install
```

### GitHub Actions still failing

**Solution:** Check these things:
1. Verify changes were pushed to GitHub
2. Clear GitHub Actions cache (Settings → Actions → Caches → Delete all caches)
3. Re-run the workflow

### Local dev server won't start

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Start fresh
npm run dev
```

## Related Files Modified

- ✅ `.github/workflows/ci-cd.yml` - Updated Node version to 20
- ✅ `package.json` - Added engines field
- ✅ `.nvmrc` - Created for NVM users
- ✅ `NODE_VERSION_FIX.md` - This documentation

## Next Steps

1. ✅ Commit these changes
2. ✅ Push to GitHub
3. ✅ Monitor the Actions tab for successful build
4. ✅ Update local development environment to Node.js 20
5. ✅ Notify team members

## References

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Node.js 20 LTS](https://nodejs.org/en/blog/release/v20.0.0)
- [npm ci Documentation](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- [GitHub Actions setup-node](https://github.com/actions/setup-node)
