# UniHub: A Comprehensive Student Resource Sharing Platform

UniHub is a modern, full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that serves as a centralized platform for college students to upload, share, and discover course-specific academic resources.

## 🎯 Core Features

### Personalized Academic Experience
- **Profile-based Content**: Resources are filtered based on user's branch, year, and semester
- **Subject Organization**: Clean organization by academic subjects with professor information
- **Multiple Resource Types**: Support for Course Plans, CT Papers, End Sem Papers, PPTs, Class Notes, Reference Books, YouTube Links, and custom categories

### Modern User Interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between themes with persistent user preference
- **Intuitive Navigation**: Clean dashboard with easy subject access
- **Real-time Feedback**: Toast notifications and loading states for better UX

### Secure Resource Management
- **File Upload System**: Secure file upload with validation and size limits
- **Authentication**: JWT-based authentication with protected routes
- **Download Tracking**: Monitor resource usage and popularity
- **Tag-based Organization**: Searchable tags for better resource discovery

## 🚀 Quick Start

### Prerequisites
- Node.js (LTS version)
- MongoDB (local installation or cloud instance)

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/Adarsh-dev-tech/UniHub.git
cd UniHub
```

2. **Backend Setup**
```bash
cd backend
npm install
# Configure environment variables in .env file
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🏗️ Architecture

### Backend (Node.js + Express.js)
- **Authentication System**: JWT-based user authentication with profile management
- **Database Models**: Comprehensive schemas for Users, Subjects, Resources, Ratings, and Discussions
- **File Management**: Secure file upload and storage with validation
- **API Endpoints**: RESTful API for all application features
- **Security**: Rate limiting, CORS configuration, and input validation

### Frontend (React.js + TypeScript)
- **Component Architecture**: Reusable components with TypeScript for type safety
- **State Management**: React Context for authentication and theme management
- **Routing**: Protected routes with automatic redirects
- **Service Layer**: Organized API communication with error handling
- **Responsive UI**: Custom CSS with modern design principles

### Database (MongoDB)
- **User Management**: Profile-based user system with academic details
- **Content Organization**: Subject and resource relationship modeling
- **Rating System**: User feedback and rating collection
- **Discussion Forums**: Community interaction data structure

## 📱 User Experience

### Registration & Onboarding
1. **Account Creation**: Simple email/password registration
2. **Profile Setup**: Academic details (branch, year, semester, section)
3. **Dashboard Access**: Personalized subject view based on profile

### Resource Interaction
1. **Browse Subjects**: View subjects relevant to user's academic profile
2. **Explore Resources**: Organized by type with easy filtering
3. **Upload Content**: Intuitive upload modal with file validation
4. **Download & Share**: Track downloads and resource popularity

### Community Features
- **Discussion Sections**: Q&A forums for each subject (structure implemented)
- **Rating System**: Rate and review shared resources
- **Contributor Recognition**: Track and display user contributions

## 🔧 Technical Implementation

### Security Features
- **Authentication**: JWT tokens with automatic refresh
- **File Validation**: Type checking and size limits for uploads
- **Protected Routes**: Server and client-side route protection
- **Input Sanitization**: Validation on all user inputs

### Performance Optimizations
- **Lazy Loading**: Efficient component loading strategies
- **Caching**: Browser and server-side caching implementation
- **Responsive Images**: Optimized media delivery
- **Bundle Optimization**: Minimized JavaScript bundles

### Scalability Considerations
- **Modular Architecture**: Separated concerns for easy expansion
- **Database Indexing**: Optimized queries for large datasets
- **Error Handling**: Comprehensive error management
- **Logging**: Request and error logging for monitoring

## 📊 Development Status

### ✅ Completed Features
- Complete MERN stack implementation
- User authentication and profile management
- Subject and resource management
- File upload and download system
- Responsive user interface
- Theme management (dark/light mode)
- Real-time notifications

### 🔄 In Progress
- Advanced search functionality
- Resource rating and commenting
- Discussion forum implementation
- Mobile app optimization

### 📋 Planned Features
- Cloud storage integration
- Advanced analytics
- Notification system
- Mobile application
- Study group management

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern MERN stack technologies
- Designed for educational resource sharing
- Community-driven development approach
- Open source contribution welcome

---

**UniHub** - Empowering students through collaborative learning and resource sharing.