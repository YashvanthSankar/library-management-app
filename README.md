# Library Management System 📚

> **Author:** Yashvanth S  

## 🛠 Tech Stack

### Frontend

**Next.js**, **shadcn/ui**, **Tailwind CSS**, **NextAuth.js**

### Backend

**Node.js**, **Express.js**, **Prisma ORM**, **PostgreSQL**

## 🚀 What Works

### Authentication & Authorization

- **OAuth Login** (Google/GitHub) via NextAuth.js
- **Role-based access** (Borrower/Librarian)
- **Auto user creation** on first login

### Book Management

- **CRUD operations** for books (title, author, ISBN, category)
- **Inventory tracking** (total/available copies)
- **Search & filter** by title, author, category

### Loan System

- **Borrow books** with 14-day default duration
- **Return books** with inventory auto-update
- **Loan history** and status tracking
- **Overdue detection** and fine calculation

### Fine Management

- **Auto-generated fines** (₹20/day for overdue)
- **Payment tracking** (paid/unpaid status)
- **Outstanding fine restrictions**

### Dashboards

- **Borrower Dashboard:** My loans, browse books, pay fines
- **Librarian Dashboard:** Manage all loans, books, users, system stats


## 📊 Key Features

✅ **Real-time inventory** - Available copies update on borrow/return  
✅ **Transaction safety** - Database transactions ensure data consistency  
✅ **Automatic fines** - Background job calculates overdue penalties  
✅ **Role permissions** - Borrowers can't access librarian functions  
✅ **Responsive design** - Works on mobile and desktop

## 🚦 Setup

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

**Environment:** Copy `.env.example` → `.env` and add your database/auth credentials.

---

_Complete library management solution with modern UI and robust backend._
