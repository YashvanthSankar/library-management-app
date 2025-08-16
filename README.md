# Library Management App

> Author: Yashvanth S

## Tech Stack

**Frontend:** Next.js, shadcn/ui, Tailwind CSS, NextAuth.js  
**Backend:** Node.js, Express.js, Prisma ORM  
**Database:** PostgreSQL (Neon)  
**Deployment:** Vercel

## API Endpoints

/api/books/
├── GET / (Everyone - view books)
├── POST / (Librarian only - add book)
├── PUT /:id (Librarian only - edit book)
└── DELETE /:id (Librarian only - delete book)

/api/loans/
├── GET /my-loans (Borrower - own loans only)
├── GET /all (Librarian - all loans)
├── POST / (Borrower - create loan)
└── PUT /:id/return (Both - return book)

/api/users/
├── GET /me (Everyone - own profile)
├── GET /all (Librarian only - all users)
└── PUT /:id/suspend (Librarian only - suspend user)
