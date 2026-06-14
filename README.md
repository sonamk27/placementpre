# PrepMate AI

A modern, responsive AI-powered placement preparation web application built with
React, Tailwind CSS, Framer Motion, and Chart.js.

## Scripts

```bash
npm install
npm run dev
npm run server
npm run build
```

## Backend setup

Copy `.env.example` to `.env`, then set `MONGODB_URI`, `JWT_SECRET`, and
`OPENAI_API_KEY`.

The Communication Coach API runs on `http://127.0.0.1:5000` by default and the
Vite dev server proxies `/api` requests to it.

Key endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/communication/start-topic`
- `POST /api/communication/analyze`
- `GET /api/communication/history`
- `GET /api/communication/stats`
- `GET /api/communication/report/weekly`
- `GET /api/communication/summary/monthly`
- `GET /api/communication/export?format=json|csv`
