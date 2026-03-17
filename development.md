# CrewUp Development Setup Guide

This guide provides step-by-step instructions on how to set up and run the CrewUp project on a new system after cloning from GitHub.

## Prerequisites

Before starting, ensure you have the following installed on your system:
- **Node.js**: v18.0.0 or higher recommended.
- **npm**: Comes with Node.js (or yarn/pnpm).
- **MongoDB**: You can run MongoDB locally or create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **Git**: For cloning the repository.

---

## 1. Clone the Repository

First, clone the project from GitHub and navigate into the root directory:

```bash
git clone https://github.com/divyanshsoni31/Crew_Up.git
cd Crew_Up
```

The repository is structured as a monorepo with two main folders:
- `/back_end`: Node.js, Express, and MongoDB REST API.
- `/front_end`: React, Vite, and TailwindCSS application.

---

## 2. Backend Setup (`/back_end`)

Open a terminal specifically for the backend.

### Install Dependencies
```bash
cd back_end
npm install
```

### Environment Variables
Create a file named `.env` in the root of the `back_end` folder and configure the following required variables:

```env
# Server Configuration
PORT=3000

# Database Configuration
# Local MongoDB example: mongodb://localhost:27017/crewup
# Atlas MongoDB example: mongodb+srv://<username>:<password>@cluster0...
MONGODB_URI=mongodb://localhost:27017/crewup

# Security Setup (Required for Authentication)
JWT_SECRET=alien@3108

# Optional: Google OAuth Configuration (If using Google Login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Email Configuration (For OTP/Nodemailer)
EMAIL_USER=your_emailid@gmail.com
EMAIL_PASS=your_app_specific_password
```
*Note: Make sure your `PORT` is set to `3000`, as the frontend hardcodes `http://localhost:3000` for API requests.*

### Run the Backend Server
Start the backend development server using nodemon:
```bash
npm run dev
```
You should see output indicating that the server is running on `http://localhost:3000` and that MongoDB connected successfully.

---

## 3. Frontend Setup (`/front_end`)

Open a **new, separate terminal** for the frontend application.

### Install Dependencies
Navigate to the frontend folder and install the dependencies. The project utilizes standard npm packages for React and Vite.
*Note: If you run into peer-dependency conflicts with Material UI or Radix, you can use `--legacy-peer-deps` or `--force`.*

```bash
cd front_end
npm install
```

### Run the Frontend Server
Start the Vite development server:
```bash
npm run dev
```
Vite will start the server quickly. You should see an output similar to:
`Local: http://localhost:5173/` (Your port might vary depending on Vite's availability).

---

## 4. Accessing the Application

1. Open your web browser.
2. Navigate to the Vite URL provided in your frontend terminal (usually `http://localhost:5173`).
3. Ensure the backend terminal is running without errors to allow API requests (like Login and Register) to process correctly.

## 5. Troubleshooting Common Issues

- **MongoDB Connection Error:** Ensure your local MongoDB service is actively running or that your MongoDB Atlas IP Access List includes your current IP address.
- **CORS Issues on Frontend:** If the frontend fails to connect to the backend due to CORS, verify that your backend server is actively listening on `http://localhost:3000` (where the frontend sends its requests).
- **Missing Images/Assets:** The backend uses `multer` to save images to an `/uploads` folder. The folder might not sync through git depending on the `.gitignore`. The backend will automatically create standard upload folders, but if image uploads fail, ensure an `uploads` folder exists inside `/back_end`.
