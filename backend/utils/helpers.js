/**
 * Calculate due date for a loan
 * @param {Date} startDate - The loan start date
 * @param {number} days - Number of days to add (default: 14)
 * @returns {Date} The due date
 */
export const calculateDueDate = (startDate = new Date(), days = 14) => {
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
};

/**
 * Check if a loan is overdue
 * @param {Date} dueDate - The due date
 * @returns {boolean} True if overdue
 */
export const isOverdue = (dueDate) => {
  return new Date() > new Date(dueDate);
};

/**
 * Calculate fine amount for overdue books
 * @param {Date} dueDate - The due date
 * @param {Date} returnDate - The return date (default: today)
 * @param {number} finePerDay - Fine amount per day
 * @returns {number} Fine amount
 */
export const calculateFine = (
  dueDate,
  returnDate = new Date(),
  finePerDay = 20
) => {
  if (!isOverdue(dueDate)) return 0;

  const overdueDays = Math.ceil(
    (returnDate - new Date(dueDate)) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, overdueDays * finePerDay);
};

/**
 * Get days until due date
 * @param {Date} dueDate - The due date
 * @returns {number} Days until due (negative if overdue)
 */
export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format date for display
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Generate a simple pagination object
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination object
 */
export const getPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
};
