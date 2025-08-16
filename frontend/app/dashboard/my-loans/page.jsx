"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, AlertCircle, RefreshCw } from "lucide-react";

export default function MyLoansPage() {
  const { data: session } = useSession();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyLoans();
    }
  }, [session]);

  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/loans/user/${session.user.id}`);
      const result = await response.json();
      
      if (response.ok) {
        setLoans(result || []);
      } else {
        console.error('Failed to fetch loans:', result);
        setLoans([]);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewLoan = async (loanId) => {
    try {
      // Add 14 days to current due date
      const loan = loans.find(l => l.id === loanId);
      const newDueDate = new Date(loan.dueAt);
      newDueDate.setDate(newDueDate.getDate() + 14);

      const response = await fetch(`http://localhost:5000/api/loans/${loanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dueAt: newDueDate.toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Book renewed successfully! New due date: ${new Date(result.dueAt).toLocaleDateString()}`);
        fetchMyLoans(); // Refresh the loans list
      } else {
        alert(`Failed to renew book: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error renewing loan:', error);
      alert('Failed to renew book. Please try again.');
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getLoanStatus = (loan) => {
    const daysLeft = getDaysUntilDue(loan.dueAt);
    
    if (loan.status === 'returned') return { text: 'Returned', variant: 'secondary' };
    if (daysLeft < 0) return { text: 'Overdue', variant: 'destructive' };
    if (daysLeft <= 3) return { text: 'Due Soon', variant: 'destructive' };
    return { text: 'Active', variant: 'default' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading your loans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Loans</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your borrowed books and renewals
          </p>
        </div>
        <Button onClick={fetchMyLoans} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loans.filter(loan => loan.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loans.filter(loan => {
                const daysLeft = getDaysUntilDue(loan.dueAt);
                return loan.status === 'active' && daysLeft <= 3 && daysLeft >= 0;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loans.filter(loan => {
                const daysLeft = getDaysUntilDue(loan.dueAt);
                return loan.status === 'active' && daysLeft < 0;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Your Borrowed Books ({loans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No loans found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You haven't borrowed any books yet.
              </p>
              <div className="mt-6">
                <Button>
                  <BookOpen className="h-4 w-4 mr-2" />
                  <a href="/dashboard/books">Browse Books</a>
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Borrowed Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => {
                  const status = getLoanStatus(loan);
                  const daysLeft = getDaysUntilDue(loan.dueAt);
                  
                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">
                        {loan.book?.title || 'Unknown Book'}
                      </TableCell>
                      <TableCell>
                        {loan.book?.author || 'Unknown Author'}
                      </TableCell>
                      <TableCell>
                        {new Date(loan.loanedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(loan.dueAt).toLocaleDateString()}</span>
                          {loan.status === 'active' && (
                            <span className={`text-xs ${
                              daysLeft < 0 ? 'text-red-500' : 
                              daysLeft <= 3 ? 'text-yellow-500' : 'text-gray-500'
                            }`}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : 
                               daysLeft === 0 ? 'Due today' :
                               `${daysLeft} days left`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {loan.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRenewLoan(loan.id)}
                          >
                            Renew
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
