#!/bin/bash

echo "🚀 Starting Docker entrypoint script..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
npx wait-on tcp:postgres:5432

# Check if migrations directory exists
if [ ! -d "/usr/src/app/prisma/migrations" ]; then
    echo "📁 Migrations directory not found. Creating initial migration..."
    npx prisma migrate dev --name init --skip-seed
else
    echo "📁 Migrations directory found. Checking for pending migrations..."
    
    # Check if there are pending migrations
    if npx prisma migrate status | grep -q "pending"; then
        echo "⚠️  Pending migrations found. Running migrate dev..."
        npx prisma migrate dev --skip-seed
    else
        echo "✅ Database is up to date. Deploying migrations..."
        npx prisma migrate deploy
    fi
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🎯 Starting the application..."
exec "$@"
