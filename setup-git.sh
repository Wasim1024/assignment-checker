#!/bin/bash

# Assignment Grader - Git Setup Script
# This script helps you initialize and set up the Git repository

echo "🎓 Assignment Grader - Git Setup"
echo "================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git is installed"

# Initialize repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📂 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Assignment Grader v1.0.0

✨ Features:
- AI-powered assignment evaluation
- Student submission portal
- Glassmorphism UI design
- Real-time feedback generation
- File upload support
- Draft auto-saving

🚀 Ready for deployment!"

echo ""
echo "🎉 Git repository setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a repository on GitHub named 'assignment-checker'"
echo "2. Run: git remote add origin https://github.com/yourusername/assignment-checker.git"
echo "3. Run: git branch -M main"
echo "4. Run: git push -u origin main"
echo ""
echo "🔗 Remember to:"
echo "   - Update the GitHub URLs in README.md with your username"
echo "   - Add your Hugging Face API key in the app settings"
echo "   - Test the application with a local server"
echo ""
echo "📚 Documentation: README.md"
echo "🌐 Live demo: Open index.html in your browser"
