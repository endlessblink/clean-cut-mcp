#!/bin/bash

# Google Cloud Run Deployment Script for Clean-Cut-MCP
# Prerequisites: gcloud CLI, Docker installed

set -e

# Configuration
PROJECT_ID="${1:-your-gcp-project-id}"
REGION="${2:-us-central1}"
SERVICE_NAME="clean-cut-mcp"
IMAGE_NAME="clean-cut-mcp"
IMAGE_TAG="${3:-latest}"

echo "🚀 Deploying Clean-Cut-MCP to Google Cloud Run..."

# Set current project
echo "🔧 Setting up GCP project..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo "📋 Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable file.googleapis.com

# Build and push Docker image to Google Container Registry
echo "📦 Building and pushing Docker image..."
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG} .

# Create Filestore instance for persistent storage (if needed)
echo "💾 Setting up Filestore for persistent storage..."
gcloud filestore instances list --region=${REGION} || \
gcloud filestore instances create clean-cut-mcp-storage \
  --project=${PROJECT_ID} \
  --location=${REGION} \
  --zone=${REGION}-a \
  --tier=BASIC_HDD \
  --file-share=name=exports,capacity=1024GB \
  --file-share=name=workspace,capacity=1024GB

# Get Filestore instance details
FILESTORE_IP=$(gcloud filestore instances describe clean-cut-mcp-storage \
  --location=${REGION} \
  --zone=${REGION}-a \
  --format='value(networks.ipAddresses[0])')

# Deploy to Cloud Run
echo "🔄 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image=gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG} \
  --region=${REGION} \
  --platform=managed \
  --allow-unauthenticated \
  --port=6970 \
  --memory=4Gi \
  --cpu=2 \
  --max-instances=10 \
  --min-instances=0 \
  --set-env-vars="NODE_ENV=production,DOCKER_CONTAINER=true,REMOTION_STUDIO_PORT=6970" \
  --set-mounts="/workspace=clean-cut-mcp-workspace,/workspace/out=clean-cut-mcp-exports" \
  --set-vpc-access-connector="projects/${PROJECT_ID}/locations/${REGION}/connectors/clean-cut-mcp-connector" \
  --timeout=3600

# Create VPC Access Connector (if needed)
echo "🌐 Setting up VPC Access Connector..."
gcloud compute networks vpc-access connectors describe clean-cut-mcp-connector \
  --region=${REGION} || \
gcloud compute networks vpc-access connectors create clean-cut-mcp-connector \
  --region=${REGION} \
  --network=default \
  --range=10.8.0.0/28

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --region=${REGION} \
  --format='value(status.url)')

# Create Cloud Storage bucket for exports backup
echo "💾 Setting up Cloud Storage for exports..."
gsutil mb -p ${PROJECT_ID} gs://${PROJECT_ID}-clean-cut-exports || echo "Bucket already exists"

# Create Cloud Scheduler job for backups (optional)
echo "⏰ Setting up backup scheduler..."
gcloud scheduler jobs describe clean-cut-mcp-backup \
  --location=${REGION} || \
gcloud scheduler jobs create http clean-cut-mcp-backup \
  --schedule="0 2 * * *" \
  --http-method=POST \
  --uri=${SERVICE_URL}/backup \
  --time-zone="UTC" \
  --location=${REGION}

# Set up IAM permissions for Cloud Build
echo "🔐 Setting up IAM permissions..."
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create firewall rules for Filestore access
echo "🔥 Setting up firewall rules..."
gcloud compute firewall-rules describe allow-filestore \
  --project=${PROJECT_ID} || \
gcloud compute firewall-rules create allow-filestore \
  --project=${PROJECT_ID} \
  --network=default \
  --action=ALLOW \
  --rules=tcp:2049 \
  --source-ranges=10.8.0.0/28

echo "✅ Deployment complete!"
echo "🌐 Remotion Studio available at: ${SERVICE_URL}"
echo "💾 Filestore IP: ${FILESTORE_IP}"
echo "📦 Container Registry: gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG}"
echo "🪣 Storage bucket: gs://${PROJECT_ID}-clean-cut-exports"

# Create monitoring dashboard (optional)
echo "📊 Setting up monitoring..."
gcloud monitoring dashboards create --config-from-file=<(cat << EOF
{
  "displayName": "Clean-Cut-MCP Dashboard",
  "gridLayout": {
    "columns": "2",
    "widgets": [
      {
        "title": "Request Count",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "prometheusQueryEndpoint": {
                "query": "cloudrun.googleapis.com/request_count"
              }
            },
            "plotType": "LINE",
            "legendTemplate": "instance {{instance}}"
          }],
          "timeshiftDuration": "0s",
          "yAxis": {
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "Memory Usage",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "prometheusQueryEndpoint": {
                "query": "cloudrun.googleapis.com/container/memory/usage"
              }
            },
            "plotType": "LINE",
            "legendTemplate": "instance {{instance}}"
          }],
          "timeshiftDuration": "0s",
          "yAxis": {
            "scale": "LINEAR"
          }
        }
      }
    ]
  }
}
EOF
)

echo "🎉 Clean-Cut-MCP is now running on Google Cloud Run!"
echo ""
echo "📋 Next steps:"
echo "1. Visit ${SERVICE_URL} to access Remotion Studio"
echo "2. Configure your MCP client to connect to the deployed service"
echo "3. Set up custom domain and SSL if needed"
echo "4. Configure monitoring and alerts"