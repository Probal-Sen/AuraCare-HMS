# REST API Reference - AuraCare

All API requests (except `/api/auth/login` and `/api/auth/register`) require a Bearer token in header:
`Authorization: Bearer <JWT_TOKEN>`

## 1. Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token |
| `POST` | `/api/auth/register` | Register new patient account |
| `GET` | `/api/auth/me` | Fetch active user profile |
| `POST` | `/api/auth/upload-avatar` | Upload avatar profile photo |

## 2. Patients & Admissions

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/patients` | Fetch patients list (supports `search`, `admissionType`) |
| `POST` | `/api/patients` | Register new OPD/IPD patient |
| `GET` | `/api/patients/:id` | Get single patient record |
| `PUT` | `/api/patients/:id` | Update patient record |
| `DELETE` | `/api/patients/:id` | Delete patient record (Admin) |

## 3. Appointments

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/appointments` | Fetch appointments list |
| `POST` | `/api/appointments` | Book new appointment |
| `PUT` | `/api/appointments/:id` | Update status or record vitals |
| `DELETE` | `/api/appointments/:id` | Cancel appointment |

## 4. Prescriptions & Pharmacy

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/prescriptions` | Fetch prescriptions queue |
| `POST` | `/api/prescriptions` | Issue new prescription (Doctor) |
| `PUT` | `/api/prescriptions/:id/dispense` | Dispense medicine (Pharmacist) |
| `GET` | `/api/prescriptions/:id/pdf` | Download PDF prescription document |
| `GET` | `/api/pharmacy/medicines` | Get medicine inventory & alerts |
| `POST` | `/api/pharmacy/medicines` | Add medicine to stock |

## 5. Billing & Invoices

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/bills` | Fetch billing invoices |
| `POST` | `/api/bills` | Create itemized bill |
| `POST` | `/api/bills/:id/pay` | Process cash/card/online payment |
| `GET` | `/api/bills/:id/pdf` | Download PDF bill invoice |

## 6. Dashboards & Analytics

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/dashboard/admin` | Fetch admin executive KPI stats & charts |
| `GET` | `/api/dashboard/doctor` | Fetch doctor daily schedule & pending reports |
| `GET` | `/api/dashboard/patient` | Fetch patient portal history & bills |
