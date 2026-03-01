# SecureOrder – Order Management System

Full-stack **MERN** procurement/order tracking application with secure JWT authentication, role-based access (User/Admin), real-time updates via Socket.io, audit logging and analytics dashboard.

## Screenshots

### Dashboard (Admin View)
![Dashboard - Admin](screenshots/dashboard-admin.png)

### Order Management Page
![Orders Page](screenshots/orders-page.png)

### Analytics Dashboard (Chart)
![Analytics Chart](screenshots/analytics-chart.png)

### Audit Log (Detailed Actions)
![Audit Log](screenshots/audit-log.png)

### My Profile (User View with Stats)
![My Profile](screenshots/my-profile.png)

### All Users List (Admin)
![All Users](screenshots/users-list.png)

## Features

### Authentication & Security
- Register/Login with JWT access + refresh tokens
- Forgot Password + Reset via email link (Nodemailer)
- Role-based access control (RBAC): User vs Administrator
- Protected routes & Axios interceptors for token refresh

### Order Management
- Create orders (product, category, quantity)
- View own orders (users) / all orders (admins)
- Update status (Pending → Processing → Completed / Cancelled)
- Delete orders (own pending for users, any for admins)
- Admin sets unit price → total auto-calculates (quantity × price)
- Real-time updates using Socket.io (live create/update/delete)

### Admin Tools
- Global stats cards (Total, Pending, Processing, Completed) with colorful gradients
- Analytics dashboard – bar chart of order status distribution (Chart.js)
- Full audit log – tracks every action (who, what, when, details)
- All users list with roles and quick actions

### User Experience
- Beautiful dark theme with glassmorphism cards
- Responsive design (mobile + desktop)
- Toast notifications, loading spinners, confirmation dialogs
- My Profile page with personal stats

## Tech Stack

**Frontend**  
- React 18 (Create React App)  
- React Router v6  
- Bootstrap 5 + custom dark theme  
- Axios + interceptors  
- Socket.io-client  
- Chart.js + react-chartjs-2  
- SweetAlert2 (logout confirmation)  

**Backend**  
- Node.js + Express  
- MongoDB (Atlas) + Mongoose  
- JWT (access + refresh tokens)  
- bcryptjs (password hashing)  
- Socket.io (real-time)  
- Nodemailer (password reset emails)  
- Crypto (secure tokens)

## Folder Structure
SECUREORDERAPI/
├── frontend/                # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # All pages & UI (Dashboard, Orders, Login, etc.)
│   │   ├── context/         # AuthContext
│   │   ├── services/        # api.js (Axios)
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── src/                     # Backend source
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── ...
├── .env                     # MongoDB, JWT, email secrets
└── README.md


## Local Setup

### Backend
```bash
cd src
npm install
# Create .env with MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS, etc.
node server.js
# or npm run dev (if nodemon installed)

### Frontend
cd frontend
npm install
npm start