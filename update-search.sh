#!/bin/bash

# ============================================================================
# PAGEFIND SEARCH INDEX UPDATE SCRIPT
# ============================================================================
#
# WHAT THIS SCRIPT DOES:
# This script rebuilds your website's search functionality and deploys it.
# It builds your Hugo site, generates the search index with Pagefind, 
# and pushes the updated search files to your repository.
#
# WHEN TO USE THIS SCRIPT:
# Run this script whenever you:
# 1. Add new blog posts or articles
# 2. Edit existing content that should appear in search
# 3. Delete content that should be removed from search
# 4. Change page titles, descriptions, or other searchable content
# 5. Notice that search isn't finding content you know exists
#
# HOW TO USE:
# 1. Open Terminal
# 2. Navigate to your website folder
# 3. Run this script:
#    ./update-search.sh
# 4. Wait for it to complete (usually 10-60 seconds)
# 5. Your website will automatically update with the new search index
#
# TROUBLESHOOTING:
# - If you get "permission denied": run "chmod +x update-search.sh" first
# - If Hugo command fails: make sure Hugo is installed
# - If Pagefind fails: make sure you have internet connection (it downloads on first use)
# - If git commands fail: make sure you're in the right directory and have git access
#
# WHAT HAPPENS STEP BY STEP:
# 1. Builds your Hugo website into the 'public' folder
# 2. Scans all your content and creates search database
# 3. Adds the search files to git
# 4. Commits with a timestamp message
# 5. Pushes to your repository
# 6. Cloudflare automatically deploys the update
#
# ============================================================================

echo "🚀 Starting search index update..."
echo "📅 $(date)"
echo ""

# Step 1: Build the Hugo site
echo "🔨 Building Hugo site..."
hugo --minify

if [ $? -ne 0 ]; then
    echo "❌ Hugo build failed! Please check for errors above."
    exit 1
fi

echo "✅ Hugo build completed successfully"
echo ""

# Step 2: Generate search index with Pagefind
echo "🔍 Generating search index with Pagefind..."
npx pagefind --site public

if [ $? -ne 0 ]; then
    echo "❌ Pagefind failed! Please check for errors above."
    exit 1
fi

echo "✅ Search index generated successfully"
echo ""

# Step 3: Add search files to git
echo "📝 Adding search files to git..."
git add public/pagefind/

if [ $? -ne 0 ]; then
    echo "❌ Git add failed! Make sure you're in the right directory."
    exit 1
fi

# Step 4: Commit with timestamp
echo "💾 Committing search index update..."
commit_message="Update search index - $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$commit_message"

if [ $? -ne 0 ]; then
    echo "ℹ️  No changes to commit (search index is already up to date)"
else
    echo "✅ Changes committed successfully"
fi

echo ""

# Step 5: Push to repository
echo "🚀 Pushing to repository..."
git push

if [ $? -ne 0 ]; then
    echo "❌ Git push failed! Please check your internet connection and git permissions."
    exit 1
fi

echo "✅ Successfully pushed to repository"
echo ""
echo "🎉 All done! Your search index has been updated."
echo "🌐 Cloudflare Pages will automatically deploy the changes in a few minutes."
echo "🔍 Test your search at: https://un-aligned.org/search"
echo ""
echo "💡 Remember to run this script whenever you add or edit content!"
