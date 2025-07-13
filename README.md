# 🎓 Assignment Grader - AI-Powered Evaluation System

> A modern, vanilla JavaScript web application for automated assignment evaluation using AI-powered analysis and beautiful glassmorphism design.

![Assignment Grader Demo](https://img.shields.io/badge/Status-Active-brightgreen) ![Version](https://img.shields.io/badge/Version-1.0.0-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![CSS3](https://img.shields.io/badge/CSS3-Modern-orange) ![HTML5](https://img.shields.io/badge/HTML5-Semantic-red)

## ✨ Features

### 🎯 **Core Functionality**
- **AI-Powered Evaluation**: Automated grading using Hugging Face Inference API
- **Flexible Submission Methods**: Text input, file upload (PDF, DOCX, TXT), or combined
- **Customizable Rubrics**: Create detailed evaluation criteria with weighted scoring
- **Real-time Feedback**: Instant AI-generated feedback with constructive suggestions
- **Student Portal**: Dedicated interface for assignment submission and progress tracking

### 🎨 **Modern UI/UX**
- **Glassmorphism Design**: Beautiful frosted glass effects with backdrop blur
- **Particle Animations**: Dynamic canvas-based particle systems
- **Dark Theme**: Elegant dark interface with vibrant accent colors
- **Responsive Layout**: Mobile-first design that works on all devices
- **Micro-interactions**: Smooth animations and hover effects

### 🚀 **Technical Highlights**
- **Vanilla JavaScript**: No frameworks - pure ES6+ with modern APIs
- **Local Storage**: Client-side data persistence with no backend required
- **Progressive Enhancement**: Works offline with cached data
- **File Processing**: Drag & drop uploads with validation and preview
- **Auto-save**: Real-time draft saving for student submissions

## 🖥️ Screenshots

### Dashboard
![Dashboard Screenshot](https://via.placeholder.com/800x400/1a1d29/ffffff?text=Dashboard+with+Particle+Background)

### Student Portal
![Student Portal Screenshot](https://via.placeholder.com/800x400/1a1d29/ffffff?text=Student+Submission+Portal)

### AI Evaluation Results
![Results Screenshot](https://via.placeholder.com/800x400/1a1d29/ffffff?text=AI+Evaluation+Results)

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Hugging Face API key (free at [huggingface.co](https://huggingface.co))
- Local web server (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/assignment-checker.git
   cd assignment-checker
   ```

2. **Serve the application**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

4. **Configure API Key**
   - Navigate to Settings
   - Enter your Hugging Face API key
   - Start creating assignments!

## 📁 Project Structure

```
assignment-checker/
├── 📄 index.html              # Main application file
├── 📁 css/
│   ├── 🎨 main.css           # Core styles and variables
│   ├── ✨ animations.css     # Animation definitions
│   └── 🧩 components.css     # Component-specific styles
├── 📁 js/
│   ├── 🏗️ app.js             # Main application controller
│   ├── 📁 utils/
│   │   ├── 💾 storage.js      # LocalStorage management
│   │   └── 🎭 animations.js   # Animation utilities
│   ├── 📁 services/
│   │   └── 🤖 huggingface.js  # AI API integration
│   └── 📁 components/
│       ├── ✨ particles.js    # Particle system
│       └── 📊 charts.js       # Visualization components
├── 📚 README.md              # Project documentation
└── 📋 assignment_grader_prompt.md  # Development specifications
```

## 🎯 Usage Guide

### For Instructors

1. **Create Assignments**
   - Navigate to "New Assignment"
   - Fill in assignment details and rubric
   - Set due dates and marking criteria

2. **Review Submissions**
   - Check the "Results" page for submitted work
   - View AI-generated evaluations and scores
   - Add additional feedback if needed

### For Students

1. **Complete Profile**
   - Go to "Student Portal"
   - Enter your name, student ID, and class

2. **Submit Assignments**
   - Select an available assignment
   - Choose submission method (text/file/both)
   - Complete the submission checklist
   - Submit your work

3. **Track Progress**
   - View submitted assignments
   - Check grades and feedback
   - Access saved drafts

## 🔧 Configuration

### API Setup
```javascript
// Configure in Settings or directly in code
const API_CONFIG = {
  HF_API_KEY: 'your_hugging_face_api_key',
  MODEL_NAME: 'microsoft/DialoGPT-medium',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7
};
```

### Customization
```css
/* Modify CSS variables in main.css */
:root {
  --primary-purple: #667eea;
  --primary-violet: #764ba2;
  --accent-cyan: #06b6d4;
  --accent-emerald: #10b981;
  --dark-bg: #0f1419;
  --dark-surface: #1a1d29;
}
```

## 🤖 AI Integration

The application uses Hugging Face's Inference API for:
- **Content Analysis**: Evaluating assignment completeness and accuracy
- **Grammar Checking**: Identifying language and writing quality issues
- **Feedback Generation**: Creating constructive, personalized feedback
- **Score Calculation**: Automated grading based on rubric criteria

### Supported Models
- `microsoft/DialoGPT-medium` (Primary)
- `facebook/bart-large-cnn` (Summarization)
- `sentence-transformers/all-MiniLM-L6-v2` (Similarity)

## 📊 Data Management

### Local Storage Structure
```javascript
// Assignments
{
  id: "unique_id",
  title: "Assignment Title",
  subject: "Subject",
  description: "Assignment description",
  totalMarks: 100,
  rubric: { /* scoring criteria */ },
  dueDate: "2024-12-31T23:59:59Z"
}

// Student Submissions
{
  id: "unique_id",
  assignmentId: "assignment_id",
  studentId: "student_id",
  submissionText: "content",
  evaluation: { /* AI scores and feedback */ },
  submittedAt: "timestamp"
}
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradient (`#667eea` → `#764ba2`)
- **Accent**: Cyan (`#06b6d4`), Emerald (`#10b981`)
- **Background**: Dark blue (`#0f1419` → `#1a1d29`)
- **Glass**: Semi-transparent white with backdrop blur

### Typography
- **System Fonts**: SF Pro (macOS), Segoe UI (Windows), Roboto (Android)
- **Weights**: 400 (normal), 600 (semibold), 700 (bold)
- **Scale**: 0.875rem → 4rem with 1.25 ratio

## 🚀 Deployment

### Static Hosting Options

1. **Netlify** (Recommended)
   ```bash
   # Drag and drop the project folder
   # Or connect your GitHub repository
   ```

2. **Vercel**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

3. **GitHub Pages**
   ```bash
   # Enable Pages in repository settings
   # Deploy from main branch
   ```

### Environment Setup
```bash
# Build optimized version (optional)
npm run build

# Deploy to production
npm run deploy
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create new assignment with rubric
- [ ] Submit assignment as student (text method)
- [ ] Submit assignment with file upload
- [ ] Verify AI evaluation works
- [ ] Check responsive design on mobile
- [ ] Test error handling scenarios

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Use vanilla JavaScript (no frameworks)
- Follow existing code style and structure
- Add comments for complex logic
- Test on multiple browsers
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for providing the AI inference API
- [Particles.js](https://particles.js.org/) for inspiration on particle systems
- Modern CSS techniques and glassmorphism design trends
- The open-source community for continuous inspiration

## 📞 Support

- 📧 Email: your.email@example.com
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/assignment-checker/issues)
- 📖 Documentation: [Project Wiki](https://github.com/yourusername/assignment-checker/wiki)

## 🗺️ Roadmap

### Version 1.1
- [ ] Batch assignment processing
- [ ] Export results to PDF/CSV
- [ ] Advanced analytics dashboard
- [ ] Email notifications

### Version 1.2
- [ ] Multi-language support
- [ ] Collaborative grading
- [ ] Integration with LMS platforms
- [ ] Mobile app companion

---

<div align="center">

**[⭐ Star this repo](https://github.com/yourusername/assignment-checker)** if you found it helpful!

Made with ❤️ and ☕ using vanilla JavaScript

</div>
