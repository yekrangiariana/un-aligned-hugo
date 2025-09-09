#!/bin/bash

# Build script for Cloudflare Pages
# This script builds the Hugo site and generates the search index

echo "🚀 Starting Cloudflare build process..."
echo "📅 $(date)"
echo ""

# Step 1: Build the Hugo site
echo "🔨 Building Hugo site..."
hugo --minify

if [ $? -ne 0 ]; then
    echo "❌ Hugo build failed!"
    exit 1
fi

echo "✅ Hugo build completed"
echo ""

# Step 2: Generate search index with Pagefind
echo "🔍 Generating search index with Pagefind..."
npx pagefind --site public

if [ $? -ne 0 ]; then
    echo "❌ Pagefind failed!"
    exit 1
fi

echo "✅ Search index generated successfully"
echo ""
echo "🎉 Build process completed successfully!"
