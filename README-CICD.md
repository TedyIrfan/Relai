# 🚀 RelAI - CI/CD Documentation

> **GitHub Actions Workflow** for automated testing, building, and deployment preparation.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Workflow Triggers](#workflow-triggers)
- [Jobs Explanation](#jobs-explanation)
- [Required Secrets](#required-secrets)
- [Usage](#usage)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This CI/CD pipeline automates the following:

```
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Actions (CI/CD)                     │
│  ──────────────────────────────────────────────────────────────  │
│                                                                   │
│  Push/PR to GitHub ──►                                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Job 1: Backend Tests                                   │     │
│  │  • PHP 8.4 setup                                        │     │
│  │  • Composer install                                    │     │
│  │  • PHPUnit tests                                       │     │
│  └────────────────────────────────────────────────────────┘     │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Job 2: Frontend Build                                  │     │
│  │  • Node.js 20 setup                                     │     │
│  │  • npm install                                          │     │
│  │  • Linter check (optional)                             │     │
│  │  • Production build                                     │     │
│  │  • Upload artifact (dist/)                             │     │
│  └────────────────────────────────────────────────────────┘     │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Job 3: Docker Build & Push                             │     │
│  │  • Login to GHCR                                        │     │
│  │  • Build production image                              │     │
│  │  • Push to GitHub Container Registry                   │     │
│  │  • Tag with branch/commit/latest                       │     │
│  └────────────────────────────────────────────────────────┘     │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Job 4: Package Artifacts (main only)                   │     │
│  │  • Download frontend build                             │     │
│  │  • Merge with backend                                  │     │
│  │  • Create deployment tarball                           │     │
│  │  • Upload release artifact                            │     │
│  │  • Generate release summary                           │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔁 Workflow Triggers

The CI/CD pipeline runs on:

| Event | Branches | Description |
|-------|----------|-------------|
| `push` | `main`, `develop` | Every push triggers full pipeline |
| `pull_request` | `main`, `develop` | PRs run tests & build (no deploy package) |
| `workflow_dispatch` | - | Manual trigger from GitHub Actions UI |

---

## 📦 Jobs Explanation

### Job 1: Backend Tests

**Purpose:** Run Laravel test suite

**Steps:**
1. Checkout code
2. Setup PHP 8.4 with required extensions
3. Copy `.env.example` to `.env`
4. Install Composer dependencies
5. Run PHPUnit tests

**Output:** ✅ Tests pass/fail

**Run Time:** ~2-3 minutes

---

### Job 2: Frontend Build

**Purpose:** Build React frontend for production

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (npm ci)
4. Run linter (optional, doesn't fail build)
5. Build with `npm run build`
6. Upload `dist/` artifact

**Output:** ✅ `frontend-dist` artifact

**Run Time:** ~2-3 minutes

---

### Job 3: Docker Build & Push

**Purpose:** Build and push Docker image to GHCR

**Steps:**
1. Checkout code
2. Setup Docker Buildx
3. Login to GitHub Container Registry
4. Extract metadata (tags, labels)
5. Build production image
6. Push to GHCR with multiple tags:
   - `ghcr.io/owner/repo:latest` (main branch)
   - `ghcr.io/owner/repo:main-<sha>` (commit SHA)
   - `ghcr.io/owner/repo:develop-<sha>` (develop branch)

**Output:** ✅ Docker image at `ghcr.io/<username>/relai:latest`

**Run Time:** ~5-8 minutes

**Image Tags Example:**
```bash
ghcr.io/irfan/relai:latest          # Latest from main
ghcr.io/irfan/relai:main-a1b2c3d4   # Specific commit
ghcr.io/irfan/relai:develop-x9y8z7  # From develop branch
```

---

### Job 4: Package Artifacts (main only)

**Purpose:** Create deployment-ready package

**Runs on:** Push to `main` branch only

**Steps:**
1. Download frontend artifact
2. Merge frontend → backend/public
3. Create tarball with all files needed for deployment
4. Upload `relai-deploy.tar.gz` artifact
5. Generate release summary

**Output:** ✅ `deployment-package` artifact

**Retention:** 30 days

---

## 🔐 Required Secrets

**No secrets required!** ✅

The workflow uses:
- `GITHUB_TOKEN` (automatically provided by GitHub)
- GitHub Container Registry (GHCR) for Docker images

**Optional Secrets (for VPS deploy):**

| Secret | Description | Example |
|--------|-------------|---------|
| `VPS_HOST` | VPS IP address or hostname | `123.45.67.89` |
| `VPS_USERNAME` | SSH username | `root` or `ubuntu` |
| `VPS_SSH_KEY` | Private SSH key | `-----BEGIN RSA PRIVATE KEY-----...` |
| `VPS_PORT` | SSH port (optional) | `22` |

---

## 📖 Usage

### Automatic Run

The pipeline runs automatically on:
- Every push to `main` or `develop`
- Every pull request to `main` or `develop`

### Manual Run

1. Go to **Actions** tab in GitHub
2. Select **CI/CD Pipeline**
3. Click **Run workflow**
4. Select branch
5. Click **Run workflow** button

---

## 🚀 Deployment Guide

### Option A: Deploy Using Docker Image (Recommended)

#### Step 1: Prepare VPS

```bash
# Connect to VPS
ssh user@your-vps-ip

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### Step 2: Pull Docker Image

```bash
# Login to GHCR (requires GitHub personal access token)
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Pull latest image
docker pull ghcr.io/your-username/relai:latest
```

#### Step 3: Deploy

```bash
# Clone repository (or download deployment package)
git clone https://github.com/your-username/relai.git
cd relai

# Setup environment
cp backend/.env.prod.example backend/.env
nano backend/.env  # Edit with your values

# Start containers
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Run seeder
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force
```

---

### Option B: Deploy Using Artifact Package

#### Step 1: Download Artifact

```bash
# From GitHub Actions page, download:
# - deployment-package (relai-deploy.tar.gz)

# Or use GitHub CLI
gh release download --pattern relai-deploy.tar.gz
```

#### Step 2: Extract & Deploy

```bash
# Extract
tar -xzf relai-deploy.tar.gz
cd relai

# Setup environment
cp backend/.env.prod.example backend/.env
nano backend/.env

# Start containers
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
```

---

## 🔧 Troubleshooting

### Job Failures

#### Backend Tests Failed

**Check:**
- Are all dependencies in `composer.json`?
- Is `.env.example` up to date?
- Are tests passing locally?

```bash
cd backend
composer test
```

#### Frontend Build Failed

**Check:**
- Is `package.json` valid?
- Are all dependencies available?
- Build working locally?

```bash
cd frontend
npm run build
```

#### Docker Build Failed

**Check:**
- Is `Dockerfile.prod` valid?
- Is build context correct?
- Any syntax errors in Dockerfile?

```bash
cd backend
docker build -f Dockerfile.prod -t test .
```

---

### Permission Issues

#### Error: Permission denied (publickey)

**Solution:**
```bash
# Add SSH key to GitHub
# Settings → SSH and GPG keys → New SSH key

# Or use Personal Access Token for HTTPS
git clone https://TOKEN@github.com/username/repo.git
```

---

### Image Pull Issues

#### Error: unauthorized: authentication required

**Solution:**
```bash
# Create Personal Access Token:
# GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
# Scope: `read:packages`, `write:packages`

# Login with token
echo YOUR_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

---

## 📊 Workflow Status Badge

Add to your `README.md`:

```markdown
![CI/CD](https://github.com/your-username/relai/actions/workflows/ci.yml/badge.svg)
```

Example:
```markdown
# RelAI

[![CI/CD](https://github.com/irfan/relai/actions/workflows/ci.yml/badge.svg)](https://github.com/irfan/relai/actions/workflows/ci.yml)
```

---

## 🔄 Next Steps

After CI/CD is working:

1. ✅ Tests run automatically
2. ✅ Docker images built automatically
3. ✅ Deployment packages created automatically
4. ⏳ **[Optional] Setup VPS and deploy**
5. ⏳ **[Optional] Setup custom domain**
6. ⏳ **[Optional] Setup SSL certificates**

---

## 📚 Related Documentation

- [DEPLOYMENT-PROGRESS.md](./DEPLOYMENT-PROGRESS.md) - Overall deployment progress
- [README.md](./README.md) - Main project documentation
- [backend/Dockerfile.prod](./backend/Dockerfile.prod) - Production Dockerfile
- [backend/docker-compose.prod.yml](./backend/docker-compose.prod.yml) - Production compose file

---

*Last updated: 2026-01-30*
