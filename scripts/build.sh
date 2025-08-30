#!/bin/bash

echo "🔧 Installing dependencies..."
npm install

echo "🗄️  Generating Prisma Client..."
npx prisma generate

echo "🏗️  Building Next.js application..."
npm run build

echo "✅ Build completed successfully!" 