// User roles
export const USER_ROLES = {
  LIBRARIAN: "librarian",
  BORROWER: "borrower",
};

// Loan statuses
export const LOAN_STATUS = {
  ACTIVE: "active",
  RETURNED: "returned",
  OVERDUE: "overdue",
};

// Fine statuses
export const FINE_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
};

// Default loan duration (in days)
export const DEFAULT_LOAN_DURATION = 14;

// Maximum books a user can borrow
export const MAX_BOOKS_PER_USER = 5;

// Fine amount per day (in rupees)
export const FINE_PER_DAY = 20;

// Common book categories
export const BOOK_CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Biography",
  "Romance",
  "Mystery",
  "Fantasy",
  "Educational",
  "Reference",
];

// API response messages
export const MESSAGES = {
  SUCCESS: {
    BOOK_CREATED: "Book created successfully",
    BOOK_UPDATED: "Book updated successfully",
    BOOK_DELETED: "Book deleted successfully",
    LOAN_CREATED: "Book borrowed successfully",
    LOAN_RETURNED: "Book returned successfully",
    FINE_PAID: "Fine paid successfully",
  },
  ERROR: {
    BOOK_NOT_FOUND: "Book not found",
    BOOK_NOT_AVAILABLE: "Book is not available for borrowing",
    USER_NOT_FOUND: "User not found",
    LOAN_NOT_FOUND: "Loan record not found",
    FINE_NOT_FOUND: "Fine record not found",
    MAX_BOOKS_EXCEEDED: `Cannot borrow more than ${MAX_BOOKS_PER_USER} books`,
    UNAUTHORIZED: "You are not authorized to perform this action",
    VALIDATION_ERROR: "Invalid input data",
  },
};
