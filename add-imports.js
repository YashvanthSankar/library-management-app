// Files that need API_URL import
const files = [
  "frontend/app/dashboard/members/page.jsx",
  "frontend/app/dashboard/fines/page.jsx",
  "frontend/app/dashboard/my-fines/page.jsx",
  "frontend/app/dashboard/my-loans/page.jsx",
  "frontend/app/books/page.jsx",
];

console.log("Add this import to these files:");
console.log('import { API_URL } from "@/lib/utils";');
console.log("\nFiles:");
files.forEach((file) => console.log("- " + file));
