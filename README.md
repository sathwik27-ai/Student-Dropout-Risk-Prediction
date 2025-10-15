# StudentBuilder - AI-Powered Student Success Platform

A comprehensive web application that predicts student dropout risk, generates personalized career roadmaps, and provides actionable insights to improve educational outcomes.

## 🚀 Features

### Core Features
- **Predictive Analytics**: Advanced ML algorithms to identify students at risk of dropping out
- **Role-Based Access**: Separate interfaces for students and teachers with appropriate permissions
- **Batch Processing**: Upload CSV files with up to 1,000 student records for bulk predictions
- **AI-Powered Roadmaps**: Personalized career roadmaps generated using AI (z-ai-web-dev-sdk)
- **Real-time Analytics**: Interactive dashboards with visual charts and progress tracking
- **Secure Authentication**: JWT-based authentication with role management

### Student Features
- Personal risk assessment with detailed explanations
- Topic-wise performance analysis
- Career roadmap generation and tracking
- Recommended learning resources
- Progress monitoring over time

### Teacher Features
- Class-wide risk analytics
- Bulk student data upload
- Individual student monitoring
- Intervention recommendations
- Export capabilities for reports

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** icons
- **Recharts** for data visualization

### Backend
- **Node.js** with Next.js API routes
- **TypeScript** throughout
- **Prisma ORM** with SQLite database
- **JWT** for authentication
- **bcryptjs** for password hashing

### AI & ML
- **z-ai-web-dev-sdk** for AI roadmap generation
- **Custom prediction engine** with explainable factors
- **SHAP-like explanations** for predictions

### DevOps
- **Docker** support (ready for containerization)
- **ESLint** for code quality
- **TypeScript** strict mode

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studentbuilder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Seed the database with sample data**
   ```bash
   npx tsx src/lib/seed.ts
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Default Login Credentials

After seeding the database, you can use these credentials:

### Teacher Account
- **Email**: teacher@university.edu
- **Password**: teacher123

### Student Accounts
- **Email**: alice@university.edu
- **Password**: student123

- **Email**: bob@university.edu
- **Password**: student123

## 📊 Database Schema

The application uses the following main entities:

- **Users**: Authentication and role management
- **Students**: Academic and personal information
- **Predictions**: Risk assessment results
- **Roadmaps**: AI-generated career paths
- **BatchJobs**: Bulk processing jobs
- **Resources**: Learning materials and recommendations

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Predictions
- `POST /api/predictions` - Generate single prediction
- `GET /api/predictions` - Get predictions
- `POST /api/predictions/batch` - Batch predictions
- `GET /api/predictions/batch` - Get batch jobs

### Roadmaps
- `POST /api/roadmaps` - Generate AI roadmap
- `GET /api/roadmaps` - Get user roadmaps

### Students
- `GET /api/students` - Get all students (teachers only)
- `POST /api/students` - Create new student (teachers only)

## 📈 Prediction Model

The prediction engine uses a rule-based approach with the following factors:

### Risk Factors
- **GPA**: Weighted based on performance threshold
- **Attendance**: Critical factor for engagement
- **Assignments Missed**: Indicator of disengagement
- **Prior Backlogs**: Academic history impact
- **Mental Health Score**: Well-being consideration

### Risk Categories
- **LOW**: 0-33% risk
- **MEDIUM**: 34-66% risk
- **HIGH**: 67-100% risk

## 🤖 AI Integration

The platform integrates with z-ai-web-dev-sdk for:

- **Career Roadmap Generation**: Personalized semester-by-semester plans
- **Resource Recommendations**: Tailored learning materials
- **Intervention Suggestions**: Actionable improvement steps

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── student/           # Student-specific pages
│   ├── teacher/           # Teacher-specific pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── lib/                  # Utility libraries
│   ├── auth.ts          # Authentication utilities
│   ├── db.ts            # Database client
│   └── seed.ts          # Database seeding
└── hooks/               # Custom React hooks
```

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations

## 🚀 Deployment

### Environment Variables
Create a `.env` file with the following variables:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### Production Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

### Docker Deployment
```bash
# Build the image
docker build -t studentbuilder .

# Run the container
docker run -p 3000:3000 studentbuilder
```

## 🧪 Testing

The application includes:
- Unit tests for core logic
- Integration tests for API endpoints
- Authentication flow testing
- Database operation testing

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Advanced ML models
- [ ] Integration with LMS systems
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Peer mentoring features

---

**Built with ❤️ for educational institutions**