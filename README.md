# 🏋️ ScaleFit - Digital Fitness Coaching Platform

> **Personalization at Scale** - A high-scale, 100% digital fitness coaching platform that bridges the gap between generic fitness apps and expensive 1-on-1 personal training.

![ScaleFit Dashboard](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop)

## 🎯 Overview

ScaleFit is a comprehensive coaching ecosystem featuring:

- **Coach Dashboard** (Web) - Manage athletes, create plans, review check-ins
- **Athlete App** (Mobile-ready) - Track workouts, nutrition, submit check-ins
- **Real-time Chat** - WebSocket-powered messaging
- **Smart Coach AI** - Automated alerts for inactivity, weight stagnation, etc.

## 🏗️ Architecture

```
scalefit/
├── apps/
│   ├── backend/          # NestJS + Prisma + PostgreSQL
│   │   ├── prisma/       # Database schema
│   │   └── src/
│   │       ├── modules/  # Feature modules
│   │       │   ├── auth/
│   │       │   ├── users/
│   │       │   ├── workouts/
│   │       │   ├── nutrition/
│   │       │   ├── check-ins/
│   │       │   ├── alerts/
│   │       │   ├── chat/
│   │       │   ├── templates/
│   │       │   └── calculator/
│   │       └── prisma/   # Database service
│   │
│   └── web/              # Next.js 14 Coach Dashboard
│       └── src/
│           ├── app/      # App router pages
│           ├── components/
│           └── lib/      # Utilities, API, stores
│
└── packages/             # Shared packages (future)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
cd "coach app"
npm install
```

### 2. Configure Environment

Create `apps/backend/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/scalefit?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=4000
FRONTEND_URL="http://localhost:3000"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Setup Database

```bash
cd apps/backend
npx prisma generate
npx prisma db push
```

### 4. Start Development

```bash
# From root directory
npm run dev

# Or separately:
npm run dev:backend   # Backend on http://localhost:4000
npm run dev:web       # Frontend on http://localhost:3000
```

## 📊 Database Schema

### Core Models

| Table | Description |
|-------|-------------|
| `User` | Athletes, Coaches, Admins with profiles |
| `Exercise` | Exercise library with video URLs |
| `SwapGroup` | Groups of interchangeable exercises |
| `WorkoutPlan` | Coach-created workout programs |
| `NutritionPlan` | Macro-based meal plans |
| `CheckIn` | Bi-weekly athlete check-ins |
| `Alert` | Smart Coach automated alerts |
| `Message` | Real-time chat messages |
| `Template` | Reusable workout/nutrition templates |

### Key Features

- **Exercise Swaps**: Athletes can swap exercises within the same muscle group
- **Food Equivalency**: Calculate equivalent portions when swapping foods
- **Check-in Gating**: Athletes must complete check-ins to access new training blocks
- **Smart Alerts**: Automatic detection of inactivity, weight stagnation, etc.

## 🧮 Core Algorithms

### TDEE Calculation (Mifflin-St Jeor)

```typescript
// Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
// Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
// TDEE = BMR × Activity Factor (1.2 - 1.9)
```

### Food Equivalency Calculator

```typescript
// New Weight = (Original Carbs / Target Food Carbs per gram)
// Example: 100g Rice (28g carbs) → 140g Sweet Potato (20g carbs/100g)
```

### Smart Coach Alerts

- **Inactivity**: Triggered if `last_log_date > 3 days`
- **Weight Stagnation**: If `goal == "Loss"` and `weight_change < 0.2kg over 14 days`
- **Missed Check-in**: If no check-in submitted in 14 days
- **Plan Ending**: Workout plan ends within 7 days

## 🎨 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Primary database
- **Socket.io** - Real-time communication
- **Stripe** - Payment processing
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **SWR** - Data fetching
- **Chart.js** - Data visualization

## 📱 API Endpoints

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Users
```
GET  /api/v1/users/profile
PUT  /api/v1/users/profile
GET  /api/v1/users/athletes
GET  /api/v1/users/athletes/:id/stats
```

### Workouts
```
POST /api/v1/workouts/plans
GET  /api/v1/workouts/plans
POST /api/v1/workouts/plans/:id/assign-bulk  # Mass customization
GET  /api/v1/workouts/exercises/:id/swaps
POST /api/v1/workouts/log
```

### Nutrition
```
POST /api/v1/nutrition/plans
POST /api/v1/nutrition/swap           # Food equivalency
POST /api/v1/nutrition/grocery-list/generate
```

### Check-ins
```
POST /api/v1/check-ins
GET  /api/v1/check-ins/kanban         # Coach Kanban board
PUT  /api/v1/check-ins/:id/review
```

### Alerts
```
GET  /api/v1/alerts
GET  /api/v1/alerts/run-checks        # Trigger smart checks
```

### Calculator
```
POST /api/v1/calculator/tdee
POST /api/v1/calculator/macros
POST /api/v1/calculator/food-swap
```

## 🎯 Key Features

### For Coaches

1. **Mass Customization**
   - Apply template plans to 50+ athletes at once
   - Individual tweaks per athlete

2. **Kanban Check-in Board**
   - Visual management of pending/flagged/reviewed check-ins
   - Drag-and-drop workflow

3. **Template Library**
   - Global library for workouts, meals, supplements
   - Duplicate and customize templates

4. **Smart Alerts Dashboard**
   - Real-time notifications for at-risk athletes
   - Priority-based alert severity

### For Athletes

1. **Dynamic Workout Player**
   - Video demonstrations
   - Last-session memory (shows previous weights/reps)
   - Auto rest timer

2. **Flexible Dieting**
   - Macro-based tracking
   - Food swap equivalency calculator
   - Automated grocery lists

3. **Check-in System**
   - Bi-weekly photo + metrics submission
   - Progress tracking with visual graphs

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start all services
npm run dev

# Backend only
npm run dev:backend

# Frontend only
npm run dev:web

# Database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:studio      # Open Prisma Studio
```

## 📄 License

MIT License - feel free to use this for your own coaching business!

---

Built with ❤️ for fitness coaches who want to scale their impact.

