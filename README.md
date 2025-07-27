# 🧠 Task Utility Pro

**Task Utility Pro** is a modern full-stack task management application designed to help users organize, track, and analyze their tasks effectively.

Built using a scalable architecture with the following technologies:

- 🌐 **Frontend**: React 19 + TypeScript (Vite)
- 🧩 **Backend**: Express.js + TypeScript
- 🗄️ **Database**: PostgreSQL (via Knex.js ORM)
- ☁️ **Hosting**: Vercel (Frontend), Render/AWS (Backend)
- 🔐 **Auth**: Google OAuth2 (via @react-oauth/google)

> 💼 Built as a portfolio project to showcase full-stack development capabilities and to serve as the foundation for a future cross-platform mobile app using Expo.

---

## 🚀 Features

### 🔧 General
- Full CRUD support for tasks
- Secure Google OAuth login
- JWT-based authentication and refresh tokens
- Flexible authentication: Google OAuth or email/password signup (accounts can be linked)
- Persistent storage using PostgreSQL
- RESTful API with Express
- Rate limiting, CORS, logging, and environment configuration

### 📊 Analytics
- Task insights and trends using `react-chartjs-2` and `chart.js`

### 📆 Scheduling
- Calendar integration with `react-big-calendar` and `date-fns`

### 📱 Future Plans
- React Native mobile app (using Expo) sharing the same backend
- Deployment to Google Play Store

---

## 🖥️ Live Demos

- 🌍 **Frontend (Vercel)**: [https://task-utility-pro.vercel.app](#)
- 🌐 **Backend API (Render/AWS)**: [https://api.taskutilitypro.com](#)

---

## 🧰 Tech Stack

### Frontend (Client)

| Tool | Description |
|------|-------------|
| Vite | Fast build tool |
| React 19 | UI library |
| TailwindCSS | Utility-first CSS |
| Chart.js | Analytics |
| React Router DOM | Navigation |
| Notistack | Snackbar system |
| React Big Calendar | Task scheduling |
| Axios | API communication |
| Lucide | Icon set |

### Backend (Server)

| Tool | Description |
|------|-------------|
| Express | Web server framework |
| PostgreSQL | Relational database |
| Knex.js | SQL query builder |
| JWT | Auth tokens |
| Google Auth Library | OAuth2 integration |
| Bcrypt.js | Password hashing |
| Nodemailer | Email functionality |
| Winston | Logging |
| Rate limiter | Security enhancement |

---

## 🔧 Setup Instructions

**1. Clone the Repository**

```bash
git clone https://github.com/sturnusV/task-utility-pro.git
cd task-utility-pro
```

### 2. Setup Client (Frontend)

```bash
cd client
npm install
cp .env.example .env
```

**.env example:**

```ini 
VITE_API_URL=https://api.taskutilitypro.com
```

**Then run:** 

```bash
npm run dev
```

### 3. Setup Server (Backend)

```bash
cd ../server
npm install
cp .env.example .env
```

**.env example:**

```ini
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_secret
CLIENT_URL=https://task-utility-pro.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
```

**then run:**

```bash
npm run dev
```

### 4. Database Setup

```bash
npx knex migrate:latest --knexfile knexfile.ts
npx knex seed:run --knexfile knexfile.ts
```

## 🧪 Testing

```bash
npm run test
```

## 📦 Build Commands

Client

```bash
npm run build
```

Server

```bash
npm run build
```

## 🛡️ Security & Middleware

 - CORS
 - Rate Limiting
 - Cookie Parser

## 📈 Future Enhancements

 - Push notifications
 - Admin dashboard
 - User preferences (themes, languages)
 - Offline mode with local storage
 - Google Calendar syncing
 
## 👨‍💻 Author

Yusuf ATAKAN
🔗 GitHub - sturnusV

## 📃 License

This project is licensed under the MIT License.