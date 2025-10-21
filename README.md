# 🚦 API Rate Limiter

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-NestJS-ea2845?style=for-the-badge&logo=nestjs" alt="Built with NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

<p align="center">
  A robust API Rate Limiting service built with NestJS, featuring user management, API key authentication, real-time analytics, and comprehensive rate limiting capabilities.
</p>

<p align="center">
  <a href="https://hub.docker.com/r/tindii/api-rate-limiter" target="_blank"><img src="https://img.shields.io/docker/pulls/tindii/api-rate-limiter?style=flat-square&logo=docker" alt="Docker Pulls" /></a>
  <img src="https://img.shields.io/github/license/T-droid/Api_rate_limiter?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square" alt="Status" />
</p>

## 🌟 Features

- **🔐 User Authentication**: Secure login/register system with HTTP-only cookies
- **🔑 API Key Management**: Generate, revoke, and manage API keys with custom rate limits
- **⚡ Rate Limiting**: Token bucket algorithm with Redis-backed distributed rate limiting
- **📊 Real-time Analytics**: Dashboard with API usage statistics and success/failure rates
- **🎯 Interactive Documentation**: Live API testing with automatic validation
- **🐳 Docker Ready**: Fully containerized with Docker Compose support
- **🔒 Security First**: Non-root containers, secure environment variables, API key validation
- **📱 Modern UI**: Responsive design with Tailwind CSS and Alpine.js

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │────│   NestJS API    │────│   Rate Limiter  │
│  (Handlebars)   │    │   Controller    │    │   (Redis)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │                   │
            ┌──────────────┐    ┌──────────────┐
            │   MongoDB    │    │   Analytics  │
            │  (User Data) │    │   Service    │
            └──────────────┘    └──────────────┘
```

## 📋 Description

This API Rate Limiter provides a comprehensive solution for managing API access with sophisticated rate limiting capabilities. Built with modern technologies and best practices, it offers both a web interface for management and RESTful APIs for integration.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Pull and run the latest version
docker pull tindii/api-rate-limiter:latest

# Run with docker-compose (includes MongoDB & Redis)
git clone https://github.com/T-droid/Api_rate_limiter.git
cd Api_rate_limiter
docker-compose up -d

# Access the application
open http://localhost:3000
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/T-droid/Api_rate_limiter.git
cd Api_rate_limiter

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB and Redis configurations

# Start development server
pnpm run start:dev
```

## 🔧 Environment Configuration

Create a `.env` file with the following variables:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/api_rate_limiter
MONGO_URI=mongodb://localhost:27017/api_rate_limiter

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-change-in-production

# Application Configuration
NODE_ENV=development
PORT=3000

# Rate Limiting Configuration
RATE_LIMIT_BUCKET_CAPACITY=10
RATE_LIMIT_FILL_RATE=1
```

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `GET /auth/logout` - Logout user

### API Key Management
- `GET /keys` - View API keys dashboard
- `POST /keys/api/generate` - Generate new API key
- `DELETE /keys/api/revoke/:keyId` - Revoke API key
- `GET /keys/api/list` - List all API keys

### Analytics & Dashboard
- `GET /dashboard` - Analytics dashboard
- `GET /dashboard/api/dashboard-data` - Get analytics data
- `GET /dashboard/api/rate-limit-status` - Check rate limit status

### Documentation & Testing
- `GET /documentation` - Interactive API documentation
- `POST /documentation/featured` - Test API endpoints (rate limited)

## 🎯 Usage Examples

### Testing Rate Limiting

```bash
# Test with your API key
curl -X POST http://localhost:3000/documentation/featured \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-your-51-character-api-key-here" \
  -d '{"test": "data"}'
```

### Docker Deployment

```bash
# Build and deploy to Docker Hub
./deploy-dockerhub.sh your-dockerhub-username

# Run anywhere with environment variables
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e REDIS_HOST="your-redis-host" \
  -e JWT_SECRET="your-jwt-secret" \
  tindii/api-rate-limiter:latest
```

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Test rate limiter functionality
./test_rate_limiter.sh

# Test backend integration
./test_backend_integration.sh
```

## 🐳 Docker Deployment

### Option 1: Docker Compose (Full Stack)

