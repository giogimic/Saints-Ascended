# Saints Ascended - Deployment Guide

This guide covers deploying the Saints Ascended application on remote servers, including database configuration and environment setup.

## Prerequisites

- Node.js 18+ installed on the server
- Git access to the repository
- Proper file system permissions

## Environment Configuration

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database Configuration
DATABASE_URL="file:/var/lib/saints-ascended/data/production.db"
# OR for PostgreSQL:
# DATABASE_URL="postgresql://username:password@localhost:5432/saints_ascended"

# Application Configuration
NODE_ENV="production"
DATA_DIR="/var/lib/saints-ascended/data"

# Optional: Custom port
PORT=3000
```

### 2. Database Setup

#### SQLite (Recommended for small deployments)

```bash
# Create data directory
sudo mkdir -p /var/lib/saints-ascended/data
sudo chown -R $USER:$USER /var/lib/saints-ascended/data

# Set proper permissions
chmod 755 /var/lib/saints-ascended/data
```

#### PostgreSQL (Recommended for production)

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE saints_ascended;
CREATE USER saints_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE saints_ascended TO saints_user;
\q
```

### 3. Application Deployment

```bash
# Clone the repository
git clone <repository-url>
cd Saints-Ascended

# Install dependencies
npm install

# Build the application
npm run build

# Set environment variables
export DATABASE_URL="file:/var/lib/saints-ascended/data/production.db"
export NODE_ENV="production"

# Initialize database
npx prisma db push

# Start the application
npm start
```

## Production Deployment with PM2

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Create PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'saints-ascended',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/Saints-Ascended',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'file:/var/lib/saints-ascended/data/production.db',
      DATA_DIR: '/var/lib/saints-ascended/data'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/saints-ascended/error.log',
    out_file: '/var/log/saints-ascended/out.log',
    log_file: '/var/log/saints-ascended/combined.log',
    time: true
  }]
};
```

### 3. Start with PM2

```bash
# Create log directory
sudo mkdir -p /var/log/saints-ascended
sudo chown -R $USER:$USER /var/log/saints-ascended

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Nginx Configuration

### 1. Install Nginx

```bash
sudo apt install nginx
```

### 2. Create Nginx Configuration

Create `/etc/nginx/sites-available/saints-ascended`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static file caching
    location /_next/static/ {
        alias /path/to/Saints-Ascended/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/saints-ascended /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Configuration with Let's Encrypt

### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

## Troubleshooting

### Database Connection Issues

1. **Check file permissions**:
   ```bash
   ls -la /var/lib/saints-ascended/data/
   ```

2. **Verify database file exists**:
   ```bash
   ls -la /var/lib/saints-ascended/data/production.db
   ```

3. **Check application logs**:
   ```bash
   pm2 logs saints-ascended
   ```

### Common Error Solutions

#### Error: "Unable to open the database file"

This error occurs when:
- The database file path is incorrect
- File permissions are insufficient
- The directory doesn't exist

**Solution**:
```bash
# Create directory and set permissions
sudo mkdir -p /var/lib/saints-ascended/data
sudo chown -R $USER:$USER /var/lib/saints-ascended/data
chmod 755 /var/lib/saints-ascended/data

# Verify the DATABASE_URL in your environment
echo $DATABASE_URL
```

#### Error: "Database connection failed"

**Solution**:
```bash
# Test database connection
npx prisma db push

# Check if database file is accessible
sqlite3 /var/lib/saints-ascended/data/production.db ".tables"
```

### Performance Optimization

1. **Enable database indexing**:
   ```bash
   npx prisma db push
   ```

2. **Monitor application performance**:
   ```bash
   pm2 monit
   ```

3. **Check memory usage**:
   ```bash
   pm2 status
   ```

## Backup and Recovery

### Database Backup

```bash
# SQLite backup
cp /var/lib/saints-ascended/data/production.db /backup/saints-ascended-$(date +%Y%m%d).db

# PostgreSQL backup
pg_dump saints_ascended > /backup/saints-ascended-$(date +%Y%m%d).sql
```

### Application Backup

```bash
# Backup application files
tar -czf /backup/saints-ascended-app-$(date +%Y%m%d).tar.gz /path/to/Saints-Ascended
```

## Monitoring and Maintenance

### 1. Health Checks

Create a health check endpoint:

```bash
curl http://localhost:3000/api/health
```

### 2. Log Rotation

Configure log rotation in `/etc/logrotate.d/saints-ascended`:

```
/var/log/saints-ascended/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
```

### 3. Regular Maintenance

```bash
# Update application
git pull
npm install
npm run build
pm2 restart saints-ascended

# Clean up old backups (older than 30 days)
find /backup -name "saints-ascended-*" -mtime +30 -delete
```

## Security Considerations

1. **Firewall Configuration**:
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **Database Security**:
   - Use strong passwords for PostgreSQL
   - Restrict database access to localhost only
   - Regular security updates

3. **Application Security**:
   - Keep Node.js and dependencies updated
   - Use HTTPS in production
   - Implement rate limiting

## Support

For deployment issues:
1. Check the application logs: `pm2 logs saints-ascended`
2. Verify environment variables: `pm2 env saints-ascended`
3. Test database connection: `npx prisma db push`
4. Check file permissions and paths 