Name: RFP System Backend

Tech Stack:
Runtime: Node.js
Framework: Express.js
Database: MongoDB with Mongoose ODM
Authentication: JWT with bcryptjs
Email Services: Nodemailer, IMAP for email monitoring
File Upload: Multer
Validation: Express Validator
AI Integration: OpenAI API
Caching: Node Cache
Logging: Winston
Environment: dotenv
HTTP Client: Axios
CORS: Cross-Origin Resource Sharing

Features:
User Authentication and Authorization
JWT-based authentication
Secure password hashing with bcryptjs
Role-based access control

RFP Management
Create, read, update, delete RFPs
RFP status tracking
Vendor-RFP matching

Vendor Management
Vendor registration and profiles
Vendor capabilities management
Vendor-RFP associations

Proposal Management
Proposal creation and submission
Proposal tracking and status updates
Document upload support

Email Integration
Automated email monitoring
Email parsing with mailparser
Notification system via Nodemailer

AI-Powered Features
OpenAI integration for intelligent processing
Automated content analysis
Smart matching algorithms

File Management
Secure file upload with Multer
Document storage and retrieval
File size limits 5MB

Error Handling and Logging
Centralized error handling middleware
Winston logging for debugging and monitoring
Structured error responses

Local Run Setup

Prerequisites:
Node.js version 14 or higher
MongoDB local or cloud instance
Git

Installation Steps:

Clone the repository
git clone  https://github.com/Hanumant-Pisal/aerchain_backend
cd RFP-System/backend

Install dependencies
npm install

Set up environment variables
Create a .env file with:
PORT=8000
MONGODB_URL=mongodb://localhost:27017/rfp-system
JWT_SECRET=your-jwt-secret-key
OPENAI_API_KEY=your-openai-api-key
EMAIL_HOST=your-email-host
EMAIL_PORT=993
EMAIL_USER=your-email-username
EMAIL_PASS=your-email-password

Start MongoDB
Make sure MongoDB is running or update MONGODB_URL

Run the development server
npm run dev

Verify server status
curl http://localhost:8000/test

Expected response: api is working

Available Scripts:
npm run dev - start server with nodemon
npm run build - build application
npm test - run tests

API Endpoints:
api/auth - Authentication
api/vendors - Vendor management
api/rfps - RFP management
api/proposals - Proposal management

Author:
Hanumant Pisal