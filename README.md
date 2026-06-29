# Student-Dropout-Risk-Prediction

🚀 Live Demo: https://student-dropout-risk-prediction-sigma.vercel.app

An AI-powered web application that predicts student dropout risk, generates personalized career roadmaps, and provides actionable insights to improve academic success.

---

## 🚀 Features

### Core Features
- Student dropout risk prediction using rule-based analytics
- Role-based dashboards (Student / Teacher)
- Batch CSV upload for bulk predictions
- AI-powered career roadmap generation
- Interactive analytics dashboards
- Secure JWT authentication
- Neon PostgreSQL database integration
- Real-time student performance insights

---

### 🎓 Student Features
- Personal dropout risk score
- Performance insights by subject/topic
- Personalized career roadmap
- Learning resource recommendations
- Progress tracking dashboard

---

### 👨‍🏫 Teacher Features
- Class-wide risk analytics
- Bulk student data upload (CSV)
- Student monitoring dashboard
- Early intervention suggestions
- Report generation

---

## 🛠 Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

### Backend
- Next.js API Routes
- Node.js
- Prisma ORM
- PostgreSQL (Neon DB)
- JWT Authentication
- bcryptjs

### AI / Analytics
- z-ai-web-dev-sdk
- Custom rule-based prediction engine
- Explainable risk scoring system

---

## 🌐 Deployment

- Frontend + Backend: Vercel
- Database: Neon PostgreSQL

---

## 📦 Local Setup

### 1. Clone repository
```bash
git clone https://github.com/sathwik27-ai/Student-Dropout-Risk-Prediction.git
cd Student-Dropout-Risk-Prediction
```
2. Install dependencies
```bash
npm install
```

🔐 Environment Variables

Create a .env file in the root directory:
```bash
DATABASE_URL="your-neon-postgres-url"
JWT_SECRET="your-secret-key"
```

⚠ IMPORTANT:

Never push .env to GitHub
Add it to .gitignore

🗄 Database Setup (Prisma + Neon)
```bash
npx prisma generate
npx prisma db push
```

(Optional seed data)
```bash
npx tsx src/lib/seed.ts
```

▶ Run Project Locally
```bash
npm run dev
```
Open:

http://localhost:3001

🔐 Demo Login Credentials

Teacher :

Email: teacher@university.edu

Password: teacher123

Student :

Email: alice@university.edu

Password: student123

📊 Prediction Factors

GPA

Attendance

Assignments missed

Backlogs

Engagement level

📁 Project Structure
```bash
src/
├── app/
│   ├── api/
│   ├── student/
│   ├── teacher/
│   └── page.tsx
├── components/
├── contexts/
├── hooks/
└── lib/
prisma/
└── schema.prisma
```

⚠ Troubleshooting

Prisma issues

```bash
npx prisma generate
npx prisma db push
```

#Database connection error :

Check .env file

Verify Neon DATABASE_URL

Ensure internet connection

🚀 Future Enhancements

Machine Learning-based prediction model

Email alerts for at-risk students

Mobile app version

LMS integration

Advanced analytics dashboard

AI-powered recommendations upgrade

📌 Project Status

✔ Fully deployed

✔ Production-ready

✔ Database connected (Neon PostgreSQL)

✔ Authentication working

✔ Vercel deployment active

❤️ Built For

Helping educational institutions identify at-risk students early and improve academic success using data-driven insights and AI-powered analytics.


---

