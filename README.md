# Student-Dropout-Risk-Prediction

An AI-powered web application that predicts student dropout risk, generates personalized career roadmaps, and provides actionable insights to improve academic success.

---

## 🚀 Features

### Core Features
- Student dropout risk prediction using rule-based analytics
- Role-based dashboards for Students and Teachers
- Batch CSV upload for bulk student predictions
- AI-powered career roadmap generation
- Interactive analytics dashboards
- Secure JWT authentication

### Student Features
- Personal risk score analysis
- Performance insights by subject/topic
- Personalized career roadmap
- Learning resource recommendations
- Progress tracking.

### Teacher Features
- Class-wide risk analytics
- Bulk student data upload
- Student monitoring dashboard
- Early intervention suggestions
- Report generation.

---

## 🛠 Tech Stack

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

### Backend
- Node.js
- Next.js API Routes
- Prisma ORM
- SQLite Database
- JWT Authentication
- bcryptjs

### AI / Analytics
- z-ai-web-dev-sdk
- Custom prediction engine
- Explainable risk analysis

---

## 📋 Prerequisites

Install:
- Node.js 18+
- npm
- Git

Check versions:

```bash
node -v
npm -v
```

---

## 🚀 Local Setup

### 1. Clone repository

```bash
git clone https://github.com/sathwik27-ai/Student-Dropout-Risk-Prediction.git
cd Student-Dropout-Risk-Prediction
```

### 2. Install dependencies

```bash
npm install
```

---

## 🔐 Environment Setup

Create a `.env` file in project root:

```env
DATABASE_URL="file:./prisma/custom.db"
JWT_SECRET="your-secret-key"
```

Example:

```env
DATABASE_URL="file:./prisma/custom.db"
JWT_SECRET="student-dropout-secure-key"
```

---

## 🗄 Database Setup

Generate Prisma client:

```bash
npx prisma generate
```

Push schema to database:

```bash
npx prisma db push
```

This automatically creates:

```text
prisma/custom.db
```

Optional: seed database

```bash
npx tsx src/lib/seed.ts
```

---

## ▶ Running Project

Start development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3001
```

(Port may vary depending on availability.)

---

## 🔐 Default Login Credentials

### Teacher
Email:
```text
teacher@university.edu
```

Password:
```text
teacher123
```

### Student
Email:
```text
alice@university.edu
```

Password:
```text
student123
```

---

## 📊 Prediction Factors

Risk score is based on:
- GPA
- Attendance
- Assignments missed
- Previous backlogs
- Mental health score

### Risk Levels
- LOW → 0–33%
- MEDIUM → 34–66%
- HIGH → 67–100%

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── api/
│   ├── student/
│   ├── teacher/
│   └── globals.css
├── components/
├── contexts/
├── hooks/
└── lib/
    ├── auth.ts
    ├── db.ts
    └── seed.ts

prisma/
└── schema.prisma
```

---

## 🔧 Scripts

```bash
npm run dev
```
Start development server

```bash
npm run build
```
Build project

```bash
npm run start
```
Production build

```bash
npm run lint
```
Lint code

```bash
npx prisma generate
```
Generate Prisma client

```bash
npx prisma db push
```
Sync database schema

---

## ⚠ Troubleshooting

### Prisma Client Error

Error:

```text
Prisma client did not initialize
```

Fix:

```bash
npx prisma generate
```

---

### Database File Error

Error:

```text
Unable to open database file
```

Fix:
1. Ensure `.env` exists
2. Verify:

```env
DATABASE_URL="file:./prisma/custom.db"
```

Then run:

```bash
npx prisma db push
```

---

### Git Push Rejected

If push fails with:

```text
fetch first
```

Run:

```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

---

## 🚀 Future Enhancements

- Real-time notifications
- Mobile application
- Advanced ML models
- LMS integration
- Multi-language support
- Email alerts
- Peer mentoring

---

Built with ❤️ for helping students succeed academically.
