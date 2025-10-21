#!/bin/bash

# Docker Hub Deployment Script for API Rate Limiter
# Usage: ./deploy-dockerhub.sh [your-dockerhub-username]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME=${1:-"your-dockerhub-username"}
APP_NAME="api-rate-limiter"
LOCAL_IMAGE="api_rate_limiter-api-rate-limiter"
VERSION=${2:-"latest"}

echo -e "${BLUE}=== Docker Hub Deployment Script ===${NC}"
echo -e "${YELLOW}App Name: ${APP_NAME}${NC}"
echo -e "${YELLOW}Docker Hub Username: ${DOCKER_USERNAME}${NC}"
echo -e "${YELLOW}Version: ${VERSION}${NC}"
echo

# Check if username is provided
if [ "$DOCKER_USERNAME" = "your-dockerhub-username" ]; then
    echo -e "${RED}❌ Error: Please provide your Docker Hub username${NC}"
    echo -e "${YELLOW}Usage: ./deploy-dockerhub.sh YOUR_DOCKERHUB_USERNAME [version]${NC}"
    echo -e "${YELLOW}Example: ./deploy-dockerhub.sh john123 v1.0.0${NC}"
    exit 1
fi

# Step 1: Build the latest image
echo -e "${BLUE}🏗️  Step 1: Building the Docker image...${NC}"
sudo docker-compose build api-rate-limiter

# Step 2: Login to Docker Hub
echo -e "${BLUE}🔐 Step 2: Logging in to Docker Hub...${NC}"
echo -e "${YELLOW}Please enter your Docker Hub credentials:${NC}"
sudo docker login

# Step 3: Tag the image
echo -e "${BLUE}🏷️  Step 3: Tagging the image...${NC}"
sudo docker tag ${LOCAL_IMAGE}:latest ${DOCKER_USERNAME}/${APP_NAME}:${VERSION}

# Also tag as latest if version is not latest
if [ "$VERSION" != "latest" ]; then
    sudo docker tag ${LOCAL_IMAGE}:latest ${DOCKER_USERNAME}/${APP_NAME}:latest
    echo -e "${GREEN}✅ Tagged as both ${VERSION} and latest${NC}"
else
    echo -e "${GREEN}✅ Tagged as ${VERSION}${NC}"
fi

# Step 4: Push the image
echo -e "${BLUE}🚀 Step 4: Pushing to Docker Hub...${NC}"
sudo docker push ${DOCKER_USERNAME}/${APP_NAME}:${VERSION}

if [ "$VERSION" != "latest" ]; then
    sudo docker push ${DOCKER_USERNAME}/${APP_NAME}:latest
fi

# Step 5: Verification
echo -e "${BLUE}✅ Step 5: Verifying deployment...${NC}"
echo -e "${GREEN}🎉 Successfully deployed to Docker Hub!${NC}"
echo
echo -e "${YELLOW}Your image is now available at:${NC}"
echo -e "${GREEN}📦 https://hub.docker.com/r/${DOCKER_USERNAME}/${APP_NAME}${NC}"
echo
echo -e "${YELLOW}To pull and run your image anywhere:${NC}"
echo -e "${BLUE}docker pull ${DOCKER_USERNAME}/${APP_NAME}:${VERSION}${NC}"
echo -e "${BLUE}docker run -p 3000:3000 ${DOCKER_USERNAME}/${APP_NAME}:${VERSION}${NC}"
echo
echo -e "${YELLOW}To use with docker-compose, update your docker-compose.yml:${NC}"
echo -e "${BLUE}services:${NC}"
echo -e "${BLUE}  api-rate-limiter:${NC}"
echo -e "${BLUE}    image: ${DOCKER_USERNAME}/${APP_NAME}:${VERSION}${NC}"
echo -e "${BLUE}    # Remove the 'build: .' line${NC}"

# Clean up local images if desired
echo
read -p "Do you want to remove the local untagged images to save space? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🧹 Cleaning up dangling images...${NC}"
    sudo docker image prune -f
    echo -e "${GREEN}✅ Cleanup completed${NC}"
fi

echo -e "${GREEN}🚀 Deployment completed successfully!${NC}"
