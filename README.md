# Expense Voucher Management System

A full-stack web application designed for **Prachay Securities Private Limited** to digitize, streamline, and govern the internal employee expense reimbursement and voucher approval lifecycle.

---

## 1. System Overview & Workflow

The application replaces manual paper-based expense submissions with a multi-role workflow:

```
[Employee creates Voucher]
          │
          ▼
   (Draft Status)  ◄── Edit / Delete permitted only in Draft
          │
          ▼ (Employee uploads signature & submits)
 [Pending Approval]
          │
    ┌─────┴────────────────┐
    │                      │
    ▼                      ▼
[Approved]             [Rejected]
    │                      │
    ▼                      ▼
• Director Signature   • Rejection Reason mandatory
• Sent to Accounts     • Feedback visible to Employee
  for reimbursement
  processing
```

### Supported User Roles & Permissions

1. **Employee (`employee`)**
   - Create new vouchers (saved initially as **Draft**).
   - Edit and delete vouchers while in **Draft** status.
   - Upload or draw digital signature before submission.
   - Submit vouchers for Director review (transitions to **Pending Approval**). Once submitted, vouchers become strictly **read-only**.
   - Track status and review rejection remarks if rejected.
   - **Isolation**: Employees can only view vouchers created by themselves.

2. **Director / Admin (`director`)**
   - Organization-wide visibility into all employee reimbursement vouchers.
   - Dedicated pending review queue with quick decision actions.
   - **Approve**: Mandatory Director signature capture (via upload or digital ink pad), records approval date and approver ID.
   - **Reject**: Mandatory rejection reason/remarks explaining why the claim cannot be cleared.
   - Cannot tamper with or edit expense amounts/details entered by employees.

3. **Accounts Team (`accounts`)**
   - Organization-wide monitoring of all expense claims.
   - Search, filter, and sort vouchers across departments and categories.
   - Review employee and director signature blocks for auditing.
   - Print and export official corporate reimbursement vouchers for disbursement settlement.
   - Read-only governance (cannot create, edit, delete, approve, or reject).

---

## 2. Technology Stack

- **Frontend**:
  - React 18+ (Vite)
  - React Router DOM v7 for declarative role-protected routing
  - Lucide React for consistent UI iconography
  - Pure Vanilla CSS Design System (`index.css`) with CSS custom properties, responsive flexbox/grid, and formal corporate print stylesheets
  - HTML5 Canvas signature pad with image upload file alternative (PNG/JPG/WebP)

- **Backend**:
  - Node.js & Express.js
  - RESTful architecture with structured controllers, routes, and centralized error handling
  - JWT (JSON Web Tokens) with 24-hour expiration and Bearer authorization middleware
  - Password hashing with bcryptjs (10 salt rounds)
  - Multer for secure signature image uploads (mime-type validation, size limits)
  - `better-sqlite3` embedded relational database with Write-Ahead Logging (`WAL`) mode enabled

---

## 3. Project Setup & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Quick Start (Single Command)

1. Clone the repository and navigate into the project directory:
   ```bash
   cd PRACHAY
   ```

2. Install all root, server, and client dependencies:
   ```bash
   npm run install:all
   ```

3. Initialize the database and load realistic seed data:
   ```bash
   npm run seed
   ```

4. Launch both the backend API server (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) concurrently:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to **`http://localhost:5173`**.

---

## 4. Pre-configured Demo Accounts

For evaluation convenience, the database is pre-seeded with accounts for all three roles, plus active vouchers in Draft, Pending, Approved, and Rejected states.

| Role | Name | Email | Password | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Employee** | Aarav Sharma | `employee@prachay.com` | `employee123` | Equity Research |
| **Employee** | Pooja Patel | `pooja@prachay.com` | `employee123` | Technology |
| **Director** | Vikram Malhotra | `director@prachay.com` | `director123` | Executive Management |
| **Accounts** | Sunita Rao | `accounts@prachay.com` | `accounts123` | Finance & Accounts |

> **Note:** The login screen also features 1-click **Quick Demo Login** buttons for instant role switching without typing credentials.

---

## 5. Database Schema Explanation

The relational database is defined in `server/src/models/schema.sql` and consists of three core tables:

