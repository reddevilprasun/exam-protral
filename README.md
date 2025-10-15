# 🎓 Secure Exam Portal

A comprehensive, secure online examination platform with live AI-powered proctoring, real-time monitoring, and complete university-level management system. Built with modern web technologies to ensure academic integrity and seamless exam administration.

## 🌟 Overview

This project is a full-featured secure exam portal designed for educational institutions. It provides a robust platform for conducting online examinations with advanced security measures, AI-powered proctoring, and comprehensive university management capabilities.

## ✨ Key Features

### 🔐 Security & Proctoring
- **Live AI Proctoring**: Real-time face detection and behavior monitoring using TensorFlow.js
- **Webcam Monitoring**: Continuous video surveillance with face detection and object recognition
- **Security Violation Detection**: 
  - Tab switching detection
  - Fullscreen exit monitoring
  - Keyboard shortcut blocking
  - Right-click and copy-paste prevention
  - Multiple person detection
  - Phone/device detection
- **Live Streaming**: Real-time exam session streaming for remote invigilation
- **Anti-Cheating Measures**: Comprehensive cheating detection algorithms

### 🏛️ University Management System
- **Multi-University Support**: Complete university-level management
- **Role-Based Access Control (RBAC)**: 
  - Super Admin
  - University Admin
  - Teachers/Instructors
  - Students
- **University Registration**: Request-approval system for new universities
- **Department & Course Management**: Hierarchical academic structure

### 📝 Exam Management
- **Exam Creation & Scheduling**: Flexible exam setup with time controls
- **Question Bank**: Comprehensive question management system
- **Answer Evaluation**: Automated and manual grading capabilities
- **Real-time Monitoring**: Live exam progress tracking
- **Detailed Analytics**: Performance metrics and violation reports

### 🎯 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: Customizable UI themes
- **Intuitive Dashboard**: Role-specific dashboards for different user types
- **Real-time Notifications**: Instant alerts and updates

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Shadcn/ui** - Beautiful, reusable components
- **React Hook Form** - Form state management
- **Zustand** - State management

### Backend & Database
- **Convex** - Backend-as-a-Service with real-time capabilities
- **Convex Auth** - Authentication and authorization
- **Real-time Subscriptions** - Live data synchronization

### AI & Machine Learning
- **TensorFlow.js** - Client-side AI processing
- **BlazeFace** - Face detection model
- **COCO-SSD** - Object detection model
- **Face Landmarks Detection** - Advanced facial analysis

### Additional Tools
- **React Email** - Email template system
- **Resend** - Email delivery service
- **Zod** - Schema validation
- **Lucide React** - Icon library

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Convex account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/reddevilprasun/exam-protral.git
   cd exam-protral
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your Convex, email, and other service credentials.

4. **Set up Convex**
   ```bash
   npx convex dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
exam-protral/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin panel routes
│   ├── (auth)/            # Authentication pages
│   ├── (home)/            # Main application routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # Shadcn/ui components
├── convex/               # Backend logic & database schema
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── providers/            # Context providers
└── emails/               # Email templates
```

## 🔧 Key Components

### Security Hooks
- `use-exam-security.ts` - Exam security violation detection
- `use-webcam-monitoring.tsx` - AI-powered webcam monitoring

### Database Schema
- Complete university management schema
- User roles and permissions
- Exam and question management
- Proctoring and violation tracking

## 🎯 What I Learned

Building this secure exam portal has been an incredible learning journey. Here are the key skills and technologies I mastered:

### 🧠 AI & Machine Learning
- **Computer Vision**: Implemented real-time face detection using TensorFlow.js
- **Object Detection**: Integrated COCO-SSD for detecting phones and unauthorized objects
- **Browser-based AI**: Learned to run ML models efficiently in the browser
- **Real-time Processing**: Optimized AI inference for live video streams

### 🔐 Security & Privacy
- **Web Security**: Implemented comprehensive security measures for online exams
- **Browser APIs**: Mastered Fullscreen API, Page Visibility API, and Media Capture
- **Event Handling**: Advanced DOM event management for security monitoring
- **Data Protection**: Ensured secure handling of sensitive exam data

### 🏗️ Full-Stack Development
- **Next.js 15**: Advanced App Router patterns and server-side rendering
- **TypeScript**: Type-safe development across the entire stack
- **Real-time Applications**: Built live monitoring and streaming capabilities
- **Database Design**: Created complex relational schemas for university management

### 🎨 Modern UI/UX
- **Component Architecture**: Built scalable, reusable component systems
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Implemented ARIA standards and keyboard navigation
- **Design Systems**: Utilized Radix UI and Shadcn/ui for consistent interfaces

### 🚀 DevOps & Performance
- **Real-time Backend**: Leveraged Convex for live data synchronization
- **Performance Optimization**: Optimized AI model loading and video processing
- **State Management**: Complex state handling with Zustand and React hooks
- **Email Integration**: Automated notification systems with React Email

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Convex for the powerful backend platform
- TensorFlow.js team for browser-based ML capabilities
- Radix UI and Shadcn for beautiful, accessible components

## 📞 Contact

**Prasun Kamilya**
- GitHub: [@reddevilprasun](https://github.com/reddevilprasun)
- Project Link: [https://github.com/reddevilprasun/exam-protral](https://github.com/reddevilprasun/exam-protral)

---

⭐ If you found this project helpful, please give it a star on GitHub!
