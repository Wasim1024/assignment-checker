#!/bin/bash

# Push to GitHub Script
# Run this after creating the repository on GitHub

echo "🚀 Pushing Assignment Grader to GitHub..."
echo "========================================"

# Replace 'yourusername' with your actual GitHub username
read -p "Enter your GitHub username: " username

echo "📡 Adding remote origin..."
git remote add origin https://github.com/$username/assignment-checker.git

echo "🌿 Setting main branch..."
git branch -M main

echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "🎉 Successfully pushed to GitHub!"
echo "🔗 Repository URL: https://github.com/$username/assignment-checker"
echo ""
echo "✅ Next steps:"
echo "1. Visit your repository on GitHub"
echo "2. Enable GitHub Pages in Settings → Pages"
echo "3. Set source to 'Deploy from a branch' → 'main' → '/ (root)'"
echo "4. Your app will be live at: https://$username.github.io/assignment-checker"
echo ""
echo "🔧 Don't forget to:"
echo "- Add your Hugging Face API key in the app settings"
echo "- Test all features before sharing"
echo "- Update any remaining placeholder text"
