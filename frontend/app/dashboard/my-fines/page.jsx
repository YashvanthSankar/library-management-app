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
import { 
  DollarSign, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Book,
  Calendar,
  CreditCard
} from "lucide-react";

export default function MyFinesPage() {
  const { data: session } = useSession();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyFines();
    }
  }, [session]);

  const fetchMyFines = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/fines/user/${session.user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setFines(result.data || []);
      } else {
        console.error('Failed to fetch fines:', result);
        setFines([]);
      }
    } catch (error) {
      console.error('Error fetching fines:', error);
      setFines([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId) => {
    // In a real application, this would integrate with a payment gateway
    const confirmPayment = confirm("Proceed to payment gateway to pay this fine?");
    
    if (confirmPayment) {
      try {
        const response = await fetch(`http://localhost:5000/api/fines/${fineId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'PAID' }),
        });

        const result = await response.json();

        if (result.success) {
          alert('Fine paid successfully!');
          fetchMyFines(); // Refresh the list
        } else {
          alert(`Failed to process payment: ${result.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Failed to process payment. Please try again.');
      }
    }
  };

  const totalUnpaidAmount = fines
    .filter(fine => fine.status === 'unpaid')
    .reduce((sum, fine) => sum + fine.amount, 0);

  const totalPaidAmount = fines
    .filter(fine => fine.status === 'paid')
    .reduce((sum, fine) => sum + fine.amount, 0);

  const unpaidFines = fines.filter(fine => fine.status === 'unpaid');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading your fines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Fines</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and pay your outstanding library fines
          </p>
        </div>
        <Button onClick={fetchMyFines} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalUnpaidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {unpaidFines.length} unpaid fine{unpaidFines.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalPaidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Payment history
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fines.length}</div>
            <p className="text-xs text-muted-foreground">
              All time fines
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Fines Alert */}
      {unpaidFines.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Outstanding Fines - Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300 mb-4">
              You have {unpaidFines.length} unpaid fine{unpaidFines.length !== 1 ? 's' : ''} totaling <strong>₹{totalUnpaidAmount.toFixed(2)}</strong>. 
              Please pay your fines to avoid restrictions on borrowing new books.
            </p>
            <Button 
              onClick={() => {
                // Scroll to unpaid fines section
                document.getElementById('unpaid-fines')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Fines Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Outstanding Fines Table */}
      {unpaidFines.length > 0 && (
        <Card id="unpaid-fines">
          <CardHeader>
            <CardTitle className="text-red-600">
              Outstanding Fines ({unpaidFines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidFines.map((fine) => (
                  <TableRow key={fine.id} className="border-red-100 dark:border-red-900">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Book className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{fine.loan?.book?.title || 'Unknown Book'}</p>
                          <p className="text-sm text-gray-500">{fine.loan?.book?.author}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-lg text-red-600">₹{fine.amount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{fine.reason}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(fine.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handlePayFine(fine.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Fines History */}
      <Card>
        <CardHeader>
          <CardTitle>
            Fine History ({fines.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fines.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No fines found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Great! You don't have any fines on your account.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fines.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Book className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{fine.loan?.book?.title || 'Unknown Book'}</p>
                          <p className="text-sm text-gray-500">{fine.loan?.book?.author}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-lg">₹{fine.amount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{fine.reason}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={fine.status === 'paid' ? 'default' : 'destructive'}>
                        {fine.status === 'paid' ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(fine.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
