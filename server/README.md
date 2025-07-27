
---

## ✅ `server/README.md`

```md
# 🛠️ Task Utility Pro – Backend

This is the **backend** for the Task Utility Pro application — a RESTful API built with **Express.js** and **TypeScript**, using **PostgreSQL** for data storage and **Knex.js** as the query builder.

---

## 🚀 Tech Stack

- 🧩 Express.js 5 (beta)
- 🧠 TypeScript
- 🗄️ PostgreSQL (with Knex.js)
- 🔐 JWT Authentication
- 🌐 CORS, Rate Limiting, Cookie Parser
- 📨 Nodemailer for emails
- 📚 Winston for logging
- 🔒 Google Auth Integration

---

## 📦 Installation

```bash
cd server
npm install

## 🧪 Run in Development Mode

```bash
npm run dev
```

## 🏗️ Build for Production

```bash
npm run build
```

## 🏗️ Start Server (Production)

```bash
npm start
```

## 🧪 Run Tests

```bash
npm run test
```

## ⚙️ Environment Variables

Create a .env file in the server/ directory with the following structure:

```ini
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://your-frontend-url.com
GOOGLE_CLIENT_ID=your_google_client_id
```
## 🧰 Database Migrations

```bash
npx knex migrate:latest --knexfile knexfile.ts
npx knex seed:run --knexfile knexfile.ts
```
## 🛡️ Security & Middleware

 - Rate Limiting
 - CORS Config
 - Logging with Winston
 - Email verification via Nodemailer

## 📁 Folder Structure

```pgsql
server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── dist/ (build output)
├── knexfile.ts
└── .env
```

## 🔗 Frontend Repo

The frontend client can be found in the /client folder or on GitHub

## 📌 Notes

 - Designed to support both web and mobile clients (React Native via Expo)
 - Modular structure for scalability and testability