```bash
# Clone and run the complete application stack
git clone https://github.com/T-droid/Api_rate_limiter.git
cd Api_rate_limiter
docker-compose up -d

# Services included:
# - API Rate Limiter (Port 3000)
# - MongoDB (Port 27018)
# - Redis (Port 6380)
# - Mongo Express (Port 8081)
# - Redis Commander (Port 8082)
```

### Option 2: Docker Hub Image

```bash
# Pull from Docker Hub
docker pull tindii/api-rate-limiter:latest

# Run with external database connections
docker run -d 
  -p 3000:3000 
  --name api-rate-limiter 
  -e MONGODB_URI="mongodb://your-host:27017/api_rate_limiter" 
  -e REDIS_HOST="your-redis-host" 
  -e JWT_SECRET="your-secure-secret" 
  tindii/api-rate-limiter:latest
```

### Option 3: Production Deployment

```bash
# Use the automated deployment script
./deploy-dockerhub.sh your-dockerhub-username

# Deploy to production with docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | NestJS + TypeScript | RESTful API & Business Logic |
| **Frontend** | Handlebars + Tailwind CSS | Server-Side Rendered UI |
| **Database** | MongoDB + Mongoose | User Data & API Keys Storage |
| **Cache** | Redis | Rate Limiting & Session Management |
| **Authentication** | JWT + HTTP-only Cookies | Secure User Sessions |
| **Containerization** | Docker + Docker Compose | Development & Production |
| **Package Manager** | PNPM | Fast, Efficient Dependencies |

## 📊 Monitoring & Analytics

The application provides comprehensive analytics through the dashboard:

- **API Usage Metrics**: Total requests, success/failure rates
- **Rate Limit Status**: Current usage vs limits for each API key
- **Real-time Charts**: Visual representation of API usage patterns
- **Key Management**: Monitor active keys and their usage statistics

## 🔒 Security Features

- **API Key Validation**: 51-character secure API keys with `sk-` prefix
- **Rate Limiting**: Token bucket algorithm prevents abuse
- **HTTP-only Cookies**: Secure authentication without XSS vulnerabilities  
- **Non-root Containers**: Docker security best practices
- **Environment Isolation**: Secrets managed via environment variables
- **Input Validation**: Comprehensive request validation and sanitization

## 🚦 Rate Limiting Details

The rate limiter implements a **Token Bucket Algorithm**:

- **Bucket Capacity**: Configurable maximum requests (default: 10)
- **Refill Rate**: Tokens added per time window (default: 1/second)
- **Distributed**: Redis-backed for horizontal scaling
- **Per-Key Limits**: Different limits per API key
- **Graceful Degradation**: Informative error messages when limits exceeded

## 🌐 Testing Your Deployed Application

Once deployed to Docker Hub, you can test your application:

### 1. Local Testing
```bash
# Pull and run your image
docker run -d -p 3000:3000 
  -e MONGODB_URI="mongodb://localhost:27017/test" 
  -e REDIS_HOST="localhost" 
  -e JWT_SECRET="test-secret" 
  tindii/api-rate-limiter:latest

# Access at http://localhost:3000
```

### 2. Cloud Platform Testing

Deploy on platforms like:
- **Railway**: `railway up`
- **Heroku**: `heroku container:push web`
- **DigitalOcean**: App Platform deployment
- **AWS**: ECS or Lambda deployment
- **Google Cloud**: Cloud Run deployment

## 📚 Documentation

- **API Documentation**: Available at `/documentation` when running
- **Docker Hub**: [tindii/api-rate-limiter](https://hub.docker.com/r/tindii/api-rate-limiter)
- **Environment Setup**: See `ENV_VARIABLES_GUIDE.md`
- **Docker Deployment**: See `DOCKERHUB_DEPLOYMENT.md`
- **Redis Troubleshooting**: See `REDIS_TROUBLESHOOTING.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you found this project helpful, please give it a ⭐️!

For issues and questions:
- Create an [Issue](https://github.com/T-droid/Api_rate_limiter/issues)
- Check existing documentation in the `/docs` folder
- Review the troubleshooting guides

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/T-droid">T-droid</a>
</p>

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/i_mzoefu)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
