# Full-Stack Discussion Forum

A complete forum platform built with React, Node.js, Express, and MongoDB.

## Features
- Complete Authentication (Register, Login, JWT, bcrypt)
- Forum functionality (Create, Read, Delete posts)
- Commenting system
- Responsive, modern simple UI

## Folder Structure
```
root
├── client (React frontend)
└── server (Node/Express backend)
```

## Running the Project Locally

### 1. Backend Setup
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make sure MongoDB is running (the default connection string is `mongodb://localhost:27017/forumapp` configured in `server/.env`).
   
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

The frontend will load at `http://localhost:3000` and the backend is running at `http://localhost:5000`.

Enjoy building and interacting on the platform!
