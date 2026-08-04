# AuraCare - Hospital Management System (HMS)

A production-ready, full-stack Hospital Management System (HMS) built with **React.js, Vite, Tailwind CSS, Express.js, Node.js, and MongoDB Atlas**.

---

## 🌟 Key System Features

- **8 Specialized Role-Based Portals & Dashboards**:
  1. **Admin**: Executive analytics, user role management, staff directory, clinical departments, audit logs, full record editing.
  2. **Doctor**: OPD consultation queue, EMR diagnosis records, digital prescription issuer (PDF output), lab test ordering.
  3. **Patient**: Personal health portal, online OPD booking, prescription history, lab report downloads, billing invoices.
  4. **Receptionist**: Patient check-in desk, OPD/IPD admission control, walk-in patient registration, doctor assignment.
  5. **Nurse**: Ward patient vitals monitoring (BP, Heart Rate, Temperature, SpO2), pre-assessment notes, specimen collection queue.
  6. **Lab Assistant**: Diagnostic orders queue, pathology report entry, radiology scans upload (X-ray, MRI, CT), test catalog.
  7. **Pharmacist**: Active prescription dispensing queue, medicine stock control, low-stock warnings, expiry alerts.
  8. **Cashier**: Itemized billing, consolidated invoices, payment collection terminal (Cash/Card/UPI/Insurance), PDF receipt generator.

- **Complete Admin Editing & Record Management**: Full 1-click Edit & Delete modals across all system modules (Users, Staff, Patients, Appointments, Departments, Medicines, Lab Reports, Bills).
- **Indian Rupee (`₹`) & Localized Pricing**: Complete currency and address formatting in INR (`₹`).
- **Security & Authorization**: JWT Authentication, Bcrypt password hashing, Helmet headers, CORS, Express rate limiting, and Protected React Router guards.
- **Modern Medical UI**: Glassmorphism aesthetic, HSL color tokens, Chart.js financial & occupancy charts, dark mode toggle, Framer Motion transitions, fixed top-left return navigation.
- **Native PDF Document Generation**: Automatic generation of invoice receipts and prescription documents.

---

## ⚡ Quick Demo Accounts

Log in to the system using any of the 1-click fast fill buttons on the `/login` page or with the demo credentials:

- **Default Password for All Accounts**: `Password123!`

| Role | Demo Email Address | Main Capabilities |
| --- | --- | --- |
| **Admin** | `admin@auracare.com` | Full System Control, Analytics, User & Staff RBAC, Edit All Details |
| **Doctor** | `doctor@auracare.com` | OPD Queue, Diagnosis Entry, PDF Prescription Issuer |
| **Receptionist** | `receptionist@auracare.com` | Patient Check-in, Registration, OPD/IPD Admission Desk |
| **Nurse** | `nurse@auracare.com` | Vitals Recording (BP, HR, SpO2, Temp), Pre-Assessment |
| **Lab Assistant** | `lab@auracare.com` | Lab Order Fulfilling, Report Generation & Scans Upload |
| **Pharmacist** | `pharmacist@auracare.com` | Prescription Dispensing Queue, Medicine Stock & Rack Control |
| **Cashier** | `cashier@auracare.com` | Billing Terminal, Payment Processing, PDF Receipts |
| **Patient** | `patient@auracare.com` | Personal Portal, Appointment Booking, Report Downloads |

---

## 📁 Repository Structure

```
AuraCare-HMS/
├── client/                  # React + Vite Frontend SPA
│   ├── src/
│   │   ├── components/      # UI Header, Sidebar, Navbar, Modal, DataTable
│   │   ├── context/         # AuthContext, ThemeContext, NotificationContext
│   │   ├── pages/           # Portals, LandingPage, Login, Registration
│   │   │   ├── dashboards/  # 8 Role Dashboards (Admin, Doctor, Patient, etc.)
│   │   │   └── modules/     # Clinical & Operational Management Modules
│   │   ├── services/        # Axios API Client & PDF Downloader
│   │   ├── App.jsx          # Protected Routes & Layout
│   │   └── index.css        # Tailwind & Glassmorphism Design Tokens
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                  # Node.js + Express Backend REST API
    ├── config/              # Database Connection (MongoDB Atlas)
    ├── controllers/         # REST API Controllers
    ├── middleware/          # Auth JWT & File Upload Middleware
    ├── models/              # Mongoose Schemas (User, Patient, Doctor, Bill, etc.)
    ├── routes/              # Express API Routes
    ├── utils/               # PDFKit Generator & Database Seeder
    ├── server.js            # Express App Entry Point
    └── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas database URI (or local MongoDB)

### 1. Backend Setup
```bash
cd server
npm install
# Create a .env file with your MONGO_URI and JWT_SECRET
npm start
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 🌐 Production Deployment

- **Frontend**: [Vercel](https://vercel.com)
- **Backend**: [Render](https://render.com)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 📄 License

This project is licensed under the MIT License.
