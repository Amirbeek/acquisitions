# Acquisitions API

A Node.js Express application with Neon Database integration, optimized for both development and production environments using Docker.

## 🏗️ Architecture Overview

This application supports two deployment modes:

- **Development**: Uses Neon Local proxy for ephemeral database branches
- **Production**: Connects directly to Neon Cloud database

## 📋 Prerequisites

- Docker and Docker Compose installed
- Neon account and project set up
- Neon API key (get from [Neon Console](https://console.neon.tech/app/settings/api-keys))

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy the environment template
cp .env.example .env.development

# Edit .env.development with your Neon credentials
# Required values:
# - NEON_API_KEY=your_api_key_here
# - NEON_PROJECT_ID=your_project_id_here
# - PARENT_BRANCH_ID=main_or_your_default_branch
```

### 2. Development Environment

The development setup uses **Neon Local** which creates ephemeral database branches automatically.

```bash
# Start the development environment
docker-compose -f docker-compose.dev.yml up --build

# Or run in background
docker-compose -f docker-compose.dev.yml up -d --build
```

This will:
- Start a Neon Local proxy container
- Create an ephemeral branch from your parent branch
- Start your application connected to the ephemeral branch
- Automatically clean up the branch when containers stop

**Access the application:**
- Application: http://localhost:3000
- Health check: http://localhost:3000/health

### 3. Production Environment

```bash
# Setup production environment
cp .env.example .env.production

# Edit .env.production with:
# - DATABASE_URL=your_neon_cloud_connection_string
# - JWT_SECRET=your_production_jwt_secret
# - Other production configurations

# Deploy production
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔧 Configuration Details

### Environment Variables

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `NODE_ENV` | `development` | `production` | Application environment |
| `DATABASE_URL` | Neon Local format | Neon Cloud format | Database connection |
| `NEON_API_KEY` | Required | Not used | For Neon Local authentication |
| `NEON_PROJECT_ID` | Required | Not used | Your Neon project ID |
| `PARENT_BRANCH_ID` | Required | Not used | Branch to create ephemeral branches from |
| `JWT_SECRET` | Dev value | Secure value | JWT signing secret |

### Database Connection Formats

**Development (Neon Local):**
```
postgres://neon:npg@neon-local:5432/neondb?sslmode=require
```

**Production (Neon Cloud):**
```
postgres://username:password@ep-example-pooler.us-east-1.neon.tech/neondb?sslmode=require
```

## 🛠️ Development Workflow

### Database Operations

```bash
# Generate database migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Run migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

### Application Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Access container shell
docker-compose -f docker-compose.dev.yml exec app sh

# Restart just the app service
docker-compose -f docker-compose.dev.yml restart app

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

### Code Changes

The development setup includes volume mounts for hot reloading:
```yaml
volumes:
  - ./src:/app/src:ro
  - ./drizzle.config.js:/app/drizzle.config.js:ro
```

Restart the container to see changes, or modify the Dockerfile to use `nodemon` for automatic restarts.

## 🏭 Production Deployment

### Environment Setup

1. **Secure your environment variables:**
   ```bash
   # Use a secrets management system or secure environment injection
   export JWT_SECRET=$(openssl rand -base64 32)
   export DATABASE_URL="your_neon_cloud_url"
   ```

2. **Deploy with proper resource limits:**
   ```bash
   # The production compose includes resource limits
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Monitor the deployment:**
   ```bash
   # Check health
   curl http://localhost:3000/health
   
   # View logs
   docker-compose -f docker-compose.prod.yml logs -f
   ```

### Security Considerations

- JWT secrets are injected via environment variables
- No hardcoded credentials in code or config files
- Resource limits prevent resource exhaustion
- Health checks ensure container reliability
- Non-root user execution in containers

## 🔍 Troubleshooting

### Common Issues

1. **Neon Local connection fails:**
   ```bash
   # Check if Neon Local is healthy
   docker-compose -f docker-compose.dev.yml ps
   
   # View Neon Local logs
   docker-compose -f docker-compose.dev.yml logs neon-local
   ```

2. **Database connection timeout:**
   ```bash
   # Verify environment variables
   docker-compose -f docker-compose.dev.yml exec app env | grep DATABASE_URL
   
   # Test database connectivity
   docker-compose -f docker-compose.dev.yml exec app node -e \"
   import('./src/config/db.js').then(({sql}) => {
     sql\\`SELECT 1\\`.then(() => console.log('DB Connected!')).catch(console.error);
   });\"
   ```

3. **Build issues:**
   ```bash
   # Clean build
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml build --no-cache
   docker-compose -f docker-compose.dev.yml up
   ```

### Health Checks

Both development and production configurations include health checks:
- Application health endpoint: `/health`
- Database connectivity verification
- Automatic container restart on failures

## 📚 Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon Database Documentation](https://neon.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

## 🤝 Contributing

1. Use the development environment for all changes
2. Each development session gets a fresh database branch
3. Run linting before commits: `docker-compose -f docker-compose.dev.yml exec app npm run lint`
4. Test your changes with both development and production configurations

## 📄 License

ISC License - see package.json for details.