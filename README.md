# Product Inventory Management System

A full-stack inventory management application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Product Management**: Add, edit, delete, and list products.
- **Inventory Tracking**: Track stock levels and low stock alerts.
- **Search & Filter**: Search products by name, filter by category, and sort by price/quantity.
- **Authentication**: Secure admin login and registration using JWT.
- **Dashboard**: Real-time overview of inventory stats.
- **Dark/Light Mode**: Toggle between dark and light themes.
- **Responsive Design**: Optimized for mobile and desktop.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios, React Hook Form.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas URI). **Note:** If no local MongoDB is found, the app will automatically use an in-memory database for testing purposes.

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd inventory-management
    ```

2.  **Backend Setup**
    ```bash
    cd server
    The server should start on port 5001.
    npm install
    cp .env.example .env # Configure your .env file
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd client
    npm install
    npm run dev
    ```

## Environment Variables

### Server (`server/.env`)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/inventory-app
JWT_SECRET=your_jwt_secret
```

## License

MIT