### 1. `users` Table
Stores authenticated employee, director, and accounts personnel profiles.
- `id` (INTEGER, Primary Key, Auto-increment)
- `name` (VARCHAR(100), Mandatory)
- `email` (VARCHAR(120), Unique, Mandatory)
- `password` (VARCHAR(255), Bcrypt hashed, Mandatory)
- `role` (VARCHAR(20), CHECK `('employee', 'director', 'accounts')`)
- `employee_id` (VARCHAR(50), Optional corporate employee code)
- `department` (VARCHAR(100), Optional department assignment)
- `created_at` (DATETIME, Defaults to current timestamp)

### 2. `vouchers` Table
Stores expense vouchers and tracks state throughout the lifecycle.
- `id` (INTEGER, Primary Key, Auto-increment)
- `voucher_number` (VARCHAR(50), Unique, auto-generated sequence e.g., `VCH-2026-0001`)
- `voucher_date` (DATE, Creation date)
- `expense_date` (DATE, Date expense was incurred, Mandatory)
- `department` (VARCHAR(100), Mandatory)
- `expense_title` (VARCHAR(200), Mandatory)
- `expense_category` (VARCHAR(100), Mandatory e.g., 'Travel & Conveyance', 'Software & Tools')
- `expense_description` (TEXT, Detailed justification)
- `amount` (DECIMAL(12, 2), Mandatory, CHECK `amount > 0`)
- `employee_id_code` (VARCHAR(50), Optional employee identifier)
- `employee_name` (VARCHAR(100), Pre-populated from claimant)
- `employee_signature` (TEXT, Stored relative image URI or base64 data)
- `status` (VARCHAR(30), CHECK `('Draft', 'Pending Approval', 'Approved', 'Rejected')`)
- `director_signature` (TEXT, Stored signature image URI)
- `approval_date` (DATETIME, Timestamp of Director action)
- `rejection_reason` (TEXT, Mandatory if rejected)
- `created_by` (INTEGER, Foreign Key to `users(id)`)
- `approved_by` (INTEGER, Foreign Key to `users(id)`)
- `created_at`, `updated_at` (DATETIME)

### 3. `audit_logs` Table
Maintains an immutable historical audit trail of state transitions for corporate compliance.
- `id` (INTEGER, Primary Key)
- `voucher_id` (INTEGER, Foreign Key to `vouchers(id)`)
- `action` (VARCHAR(50), e.g., `CREATED_DRAFT`, `SUBMITTED_FOR_APPROVAL`, `APPROVED`, `REJECTED`)
- `performed_by` (INTEGER, Foreign Key to `users(id)`)
- `performed_by_name`, `performed_by_role` (VARCHAR)
- `remarks` (TEXT)
- `created_at` (DATETIME)

---

## 6. REST API Documentation

All protected routes require an `Authorization: Bearer <token>` header obtained via login.

### Authentication Endpoints

#### `POST /api/auth/login`
Authenticates user credentials and issues a JWT token.
- **Request Body**:
  ```json
  {
    "email": "employee@prachay.com",
    "password": "employee123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": 2,
        "name": "Aarav Sharma",
        "email": "employee@prachay.com",
        "role": "employee",
        "employeeId": "EMP-1042",
        "department": "Equity Research"
      }
    }
  }
  ```

#### `GET /api/auth/me`
Returns current session profile. Requires Bearer token.

---

### Voucher Endpoints

#### `GET /api/vouchers`
Retrieves a filtered, sorted list of vouchers.
- **Access**:
  - `employee`: Returns only vouchers created by the calling user (`created_by = user.id`).
  - `director` / `accounts`: Returns vouchers across all employees in the organization.
- **Query Parameters**:
  - `search`: Keyword search matching voucher number, title, description, or employee name.
  - `department`: Filter by department name.
  - `category`: Filter by expense category.
  - `status`: `Draft` | `Pending Approval` | `Approved` | `Rejected`.
  - `startDate`, `endDate`: Expense date range filter (`YYYY-MM-DD`).
  - `minAmount`, `maxAmount`: Numeric range filter.
  - `sortBy`: `created_at`, `expense_date`, `amount`, `voucher_number`, `status`.
  - `sortOrder`: `asc` | `desc`.

