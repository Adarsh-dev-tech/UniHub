# UniHub - Complete MERN Stack Implementation

## 🎯 Project Overview

UniHub is a fully functional student resource sharing platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The application provides a centralized platform for college students to upload, share, and discover course-specific academic resources with personalized experiences based on their academic profile.

## ✨ Key Features Implemented

### 🔐 Authentication & User Management
- **JWT-based Authentication**: Secure login/registration system
- **Profile Setup**: Academic details collection (Branch, Year, Semester, Section)
- **Protected Routes**: Secure access to authenticated features
- **Context-based State Management**: React Context for authentication and theme

### 📚 Academic Resource Management
- **Subject-based Organization**: Resources organized by subjects matching user's academic profile
- **Multiple Resource Types**: Support for Course Plans, CT Papers, End Sem Papers, PPTs, Class Notes, Reference Books, YouTube Links, and Custom categories
- **File Upload System**: Secure file upload with validation (50MB limit)
- **Resource Categorization**: Automatic grouping by type and year (for exam papers)
- **Download Tracking**: Monitor resource usage
- **Tag System**: Searchable tags for better resource discovery

### 📱 User Interface & Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Interactive Dashboard**: Personalized subject cards with quick navigation
- **Subject Pages**: Comprehensive resource display with filtering and organization
- **Upload Modal**: User-friendly resource upload interface
- **Toast Notifications**: Real-time feedback for user actions

### 🏗️ Technical Architecture

#### Backend (Node.js + Express.js)
```
backend/
├── config/
│   └── database.js           # MongoDB connection
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── upload.js            # File upload middleware
├── models/
│   ├── User.js              # User schema with profile details
│   ├── Subject.js           # Subject schema
│   ├── Resource.js          # Resource schema with file handling
│   ├── Rating.js            # Rating/review schema
│   └── DiscussionPost.js    # Discussion forum schema
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── subjects.js          # Subject management
│   ├── resources.js         # Resource CRUD operations
│   ├── ratings.js           # Rating system
│   └── discussions.js       # Discussion forums
└── server.js                # Express server configuration
```

#### Frontend (React.js + TypeScript)
```
frontend/src/
├── components/
│   ├── Header.tsx           # Navigation header with search
│   ├── ProtectedRoute.tsx   # Route protection component
│   ├── ProfileSetupModal.tsx # Academic profile setup
│   └── UploadResourceModal.tsx # Resource upload interface
├── contexts/
│   ├── AuthContext.tsx      # Authentication state management
│   └── ThemeContext.tsx     # Theme preference management
├── pages/
│   ├── Login.tsx           # User authentication
│   ├── Register.tsx        # User registration
│   ├── Dashboard.tsx       # Personalized dashboard
│   └── SubjectPage.tsx     # Subject resource display
├── services/
│   ├── api.ts              # Axios HTTP client configuration
│   ├── auth.ts             # Authentication API calls
│   ├── subjects.ts         # Subject management API
│   └── resources.ts        # Resource management API
└── types/
    └── index.ts            # TypeScript type definitions
```

## 🗄️ Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  profile: {
    branch: String (required),
    year: Number (1-5, required),
    semester: Number (1-10, required),
    section: String (required)
  },
  uploadedResources: [ObjectId],
  isProfileComplete: Boolean
}
```

### Subject Model
```javascript
{
  subjectName: String (required),
  subjectCode: String (unique, required),
  professorName: String,
  branch: String (required),
  year: Number (required),
  semester: Number (required)
}
```

### Resource Model
```javascript
{
  title: String (required),
  type: Enum (Course Plan, CT Paper, End Sem Paper, PPT, Class Notes, Reference Book, YouTube Link, Custom),
  customType: String,
  fileURL: String,
  fileName: String,
  fileSize: Number,
  fileType: String,
  externalURL: String,
  subject: ObjectId (required),
  uploader: ObjectId (required),
  yearOfPaper: Number,
  tags: [String],
  averageRating: Number (0-5),
  totalRatings: Number,
  downloads: Number,
  isVerified: Boolean
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS version)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/Adarsh-dev-tech/UniHub.git
cd UniHub
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Environment Configuration**

Backend (.env):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/unihub
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. **Run the Application**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/complete-profile` - Complete user profile

### Subjects
- `GET /api/subjects/my-subjects` - Get user's subjects
- `GET /api/subjects/:subjectCode` - Get specific subject
- `POST /api/subjects` - Create new subject
- `GET /api/subjects/search/:query` - Search subjects

### Resources
- `GET /api/resources/subject/:subjectCode` - Get resources by subject
- `POST /api/resources/upload` - Upload new resource
- `GET /api/resources/download/:resourceId` - Download resource
- `GET /api/resources/view/:resourceId` - Preview resource
- `GET /api/resources/search/:query` - Search resources

### Ratings
- `GET /api/ratings/resource/:resourceId` - Get resource ratings
- `POST /api/ratings` - Add/update rating
- `DELETE /api/ratings/:ratingId` - Delete rating

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **File Validation**: Type and size restrictions for uploads
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet.js**: Security headers for Express
- **Input Validation**: Server-side validation for all inputs

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured interface with sidebar navigation
- **Tablet**: Adapted layouts with touch-friendly interactions
- **Mobile**: Streamlined interface with collapsible menus

## 🎨 UI/UX Features

- **Clean Modern Interface**: Intuitive design with consistent styling
- **Dark/Light Mode**: User preference-based theme switching
- **Loading States**: Skeleton loading and progress indicators
- **Toast Notifications**: Real-time feedback for user actions
- **Form Validation**: Client and server-side validation
- **Error Handling**: Graceful error display and recovery

## 🔄 Future Enhancements

### Phase 1: Advanced Features
- Document viewer for in-browser file preview
- Advanced search with filters and faceted search
- Resource rating and commenting system
- User profile pages with contribution statistics

### Phase 2: Community Features
- Discussion forums and Q&A sections
- Study group formation and management
- Real-time notifications
- Resource sharing and bookmarking

### Phase 3: Scalability
- Cloud storage integration (AWS S3/Cloudinary)
- Microservices architecture
- Redis caching for performance
- Advanced analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Backend Development**: Complete Express.js API with MongoDB integration
- **Frontend Development**: React.js with TypeScript and responsive design
- **Database Design**: Comprehensive schema for academic resource management
- **Authentication**: JWT-based security implementation

---

**UniHub** - Revolutionizing student resource sharing with modern web technologies.