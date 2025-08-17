"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DollarSign, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  User,
  Book,
  Calendar,
  TrendingUp
} from "lucide-react";
import { API_URL } from "@/lib/utils";

export default function FinesPage() {
  const { data: session } = useSession();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get user role from localStorage
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const storedRole = localStorage.getItem('selectedRole');
    setUserRole(storedRole || 'borrower');
  }, []);

  const isLibrarian = userRole === 'librarian';

  useEffect(() => {
    fetchFines();
  }, [statusFilter]);

  const fetchFines = async () => {
    try {
      setLoading(true);
      
      const url = isLibrarian 
        ? `${API_URL}/api/fines${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`
        : `${API_URL}/api/fines/user/${session?.user?.id}`;
      
      const response = await fetch(url);
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

  const handleMarkAsPaid = async (fineId) => {
    try {
      const response = await fetch(`${API_URL}/api/fines/${fineId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'paid' }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Fine marked as paid successfully!');
        fetchFines(); // Refresh the list
      } else {
        alert(`Failed to mark fine as paid: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating fine status:', error);
      alert('Failed to update fine status. Please try again.');
    }
  };

  const handleAutoGenerateFines = async () => {
    if (!isLibrarian) return;

    try {
      const response = await fetch(`${API_URL}/api/fines/auto-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        alert(`Successfully generated ${result.data.length} fines for overdue books!`);
        fetchFines(); // Refresh the list
      } else {
        alert(`Failed to auto-generate fines: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error auto-generating fines:', error);
      alert('Failed to auto-generate fines. Please try again.');
    }
  };

  const filteredFines = fines.filter(fine => {
    const matchesSearch = 
      fine.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.loan?.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalUnpaidAmount = fines
    .filter(fine => fine.status === 'unpaid')
    .reduce((sum, fine) => sum + fine.amount, 0);

  const totalPaidAmount = fines
    .filter(fine => fine.status === 'paid')
    .reduce((sum, fine) => sum + fine.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading fines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {isLibrarian ? 'Library Fines' : 'My Fines'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLibrarian ? 'Manage library fines and overdue charges' : 'View and pay your outstanding fines'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchFines} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {isLibrarian && (
            <Button onClick={handleAutoGenerateFines}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Auto-Generate Fines
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fines.length}</div>
            <p className="text-xs text-muted-foreground">
              All fines in system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalUnpaidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Outstanding balance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPaidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by user name, book title, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {isLibrarian && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fines</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Fines Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Fines ({filteredFines.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFines.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No fines found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No fines have been recorded yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {isLibrarian && <TableHead>User</TableHead>}
                  <TableHead>Book</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFines.map((fine) => (
                  <TableRow key={fine.id}>
                    {isLibrarian && (
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{fine.user?.name || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">{fine.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                    )}
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
                      <div className="max-w-48">
                        <p className="text-sm">{fine.reason}</p>
                      </div>
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
                    <TableCell>
                      {fine.status === 'unpaid' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsPaid(fine.id)}
                        >
                          Mark as Paid
                        </Button>
                      )}
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
