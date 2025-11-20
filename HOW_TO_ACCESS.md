# Quick Start Guide

## 🚀 How to Access the Application

### 1. Open your browser and go to:
```
http://localhost:3000
```

### 2. You'll be redirected to the Dashboard
Since you're not logged in, the app will automatically redirect you to `/login`

### 3. Login Page
- The login page has **both Login and Register** functionality
- Click the toggle at the bottom to switch between them

### 4. Create Admin Account (First Time Users)
**Option 1 - Use Pre-created Admin:**
```
Username: admin
Password: admin123
```

**Option 2 - Register New Admin:**
1. Click "Don't have an account? Register"
2. Enter username and password
3. After registering, I'll promote you to admin via the backend

### 5. After Login
You'll be redirected to the Dashboard and can:
- View products
- Add products (admin only)
- View activity logs (admin only)

## ⚠️ Current Setup Notes
- Server running on port **5200** (in-memory database)
- Client running on port **3000**
- Data resets when server restarts (temporary database)

## 🔍 If Login Page Doesn't Show
1. Make sure client server is running: `http://localhost:3000`  
2. Try going directly to: `http://localhost:3000/login`
3. Check browser console (F12) for errors
