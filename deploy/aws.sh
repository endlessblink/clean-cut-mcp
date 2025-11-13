#!/bin/bash

# AWS ECS Deployment Script for Clean-Cut-MCP
# Prerequisites: AWS CLI, Docker, ECS CLI installed

set -e

# Configuration
CLUSTER_NAME="clean-cut-mcp-cluster"
SERVICE_NAME="clean-cut-mcp-service"
TASK_FAMILY="clean-cut-mcp-task"
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
IMAGE_NAME="clean-cut-mcp"
IMAGE_TAG="${1:-latest}"

echo "🚀 Deploying Clean-Cut-MCP to AWS ECS..."

# Build and push Docker image to ECR
echo "📦 Building and pushing Docker image..."
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Create ECR repository if it doesn't exist
aws ecr describe-repositories --repository-names ${IMAGE_NAME} --region ${REGION} || \
aws ecr create-repository --repository-name ${IMAGE_NAME} --region ${REGION}

# Build and push image
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
docker push ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}

# Create ECS cluster if it doesn't exist
echo "🔧 Setting up ECS cluster..."
aws ecs describe-clusters --clusters ${CLUSTER_NAME} --region ${REGION} || \
aws ecs create-cluster --cluster-name ${CLUSTER_NAME} --region ${REGION}

# Create or update task definition
echo "📋 Creating task definition..."
cat > task-definition.json << EOF
{
  "family": "${TASK_FAMILY}",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "3072",
  "executionRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "clean-cut-mcp",
      "image": "${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}",
      "portMappings": [
        {
          "containerPort": 6970,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DOCKER_CONTAINER",
          "value": "true"
        },
        {
          "name": "REMOTION_STUDIO_PORT",
          "value": "6970"
        }
      ],
      "mountPoints": [
        {
          "sourceVolume": "clean-cut-exports",
          "containerPath": "/workspace/out"
        },
        {
          "sourceVolume": "clean-cut-workspace",
          "containerPath": "/workspace"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/clean-cut-mcp",
          "awslogs-region": "${REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:6970 || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ],
  "volumes": [
    {
      "name": "clean-cut-exports",
      "efsVolumeConfiguration": {
        "fileSystemId": "${EFS_FILESYSTEM_ID}",
        "rootDirectory": "/exports"
      }
    },
    {
      "name": "clean-cut-workspace",
      "efsVolumeConfiguration": {
        "fileSystemId": "${EFS_FILESYSTEM_ID}",
        "rootDirectory": "/workspace"
      }
    }
  ]
}
EOF

# Register task definition
TASK_REVISION=$(aws ecs register-task-definition --cli-input-json file://task-definition.json --region ${REGION} | \
                jq --raw-output '.taskDefinition.revision')

# Create or update service
echo "🔄 Creating/updating ECS service..."
aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --region ${REGION} || \
SERVICE_CREATED=false

if [ "$SERVICE_CREATED" = false ]; then
  # Create new service
  aws ecs create-service \
    --cluster ${CLUSTER_NAME} \
    --service-name ${SERVICE_NAME} \
    --task-definition ${TASK_FAMILY}:${TASK_REVISION} \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS}],securityGroups=[${SECURITY_GROUP_IDS}],assignPublicIp=ENABLED}" \
    --region ${REGION}
else
  # Update existing service
  aws ecs update-service \
    --cluster ${CLUSTER_NAME} \
    --service-name ${SERVICE_NAME} \
    --task-definition ${TASK_FAMILY}:${TASK_REVISION} \
    --force-new-deployment \
    --region ${REGION}
fi

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --region ${REGION}

# Get service details
SERVICE_ARN=$(aws ecs describe-services \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --region ${REGION} | \
  jq --raw-output '.services[0].serviceArn')

# Create Network Load Balancer if needed
echo "🌐 Setting up Network Load Balancer..."
aws elbv2 describe-load-balancers --names ${CLUSTER_NAME}-nlb --region ${REGION} || \
NLB_ARN=$(aws elbv2 create-load-balancer \
  --name ${CLUSTER_NAME}-nlb \
  --type network \
  --scheme internet-facing \
  --subnets ${SUBNET_IDS} \
  --region ${REGION} | \
  jq --raw-output '.LoadBalancers[0].LoadBalancerArn')

# Create target group
TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
  --name ${CLUSTER_NAME}-tg \
  --protocol TCP \
  --port 6970 \
  --target-type ip \
  --vpc-id ${VPC_ID} \
  --health-check-protocol TCP \
  --health-check-port 6970 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --health-check-timeout-seconds 10 \
  --health-check-interval-seconds 30 \
  --region ${REGION} | \
  jq --raw-output '.TargetGroups[0].TargetGroupArn')

# Create listener
aws elbv2 describe-listeners --load-balancer-arn ${NLB_ARN} --region ${REGION} || \
aws elbv2 create-listener \
  --load-balancer-arn ${NLB_ARN} \
  --protocol TCP \
  --port 6970 \
  --default-actions Type=forward,TargetGroupArn=${TARGET_GROUP_ARN} \
  --region ${REGION}

# Get load balancer DNS name
NLB_DNS=$(aws elbv2 describe-load-balancers \
  --names ${CLUSTER_NAME}-nlb \
  --region ${REGION} | \
  jq --raw-output '.LoadBalancers[0].DNSName')

echo "✅ Deployment complete!"
echo "🌐 Remotion Studio available at: http://${NLB_DNS}:6970"
echo "📊 Service ARN: ${SERVICE_ARN}"
echo "📦 Task Definition: ${TASK_FAMILY}:${TASK_REVISION}"

# Clean up
rm -f task-definition.json

echo "🎉 Clean-Cut-MCP is now running on AWS ECS!"