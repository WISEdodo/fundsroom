# Full Stack Mini ERP + CRM Operations Portal

This repository contains the complete source code for a Full Stack Mini ERP & CRM system built for a wholesale/distribution company. The application provides dedicated tools for internal employees across various roles (Admin, Sales, Warehouse, and Accounts) to manage customers, inventory, and sales challans.

## 🚀 Tech Stack

### Backend
- **Framework**: Node.js with Express.js (TypeScript)
- **Database**: PostgreSQL (managed via Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt for password hashing
- **Middleware**: Helmet (security), CORS, Morgan (logging)

### Frontend
- **Framework**: React.js with Vite (TypeScript)
- **Styling**: Pure Vanilla CSS with a comprehensive CSS Variables design system (no external UI frameworks like Tailwind/Bootstrap used, as per requirements).
- **Icons**: Lucide React
- **Routing**: React Router DOM (Protected Routes)
- **State/Requests**: Context API (Auth), Axios with global interceptors

---

## 🏗️ Architecture & Database Design

The database was designed using **Prisma** to ensure relational integrity and strict typing. 

### Core Models & Fields Explicitly Documented:
1. **User**: Handles authentication and role-based access control (`admin`, `sales`, `warehouse`, `accounts`).
2. **Customer**: CRM entity storing:
   - Optional GST Number (`gstNumber String?`)
   - Optional Address (`address String?`)
   - Customer Type (`retail`, `wholesale`, `distributor`)
   - **Customer Status** (`Lead`, `Active`, `Inactive`)
   - **Follow-up Date** (`followUpDate DateTime?`)
   - **Customer Notes** (`notes String?`) - specifically kept separate from chronological follow-ups.
3. **CustomerFollowUp**: Tracks chronological follow-up notes and communications against customers.
4. **Product**: Inventory master storing SKUs, prices, category, current stock, minimum stock alert threshold, and a **Location/Warehouse** field (`location String?`).
5. **StockMovement**: An audit trail recording every addition (`IN`) or deduction (`OUT`) of stock. Explicitly records:
   - The **quantity changed** (`quantity Int`)
   - **Created by** (`createdBy String` linked to the User)
   - **Timestamp** (`createdAt DateTime`)
6. **Challan**: Sales dispatch orders storing:
   - An **explicit Challan Number field** (`challanNumber String @unique`) that is **automatically generated** (e.g., `CHL-1691763421`).
   - A **Customer Snapshot** (`customerSnapshot Json`) to prevent historical data mutation if the customer changes later.
   - An **explicit Total Quantity field** (`totalQuantity Int`).
   - **Created By** (`createdBy String` linked to User) and **Created Date** (`createdAt DateTime`) fields.
   - **Status** enum explicitly supporting exactly three values: `Draft`, `Confirmed`, and `Cancelled`.
7. **ChallanItem**: Sub-items for a Challan, explicitly storing a **Product Snapshot** (`productSnapshot Json`) for historical pricing/name accuracy at the time of sale.

---

## ✨ Key Features Implemented

### 1. Role-Based Access & Authentication
- Secure JWT-based login system.
- Global Axios interceptors that automatically attach tokens and handle 401 unauthorized logouts.
- UI automatically adapts and hides restricted navigation links based on the active user's role.

### 2. CRM (Customer Relationship Management)
- **Directory**: View, search, and manage a directory of customers.
- **Dynamic Forms**: Create and edit customer details including business info, tax IDs, and lead statuses.
- **Follow-ups**: A dedicated customer profile page with a timeline UI to log and track chronological notes and interactions.

### 3. Inventory & Warehouse Management
- **Product Master**: Manage product catalogs, SKUs, and pricing.
- **Smart Stock Alerts**: Products automatically highlight with a "Low Stock" badge if they drop below their configured minimum threshold.
- **Manual Adjustments**: Warehouse staff can manually trigger `IN`/`OUT` stock adjustments with mandatory reason codes.
- **Audit Logs**: Every stock change is permanently logged with the user who made the change, timestamp, and quantity.

### 4. Sales Challans (Order Management)
- **Drafting**: Sales teams can create draft challans. The dynamic UI form allows users to explicitly **select a customer** and add **multiple products with individual quantities**. Total quantities are calculated automatically.
- **State Machine**: Challans explicitly move through `draft`, `confirmed`, and `cancelled` statuses.
- **Complex Business Logic & Error Handling**: When a challan is `confirmed`, the backend API intercepts the request, verifies sufficient stock exists, and automatically deducts the stock from the `Product` table. **If stock is insufficient, the transaction rolls back and returns a proper 400 API error response to the frontend**, ensuring inventory never drops below zero.

---

## 💻 Running the Application Locally

You will need two terminal windows to run this application.

### 1. Database Setup
Ensure PostgreSQL is running on your machine.
```bash
cd backend
npx prisma db push
npx prisma db seed
```

### 2. Start Backend
```bash
cd backend
npm run dev
# Starts on http://localhost:3001
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
# Starts on http://localhost:5173
```

### 4. Test Credentials
The database seed provides the following pre-configured users (Password for all is `password123`):
- `admin@erp.com`
- `sales@erp.com`
- `warehouse@erp.com`
- `accounts@erp.com`
