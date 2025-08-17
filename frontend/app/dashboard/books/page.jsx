"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Book, Users } from "lucide-react";
import { API_URL } from "@/lib/utils";

export default function BooksPage() {
  const { data: session } = useSession();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get user role from localStorage (as per your auth system)
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const storedRole = localStorage.getItem('selectedRole');
    setUserRole(storedRole || 'borrower');
  }, []);

  const isLibrarian = userRole === 'librarian';

  // Fetch books from API
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('${API_URL}/api/books');
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setBooks(data);
      } else if (data && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        console.error('API response is not an array:', data);
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]); // Ensure books is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books based on search term - ensure books is always an array
  const filteredBooks = React.useMemo(() => {
    if (!Array.isArray(books)) {
      console.warn('Books is not an array:', books);
      return [];
    }
    return books.filter(book =>
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [books, searchTerm]);

  // Add new book (Librarian only)
  const handleAddBook = async (bookData) => {
    try {
      const response = await fetch('${API_URL}/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (response.ok) {
        fetchBooks(); // Refresh the list
        setIsAddDialogOpen(false);
      } else {
        const error = await response.json();
        alert('Error adding book: ' + error.error);
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Error adding book');
    }
  };

  // Update book (Librarian only)
  const handleUpdateBook = async (bookData) => {
    try {
      const response = await fetch(`${API_URL}/api/books/${selectedBook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (response.ok) {
        fetchBooks(); // Refresh the list
        setIsEditDialogOpen(false);
        setSelectedBook(null);
      } else {
        const error = await response.json();
        alert('Error updating book: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Error updating book');
    }
  };

  // Delete book (Librarian only)
  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`${API_URL}/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBooks(); // Refresh the list
      } else {
        const error = await response.json();
        alert('Error deleting book: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book');
    }
  };

  // Borrow book (Borrower)
  const handleBorrowBook = async (bookId) => {
    try {
      if (!session?.user?.id) {
        alert('Please log in to borrow books');
        return;
      }

      // Debug: Log session info
      console.log('Full session:', session);
      console.log('Session user ID:', session.user.id);
      console.log('Session user email:', session.user.email);
      console.log('Book ID:', bookId);

      // Show loading state
      const bookTitle = books.find(book => book.id === bookId)?.title || 'this book';
      
      const requestBody = {
        bookId: bookId,
        userId: session.user.id,
      };

      console.log('Request body:', requestBody);
      
      const response = await fetch('${API_URL}/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Response body:', result);

      if (result.success) {
        alert(`Successfully borrowed "${result.loan.book.title}"! \nDue date: ${new Date(result.loan.dueAt).toLocaleDateString()}\n\nYou can view your loans in the "My Loans" section.`);
        // Refresh the books list to update availability
        await fetchBooks();
      } else {
        alert(`Failed to borrow ${bookTitle}: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert(`Failed to borrow book: ${error.message || 'Please check your internet connection and try again.'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Library Books</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLibrarian ? 'Manage your library collection' : 'Browse available books'}
          </p>
        </div>
        
        {isLibrarian && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
                <DialogDescription>
                  Add a new book to the library collection
                </DialogDescription>
              </DialogHeader>
              <BookForm onSubmit={handleAddBook} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search books by title, author, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{books.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Book className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {books.filter(book => book.availableCopies > 0).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Copies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {books.reduce((sum, book) => sum + book.totalCopies, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Book className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(books.map(book => book.category).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Books ({filteredBooks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    {book.category && (
                      <Badge variant="secondary">{book.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {book.isbn || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={book.availableCopies > 0 ? "default" : "destructive"}
                      >
                        {book.availableCopies}/{book.totalCopies}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {!isLibrarian && book.availableCopies > 0 && (
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleBorrowBook(book.id);
                          }}
                        >
                          Borrow
                        </Button>
                      )}
                      
                      {isLibrarian && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBook(book);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteBook(book.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {isLibrarian && selectedBook && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Book</DialogTitle>
              <DialogDescription>
                Update book information
              </DialogDescription>
            </DialogHeader>
            <BookForm 
              book={selectedBook} 
              onSubmit={handleUpdateBook} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Book Form Component
function BookForm({ book, onSubmit }) {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    category: book?.category || '',
    totalCopies: book?.totalCopies || 1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Author *</label>
        <Input
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">ISBN</label>
        <Input
          value={formData.isbn}
          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Category</label>
        <Input
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g., Fiction, Science, History"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Total Copies *</label>
        <Input
          type="number"
          min="1"
          value={formData.totalCopies}
          onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) })}
          required
        />
      </div>
      
      <Button type="submit" className="w-full">
        {book ? 'Update Book' : 'Add Book'}
      </Button>
    </form>
  );
}