#### `GET /api/vouchers/:id`
Returns single voucher details along with full audit log timeline.
- Enforces role isolation (employees cannot fetch other employees' vouchers).

#### `POST /api/vouchers`
Creates a new expense voucher. (Employee only).
- **Request Body**:
  ```json
  {
    "expenseDate": "2026-10-10",
    "department": "Equity Research",
    "expenseTitle": "Quarterly Mid-Cap Database Access",
    "expenseCategory": "Software & Tools",
    "expenseDescription": "Dataset subscription for equity coverage.",
    "amount": 14500.00,
    "signatureImage": "data:image/png;base64,...",
    "status": "Draft"
  }
  ```
- Auto-generates unique sequential voucher number (e.g. `VCH-2026-0008`).
- If status is `Pending Approval`, validates that `signatureImage` is present.

#### `PUT /api/vouchers/:id`
Updates an existing voucher. (Employee only).
- Allowed only when status is `Draft` and caller is the owner.
- Option to pass `submitNow: true` to submit for Director review.

#### `DELETE /api/vouchers/:id`
Deletes an expense voucher. (Employee only).
- Allowed only when status is `Draft` and caller is the owner.

#### `POST /api/vouchers/:id/submit`
Transitions a Draft voucher to `Pending Approval`. (Employee only).
- Enforces mandatory employee signature check.

#### `POST /api/vouchers/:id/approve`
Approves a pending voucher. (Director only).
- **Request Body**:
  ```json
  {
    "directorSignature": "data:image/png;base64,...",
    "remarks": "Approved. Forwarded for reimbursement."
  }
  ```
- Enforces mandatory Director signature check.
- Transitions status to `Approved` and timestamps `approval_date`.

#### `POST /api/vouchers/:id/reject`
Rejects a pending voucher. (Director only).
- **Request Body**:
  ```json
  {
    "rejectionReason": "Missing receipt tax invoice and exceeds quarterly limit."
  }
  ```
- Enforces mandatory `rejectionReason` check.
- Transitions status to `Rejected`.

---

### Dashboard Endpoints

#### `GET /api/dashboard/stats`
Provides role-tailored dashboard metrics:
- **Employee**: Total Vouchers, Draft Vouchers, Pending Approval, Approved Vouchers, Rejected Vouchers, Total Amount Claimed, Recent Vouchers.
- **Director**: Pending Approval Count, Approved Today, Rejected Today, Total Pending Amount, Recent Activity.
- **Accounts**: Total Vouchers, Pending Approval, Approved Vouchers, Rejected Vouchers, Total Approved Expense Amount, Recent Approved Vouchers.

---

### File Upload Endpoints

#### `POST /api/upload/signature`
Uploads raw signature image file (`multipart/form-data`, field: `signature`).
- Restricts extensions to `.png`, `.jpg`, `.jpeg`, `.webp`.
- Enforces 5MB size limit.
- Returns static URL path (e.g., `/uploads/signatures/signature-1791725...png`).

---

## 7. Business Rules & Validations Enforced

1. **Unique Voucher Numbering**: Generated sequentially per calendar year (`VCH-YYYY-XXXX`).
2. **Mandatory Fields**: Department, Expense Title, Expense Date, and Amount are required across all vouchers.
3. **Amount Validation**: Claim amount must be strictly numeric and strictly greater than zero (`amount > 0`).
4. **Draft Immutability Boundary**: Once submitted (`Pending Approval`), approved, or rejected, vouchers become strictly read-only for employees.
5. **Director Signing Mandate**: Directors cannot approve a voucher without submitting/drawing a valid signature.
6. **Rejection Transparency**: A Director cannot reject a voucher without submitting an explicit rejection reason.
7. **Accounts Read-Only Integrity**: Accounts personnel can view, filter, audit signatures, and print vouchers, but cannot alter or delete voucher records.

---

## 8. Assumptions Made During Development

1. **Standalone Deployment Simplicity**: SQLite (`better-sqlite3`) was selected as the embedded relational engine so the assignment reviewer can clone and run the project immediately without requiring an active PostgreSQL/MySQL daemon, Docker container, or database provisioning.
2. **Dual Signature Input Mechanism**: To accommodate diverse desktop and mobile devices, the signature input supports both drawing with mouse/stylus on a smooth HTML5 canvas, and uploading a scanned image file (PNG/JPG). Both generate standard image artifacts stored on the server.
3. **Indian Currency Formatting**: As Prachay Securities is an Indian financial securities firm, amounts are formatted in Indian Rupee format (`₹`, `en-IN`, e.g. `₹1,24,500.00`).
4. **Printable Document Styling**: When printing a voucher (`/print/:id`), the page automatically strips navigation bars, buttons, and responsive chrome via CSS `@media print` rules, rendering a formal corporate letterhead voucher with dual signature boxes and verification stamps ready for paper filing or PDF export.
