# 🧩 Task Utility Pro – Frontend

This is the **frontend** for the Task Utility Pro application — a task management tool built using **React 19**, **TypeScript**, and **Vite**. It features a clean UI, Google login, Hybrid Google OAuth and email/password signup, calendar integration, and task analytics.

---

## 🚀 Tech Stack

- ⚛️ React 19
- 🧠 TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS
- 📆 React Big Calendar + Date-fns
- 📊 Chart.js + React-Chartjs-2
- 🔐 Google OAuth via `@react-oauth/google`
- 📦 Axios for API requests
- 🌐 React Router DOM 7

---

## 📦 Installation

```bash
cd client
npm install
```

## 🧪 Run in Development Mode

```bash
npm run dev
```

## 🏗️ Build for Production

```bash
npm run build
```

## 🧪 Preview Production Build

```bash
npm run preview
```

## ⚙️ Environment Variables

Create a .env file in the client/ directory:

```ini
VITE_API_URL=https://your-api-url.com
```
Make sure this points to the deployed backend API base URL.

## 📁 Folder Structure


client/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── Main.tsx
├── vite.config.ts
└── index.html


## 📌 Notes

 - This app is designed to be responsive and mobile-ready.
 - When building a React Native version, ensure consistent API request patterns using the same backend base URL.