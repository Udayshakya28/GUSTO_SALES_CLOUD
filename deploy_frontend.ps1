
Write-Host "Starting Frontend Deployment..."

# 1. Build
Write-Host "Building Docker Image..."
# Using dummy DB URL to bypass build-time validation if any
docker build -t gcr.io/mmmbackend-prod/frontend `
    --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y29taWMtc2hlZXBkb2ctMTkuY2xlcmsuYWNjb3VudHMuZGV2JA `
    --build-arg DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" `
    -f Dockerfile.frontend .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed."
    exit 1
}

# 2. Push
Write-Host "Pushing Image to GCR..."
docker push gcr.io/mmmbackend-prod/frontend

if ($LASTEXITCODE -ne 0) {
    Write-Error "Push failed."
    exit 1
}

# 3. Deploy
Write-Host "Deploying to Cloud Run..."
# We use the env variables stored in env.yaml for consistency.
# Removed conflicting --set-env-vars flag.

gcloud run deploy frontend `
    --image gcr.io/mmmbackend-prod/frontend `
    --region us-central1 `
    --platform managed `
    --allow-unauthenticated `
    --env-vars-file env.yaml

Write-Host "Frontend Deployment Complete!"
