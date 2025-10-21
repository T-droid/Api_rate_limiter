#!/bin/bash

# API Rate Limiter Docker Deployment Script

set -e

echo "🚀 API Rate Limiter Docker Deployment"
echo "======================================"

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to display usage
usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development environment with admin interfaces"
    echo "  prod        Start production environment"
    echo "  stop        Stop all services"
    echo "  logs        Show logs for all services"
    echo "  status      Show status of all services"
    echo "  clean       Stop and remove all containers and volumes (⚠️  DESTRUCTIVE)"
    echo "  backup      Backup MongoDB and Redis data"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev      # Start development environment"
    echo "  $0 prod     # Start production environment"
    echo "  $0 logs     # View logs"
    echo "  $0 stop     # Stop all services"
}

# Function to start development environment
start_dev() {
    echo "🔧 Starting development environment..."
    echo "This includes admin interfaces for MongoDB and Redis"
    
    if [ ! -f .env.docker ]; then
        echo "❌ .env.docker file not found. Creating from template..."
        cp .env.docker.example .env.docker 2>/dev/null || echo "Please create .env.docker file"
        exit 1
    fi
    
    sudo docker-compose up -d
    
    echo ""
    echo "✅ Development environment started successfully!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   API Application:    http://localhost:3000"
    echo "   MongoDB Admin:      http://localhost:8081 (admin/admin123)"
    echo "   Redis Admin:        http://localhost:8082"
    echo ""
    echo "📊 To view logs: $0 logs"
    echo "🛑 To stop:      $0 stop"
}

# Function to start production environment
start_prod() {
    echo "🏭 Starting production environment..."
    echo "Admin interfaces are disabled for security"
    
    if [ ! -f .env.docker ]; then
        echo "❌ .env.docker file not found. Please create it first."
        exit 1
    fi
    
    # Check for default passwords
    if grep -q "admin123\|redis123\|your-jwt-secret" .env.docker; then
        echo "⚠️  WARNING: You are using default passwords!"
        echo "Please update .env.docker with secure credentials before production deployment."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    sudo docker-compose -f docker-compose.prod.yml up -d
    
    echo ""
    echo "✅ Production environment started successfully!"
    echo ""
    echo "🌐 Access URL:"
    echo "   API Application: http://localhost:3000"
    echo ""
    echo "📊 To view logs: $0 logs"
    echo "🛑 To stop:      $0 stop"
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping all services..."
    sudo docker-compose down
    sudo docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    echo "✅ All services stopped"
}

# Function to show logs
show_logs() {
    echo "📊 Showing logs for all services..."
    echo "Press Ctrl+C to exit"
    sudo docker-compose logs -f
}

# Function to show status
show_status() {
    echo "📋 Service Status:"
    echo "=================="
    sudo docker-compose ps
    
    echo ""
    echo "💾 Volume Usage:"
    echo "================"
    sudo docker volume ls | grep api-rate-limiter || echo "No volumes found"
    
    echo ""
    echo "🌐 Network Status:"
    echo "=================="
    sudo docker network ls | grep api-rate-limiter || echo "No networks found"
}

# Function to clean everything
clean_all() {
    echo "⚠️  WARNING: This will remove all containers, volumes, and data!"
    read -p "Are you sure? Type 'yes' to confirm: " -r
    if [[ $REPLY == "yes" ]]; then
        echo "🧹 Cleaning up everything..."
        sudo docker-compose down -v --remove-orphans
        sudo docker-compose -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
        sudo docker system prune -f
        echo "✅ Cleanup completed"
    else
        echo "Cleanup cancelled"
    fi
}

# Function to backup data
backup_data() {
    echo "💾 Creating backup..."
    
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    echo "Backing up MongoDB..."
    sudo docker exec api-rate-limiter-mongodb mongodump --db api_rate_limiter --out /tmp/backup 2>/dev/null || true
    sudo docker cp api-rate-limiter-mongodb:/tmp/backup "$BACKUP_DIR/mongodb" 2>/dev/null || echo "MongoDB backup failed"

    echo "Backing up Redis..."
    sudo docker exec api-rate-limiter-redis redis-cli --rdb /tmp/dump.rdb 2>/dev/null || true
    sudo docker cp api-rate-limiter-redis:/tmp/dump.rdb "$BACKUP_DIR/redis_dump.rdb" 2>/dev/null || echo "Redis backup failed"
    
    echo "✅ Backup completed: $BACKUP_DIR"
}

# Main script logic
case "${1:-help}" in
    dev)
        start_dev
        ;;
    prod)
        start_prod
        ;;
    stop)
        stop_services
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean_all
        ;;
    backup)
        backup_data
        ;;
    help|*)
        usage
        ;;
esac
