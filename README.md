# mAIple AI Conference Portal

A comprehensive web platform for AI/ML idea submission, evaluation, and management. Built with React, TypeScript, Node.js, Express, and MongoDB.

## 🎯 Features

- **User Management**: Registration with OTP verification, role-based access (Basic, Founder, Evaluator, Admin)
- **Idea Submission**: Founders can submit AI/ML ideas with pitch decks
- **Evaluation System**: Expert evaluators score ideas on 4 criteria (Innovation, Feasibility, Impact, Presentation)
- **Role Requests**: Users can request Founder/Evaluator roles with admin approval workflow
- **Admin Dashboard**: Comprehensive management of users, ideas, evaluations, and role requests
- **Notification System**: Real-time notifications for all major events
- **Queue-Based Assignment**: Auto-assign evaluators based on workload (max 3 pending per evaluator)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager
- **SMTP Email Account** (Gmail, Brevo, SendGrid, etc.)

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/SuhasPalani/Conference.git
cd Conference
```

---

### 2️⃣ Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

Add the following environment variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/maiiple-conference

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=180d

# SMTP Email Configuration (Required for OTP & Notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_SENDER_NAME=mAIple Conference
SMTP_SENDER_EMAIL=noreply@maipleconf.com

# File Upload Configuration
ALLOWED_FILE_TYPES=pdf,ppt,pptx
MAX_FILE_SIZE=10485760
```

#### Important Notes:

- **JWT_SECRET**: Generate a secure random string (at least 32 characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- **SMTP Configuration**: 
  - For Gmail: Enable 2FA and create an [App Password](https://myaccount.google.com/apppasswords)
  - For Brevo (formerly Sendinblue): Use their [SMTP service](https://www.brevo.com/)
  - For SendGrid: Get SMTP credentials from [SendGrid](https://sendgrid.com/)

#### Create Admin User

```bash
npm run create-admin
```

Follow the prompts to create your first admin account:
```
Admin email: admin@maipleconf.com
Admin full name: Admin User
Admin password: admin123
```

#### Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

---

### 3️⃣ Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
```

#### Environment Configuration

Create a `.env` file in the `frontend` directory:

```bash
touch .env
```

Add the following:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🗄️ Database Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux (systemd)
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

3. Verify MongoDB is running:
   ```bash
   mongosh
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in backend `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/maiiple-conference?retryWrites=true&w=majority
   ```

---

### Brevo (Sendinblue) Setup (Recommended for Production)

1. Sign up at [Brevo](https://www.brevo.com/)
2. Get SMTP credentials from Settings → SMTP & API
3. Update `.env`:
   ```env
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your-brevo-email@example.com
   SMTP_PASS=your-brevo-smtp-key
   ```

---

## 🧪 Testing the Setup

### 1. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### 2. Create a Test User

1. Click "Get Started" or "Sign Up"
2. Fill in registration details
3. Check your email for the OTP code
4. Verify your email with the OTP
5. Login with your credentials

### 3. Login as Admin

```
Email: admin@maipleconf.com (or what you created)
Password: admin123 (or what you set)
```

### 4. Test Workflow

1. **As User**: Request Founder/Evaluator role
2. **As Admin**: Approve role request
3. **As Founder**: Submit an idea
4. **As Admin**: Assign evaluator to the idea
5. **As Evaluator**: Evaluate the idea
6. **As Founder**: View evaluation results

---

## 📁 Project Structure

```
maiiple-conference/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files (DB, JWT, Email)
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, RBAC, Rate limiting
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Email, file services
│   │   ├── utils/           # Helper functions, validation
│   │   └── server.js        # Express server entry point
│   ├── uploads/             # Uploaded pitch decks (auto-created)
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # React entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
└── README.md
```

---

## 🔧 Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution**: 
- Ensure MongoDB is running: `mongosh`
- Check `MONGODB_URI` in `.env`
- For Atlas: Whitelist your IP address

### Issue: Email Not Sending
**Solution**:
- Verify SMTP credentials in `.env`
- For Gmail: Use App Password, not regular password
- Check spam folder
- Test SMTP connection:
  ```bash
  npm run test-email
  ```

### Issue: Port Already in Use
**Solution**:
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

### Issue: File Upload Fails
**Solution**:
- Ensure `uploads/` directory exists and is writable
- Check `MAX_FILE_SIZE` in `.env` (default: 10MB)
- Verify file type is allowed (PDF, PPT, PPTX)

### Issue: OTP Not Working in Development
**Solution**:
- Check backend console for the OTP (printed in development mode)
- Or check your email spam folder

---

## 🚀 Production Deployment

### Environment Variables for Production

Update your production `.env` files:

**Backend:**
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://...your-atlas-connection...
JWT_SECRET=your-production-secret-key
```

**Frontend:**
```env
VITE_API_URL=https://your-api-domain.com/api
```

### Build Commands

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
npm run build
npm run preview
```

---

## 📚 API Documentation

API documentation is available in `postman.json`. Import it into Postman for full API testing.

**Key Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/ideas` - Create idea (Founder)
- `POST /api/evaluations` - Submit evaluation (Evaluator)
- `GET /api/admin/dashboard` - Admin dashboard stats

