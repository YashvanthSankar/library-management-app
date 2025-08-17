"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { 
	Search, 
	BookOpen, 
	Clock, 
	AlertCircle,
	Calendar,
	User,
	Book,
	CheckCircle,
	XCircle,
	Filter
} from "lucide-react";

export default function LoansPage() {
	const { data: session } = useSession();
	const [loans, setLoans] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [filteredLoans, setFilteredLoans] = useState([]);

	// Check if user is librarian
	const [userRole, setUserRole] = useState(null);
	useEffect(() => {
		const storedRole = localStorage.getItem('selectedRole');
		setUserRole(storedRole || 'borrower');
	}, []);

	// Fetch loans data
	useEffect(() => {
		if (userRole === 'librarian') {
			fetchAllLoans();
		}
	}, [userRole]);

	// Filter loans based on search and status
	useEffect(() => {
		let filtered = loans;

		// Filter by search term
		if (searchTerm.trim() !== "") {
			filtered = filtered.filter(loan =>
				loan.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				loan.book?.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				loan.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				loan.book?.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Filter by status
		if (statusFilter !== "all") {
			filtered = filtered.filter(loan => loan.status === statusFilter);
		}

		setFilteredLoans(filtered);
	}, [searchTerm, statusFilter, loans]);

	const fetchAllLoans = async () => {
		try {
			setLoading(true);
			
			// Fetch real loans data from API
			const response = await fetch("http://localhost:5000/api/loans");
			if (!response.ok) {
				throw new Error('Failed to fetch loans');
			}
			
			const loansData = await response.json();
			
			// Transform API data to match expected format
			const transformedLoans = loansData.map(loan => {
				// Calculate if loan is overdue
				let status = loan.status;
				if (loan.status === 'active' && new Date(loan.dueAt) < new Date()) {
					status = 'overdue';
				}
				
				return {
					id: loan.id,
					book: {
						id: loan.book?.id || loan.bookId,
						title: loan.book?.title || 'Unknown Title',
						author: loan.book?.author || 'Unknown Author',
						isbn: loan.book?.isbn || 'N/A'
					},
					user: {
						id: loan.user?.id || loan.userId,
						name: loan.user?.name || 'Unknown User',
						email: loan.user?.email || 'unknown@email.com'
					},
					loanDate: loan.loanedAt,
					dueDate: loan.dueAt,
					returnDate: loan.returnedAt,
					status: status
				};
			});

			setLoans(transformedLoans);
			setFilteredLoans(transformedLoans);
		} catch (error) {
			console.error("Error fetching loans:", error);
			// Set empty array on error
			setLoans([]);
			setFilteredLoans([]);
		} finally {
			setLoading(false);
		}
	};

	const handleReturnBook = async (loanId) => {
		try {
			console.log("Returning book for loan:", loanId);
			
			// Make API call to return the book
			const response = await fetch(`http://localhost:5000/api/loans/${loanId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					status: 'returned'
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to return book');
			}

			const updatedLoan = await response.json();
			console.log("Book returned successfully:", updatedLoan);

			// Update local state with the returned loan data
			setLoans(prev => prev.map(loan => 
				loan.id === loanId 
					? { 
						...loan, 
						status: 'returned', 
						returnDate: updatedLoan.returnedAt || new Date().toISOString() 
					}
					: loan
			));

			// Show success message
			alert(`Book "${updatedLoan.book.title}" has been successfully returned!`);
			
		} catch (error) {
			console.error("Error returning book:", error);
			alert(`Failed to return book: ${error.message}`);
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const getStatusBadgeVariant = (status) => {
		switch (status) {
			case 'active': return 'default';
			case 'overdue': return 'destructive';
			case 'returned': return 'secondary';
			default: return 'secondary';
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case 'active': return <Clock className="h-3 w-3" />;
			case 'overdue': return <AlertCircle className="h-3 w-3" />;
			case 'returned': return <CheckCircle className="h-3 w-3" />;
			default: return <Clock className="h-3 w-3" />;
		}
	};

	const isOverdue = (dueDate, status) => {
		return status === 'active' && new Date(dueDate) < new Date();
	};

	const getDaysOverdue = (dueDate) => {
		const today = new Date();
		const due = new Date(dueDate);
		const diffTime = today - due;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	};

	// Redirect if not librarian
	if (userRole !== 'librarian') {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						Access Restricted
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Only librarians can access the loans page.
					</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-2 text-gray-600">Loading loans...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Library Loans
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Manage book loans and returns
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<BookOpen className="h-5 w-5 text-gray-500" />
					<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
						{filteredLoans.length} loans
					</span>
				</div>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex items-center space-x-4">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					<Input
						placeholder="Search by book title, author, or member..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex items-center space-x-2">
					<Filter className="h-4 w-4 text-gray-500" />
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-black text-sm"
					>
						<option value="all">All Status</option>
						<option value="active">Active</option>
						<option value="overdue">Overdue</option>
						<option value="returned">Returned</option>
					</select>
				</div>
			</div>

			{/* Loans Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
					<div className="flex items-center">
						<div className="rounded-md p-2 bg-blue-50 dark:bg-blue-900/20">
							<BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Loans</p>
							<p className="text-xl font-bold text-gray-900 dark:text-white">
								{loans.length}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
					<div className="flex items-center">
						<div className="rounded-md p-2 bg-green-50 dark:bg-green-900/20">
							<Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Loans</p>
							<p className="text-xl font-bold text-gray-900 dark:text-white">
								{loans.filter(l => l.status === 'active').length}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
					<div className="flex items-center">
						<div className="rounded-md p-2 bg-red-50 dark:bg-red-900/20">
							<AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
							<p className="text-xl font-bold text-gray-900 dark:text-white">
								{loans.filter(l => l.status === 'overdue').length}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
					<div className="flex items-center">
						<div className="rounded-md p-2 bg-gray-50 dark:bg-gray-900/20">
							<CheckCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Returned</p>
							<p className="text-xl font-bold text-gray-900 dark:text-white">
								{loans.filter(l => l.status === 'returned').length}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Loans Table */}
			<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Book</TableHead>
							<TableHead>Borrower</TableHead>
							<TableHead>Loan Date</TableHead>
							<TableHead>Due Date</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredLoans.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center py-8">
									<BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
									<p className="text-gray-500 dark:text-gray-400">
										{searchTerm || statusFilter !== "all" 
											? "No loans found matching your criteria." 
											: "No loans found."
										}
									</p>
								</TableCell>
							</TableRow>
						) : (
							filteredLoans.map((loan) => (
								<TableRow key={loan.id}>
									<TableCell>
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
												<Book className="h-4 w-4 text-blue-600 dark:text-blue-400" />
											</div>
											<div>
												<p className="font-medium text-gray-900 dark:text-white">
													{loan.book.title}
												</p>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													by {loan.book.author}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											<div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
												<span className="text-xs font-medium text-gray-600 dark:text-gray-300">
													{loan.user.name?.charAt(0)?.toUpperCase() || 'U'}
												</span>
											</div>
											<div>
												<p className="font-medium text-gray-900 dark:text-white text-sm">
													{loan.user.name}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{loan.user.email}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
											<Calendar className="h-3 w-3 mr-1" />
											{formatDate(loan.loanDate)}
										</div>
									</TableCell>
									<TableCell>
										<div className={`flex items-center text-sm ${
											isOverdue(loan.dueDate, loan.status) 
												? 'text-red-600 dark:text-red-400' 
												: 'text-gray-600 dark:text-gray-400'
										}`}>
											<Calendar className="h-3 w-3 mr-1" />
											{formatDate(loan.dueDate)}
											{isOverdue(loan.dueDate, loan.status) && (
												<span className="ml-2 text-xs">
													({getDaysOverdue(loan.dueDate)} days overdue)
												</span>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-1">
											<Badge variant={getStatusBadgeVariant(loan.status)}>
												{getStatusIcon(loan.status)}
												<span className="ml-1">{loan.status}</span>
											</Badge>
										</div>
									</TableCell>
									<TableCell>
										{loan.status === 'active' || loan.status === 'overdue' ? (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleReturnBook(loan.id)}
												className="flex items-center space-x-1"
											>
												<CheckCircle className="h-3 w-3" />
												<span>Return</span>
											</Button>
										) : (
											<span className="text-sm text-gray-500 dark:text-gray-400">
												Completed
											</span>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
