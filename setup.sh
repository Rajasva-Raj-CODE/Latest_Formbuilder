#!/bin/bash

echo "🚀 Setting up Form Builder..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "⚠️  Please update .env.local with your database credentials"
else
    echo "✅ .env.local already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push database schema
echo "🗄️  Setting up database..."
npm run db:push

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your database credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Optional:"
echo "- Run 'npm run db:studio' to open Prisma Studio"
echo "- Check the README.md for more information" 