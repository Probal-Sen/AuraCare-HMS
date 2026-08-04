# AuraCare - Enterprise Hospital Management System

A production-ready, full-stack Hospital Management System (HMS) built with React.js, Vite, Tailwind CSS, Express.js, Node.js, and MongoDB.

## 🌟 Key Features

- **8 Role-Based User Portals & Dashboards**:
  1. **Admin**: Executive analytics, user management, staff directory, departments, audit logs, system configuration.
  2. **Doctor**: Daily schedule, OPD queue, EMR diagnosis records, digital prescription issuer (PDF output), lab recommendations.
  3. **Patient**: Personal health portal, online appointment booking, prescription history, lab test reports download, billing invoices.
  4. **Receptionist**: Patient check-in, OPD/IPD admission desk, walk-in registration, doctor assignment.
  5. **Nurse**: Ward patient vitals tracking (BP, Heart Rate, Temperature, SpO2), pre-assessment notes, specimen collection.
  6. **Lab Assistant**: Diagnostic orders queue, upload pathology reports, upload radiology scans (X-ray, MRI, CT), test cost catalog.
  7. **Pharmacist**: Active prescription dispensing queue, medicine inventory control, low stock alerts, stock expiry warnings.
  8. **Cashier**: Itemized billing, consolidated invoices, payment terminal (Cash/Card/UPI/Insurance), PDF receipt generator.

- **Security & RBAC**: JWT Authentication, Bcrypt password hashing, Helmet headers, CORS, Express rate limiting, Protected React Router guards.
- **Modern Medical UI**: Glassmorphic styling, HSL color tokens, Chart.js financial/occupancy analytics, dark mode toggle, Framer Motion animations.
- **PDF Generation**: Native PDF bill invoices & prescription documents.

---

## ⚡ Quick Demo Accounts

Log in to the system using any of the 1-click fast fill buttons on the `/login` page or with credentials:
- **Default Password for All Demo Accounts**: `Password123!`

| Role | Email Address |
| --- | --- |
| **Admin** | `admin@arogyahms.com` |
| **Doctor** | `doctor@arogyahms.com` |
| **Receptionist** | `receptionist@arogyahms.com` |
| **Nurse** | `nurse@arogyahms.com` |
| **Lab Assistant** | `lab@arogyahms.com` |
| **Pharmacist** | `pharmacist@arogyahms.com` |
| **Cashier** | `cashier@arogyahms.com` |
| **Patient** | `patient@arogyahms.com` |

---

## 📁 Project Structure

```
arogya-hms/
├── client/          # Vite + React Frontend SPA
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
└── server/          # Node.js + Express Backend REST API
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── utils/
    ├── server.js
    └── package.json
```
