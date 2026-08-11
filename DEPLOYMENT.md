# Deployment Guide (Supabase + Render + Vercel)

This guide documents the server setup and deployment process for the Mini ERP + CRM Portal using a modern, easy-to-use stack: **Supabase** (Database), **Render** (Backend), and **Vercel** (Frontend).

---

## 1. Database Setup (Supabase)

Supabase provides a free, fully managed PostgreSQL database perfectly suited for Prisma.

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Under **Project Settings** -> **Database**, scroll down to the **Connection string** section.
3. Select **URI** and ensure the **Mode** is set to `Transaction` (important for Prisma).
4. Copy the connection string. It will look like this:
   `postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
5. Since you are using Prisma with PgBouncer, append `&pgbouncer=true` to your database URL if it isn't already there.
6. Supabase gives you a second connection string directly to the DB without a pooler (Port 5432) — this is needed for Prisma migrations (`DIRECT_URL`).

---

## 2. Backend Deployment (Render)

Render makes deploying Node.js apps extremely simple by syncing directly with GitHub.

### Step 1: Create Web Service
1. Push your code to your GitHub repository.
2. Go to [Render](https://render.com/) and click **New** -> **Web Service**.
3. Connect your GitHub account and select your `fundsroom` repository.

### Step 2: Configure the Service
Set up the service with the following details:
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install --include=dev && npm run build`
- **Start Command:** `npm start` (This will execute `node dist/app.js`)

### Step 3: Environment Variables
Scroll down to the **Environment Variables** section on Render and add the following:
1. `DATABASE_URL`: The transaction connection string you got from Supabase (Port 6543 with `?pgbouncer=true`).
2. `DIRECT_URL`: The direct connection string from Supabase (Port 5432). *(Note: update `schema.prisma` datasource to support `directUrl = env("DIRECT_URL")` if using migrations)*
3. `PORT`: `3001` (Render automatically overrides this, but good practice).
4. `NODE_ENV`: `production`
5. `JWT_SECRET`: Generate a random secure string (e.g., `my_super_secret_jwt_key_2024!`).
6. `FRONTEND_URL`: Leave blank for now, you will update this to your Vercel URL later.

### Step 4: Deploy and Seed
1. Click **Create Web Service**. Render will now install dependencies, run the Prisma generation (`postinstall`), and start the server.
2. Once the server is live, you can push your database schema and seed the database locally by running:
   ```bash
   # In your local backend terminal:
   # Temporarily set your local .env DATABASE_URL to the Supabase string
   npx prisma db push
   npx prisma db seed
   ```
3. Note down the Render URL (e.g., `https://erp-crm-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

Vercel is heavily optimized for Vite/React deployments.

1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import the `fundsroom` GitHub repository.
3. Configure the Project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
4. Expand the **Environment Variables** section and add:
   - `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://erp-crm-backend.onrender.com`).
5. Click **Deploy**. Vercel will automatically build the `dist` folder and host the application.
6. Once deployment finishes, you will receive your live Vercel URL!

---

## 4. Final Security Check
1. Copy your new live Vercel URL.
2. Go back to your Render Dashboard -> Environment Variables.
3. Update `FRONTEND_URL` to match your Vercel domain to secure your CORS policy.
4. Restart your Render server.

You can now visit your Vercel URL and log in using the seed credentials (`admin@erp.com` / `password123`)!
