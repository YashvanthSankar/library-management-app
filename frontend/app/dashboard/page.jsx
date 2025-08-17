"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, AlertCircle, Plus, TrendingUp } from "lucide-react";
import { API_URL } from "@/lib/utils";

// Re‑usable stat card with icon
function Stat({ label, value, note, icon: Icon, color = "blue" }) {
	const colorClasses = {
		blue: "text-blue-600 dark:text-blue-400",
		green: "text-green-600 dark:text-green-400",
		orange: "text-orange-600 dark:text-orange-400",
		red: "text-red-600 dark:text-red-400",
	};

	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-black shadow-sm">
			<div className="flex items-center">
				<div className={`rounded-md p-2 ${colorClasses[color]} bg-gray-50 dark:bg-gray-900`}>
					<Icon className="h-6 w-6" />
				</div>
				<div className="ml-4">
					<p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
					{note && <p className="text-xs text-gray-500 dark:text-gray-400">{note}</p>}
				</div>
			</div>
		</div>
	);
}

// Quick actions component
function QuickActions({ isLibrarian }) {
	const librarianActions = [
		{ label: "Add New Book", href: "/dashboard/books?action=add", icon: Plus },
		{ label: "View Members", href: "/dashboard/members", icon: Users },
		{ label: "Manage Loans", href: "/dashboard/loans", icon: BookOpen },
	];

	const borrowerActions = [
		{ label: "Browse Books", href: "/dashboard/books", icon: BookOpen },
		{ label: "My Loans", href: "/dashboard/my-loans", icon: Clock },
		{ label: "My Fines", href: "/dashboard/my-fines", icon: Users },
	];

	const actions = isLibrarian ? librarianActions : borrowerActions;

	return (
		<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
			<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				{actions.map((action, idx) => {
					const Icon = action.icon;
					return (
						<Link key={idx} href={action.href}>
							<Button variant="outline" className="w-full justify-start h-auto p-4">
								<Icon className="h-4 w-4 mr-2" />
								{action.label}
							</Button>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

// Recent activity component
function RecentActivity({ activities }) {
	return (
		<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
			<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
			{activities.length === 0 ? (
				<p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
			) : (
				<div className="space-y-3">
					{activities.slice(0, 5).map((activity, idx) => (
						<div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
							<div className="flex items-center space-x-3">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								<div>
									<p className="text-sm font-medium text-gray-900 dark:text-white">
										{activity.action}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{activity.details}
									</p>
								</div>
							</div>
							<span className="text-xs text-gray-500 dark:text-gray-400">
								{activity.time}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// Librarian dashboard view
function LibrarianView() {
	const [stats, setStats] = useState({
		totalBooks: 0,
		totalUsers: 0,
		activeLoans: 0,
		overdueLoans: 0,
	});
	const [recentActivity, setRecentActivity] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			
			// Fetch all data in parallel
			const [booksResponse, usersResponse] = await Promise.all([
				fetch(`${API_URL}/api/books`),
				fetch(`${API_URL}/api/users`)
			]);

			// Process books data
			const booksData = await booksResponse.json();
			const totalBooks = booksData.success ? booksData.books?.length || 0 : 0;

			// Process users data
			const usersData = await usersResponse.json();
			const totalUsers = usersData.success ? usersData.data?.length || 0 : 0;

			// Fetch real loans data
			const loansResponse = await fetch(`${API_URL}/api/loans`);
			const loansData = await loansResponse.json();
			const allLoans = Array.isArray(loansData) ? loansData : [];

			// Calculate real stats from loans
			const activeLoans = allLoans.filter(loan => loan.status === 'active').length;
			const overdueLoans = allLoans.filter(loan => {
				if (loan.status !== 'active') return false;
				const dueDate = new Date(loan.dueAt);
				const today = new Date();
				return dueDate < today;
			}).length;

			setStats({
				totalBooks,
				totalUsers,
				activeLoans,
				overdueLoans,
			});

			// Generate recent activity from real data
			const activities = [];
			
			// Add recent book additions
			if (booksData.success && booksData.books?.length > 0) {
				const recentBooks = booksData.books
					.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
					.slice(0, 2);
				recentBooks.forEach((book, idx) => {
					activities.push({
						action: "New book added",
						details: `${book.title} by ${book.author}`,
						time: `${idx + 1} ${idx === 0 ? 'day' : 'days'} ago`
					});
				});
			}

			// Add recent member registrations
			if (usersData.success && usersData.data?.length > 0) {
				const recentUsers = usersData.data
					.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
					.slice(0, 2);
				recentUsers.forEach((user, idx) => {
					activities.push({
						action: "New member registered",
						details: `${user.name} (${user.role})`,
						time: `${idx + 3} days ago`
					});
				});
			}

			// Add recent loan activities from real data
			const recentLoans = allLoans
				.sort((a, b) => new Date(b.loanedAt) - new Date(a.loanedAt))
				.slice(0, 3);

			recentLoans.forEach((loan, idx) => {
				const loanDate = new Date(loan.loanedAt);
				const now = new Date();
				const hoursDiff = Math.floor((now - loanDate) / (1000 * 60 * 60));
				
				let timeText;
				if (hoursDiff < 1) timeText = "Just now";
				else if (hoursDiff < 24) timeText = `${hoursDiff} hours ago`;
				else timeText = `${Math.floor(hoursDiff / 24)} days ago`;

				const action = loan.status === 'returned' ? 'Book returned' : 'Book borrowed';
				const userName = loan.user?.name || 'Unknown User';
				const bookTitle = loan.book?.title || 'Unknown Book';

				activities.push({
					action,
					details: `${bookTitle} by ${userName}`,
					time: timeText
				});
			});

			setRecentActivity(activities);
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
			// Set default values on error
			setStats({
				totalBooks: 0,
				totalUsers: 0,
				activeLoans: 0,
				overdueLoans: 0,
			});
			setRecentActivity([]);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-2 text-gray-600">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Stat 
					label="Total Books" 
					value={stats.totalBooks} 
					icon={BookOpen} 
					color="blue"
					note="In catalog"
				/>
				<Stat 
					label="Total Users" 
					value={stats.totalUsers} 
					icon={Users} 
					color="green"
					note="Registered"
				/>
				<Stat 
					label="Active Loans" 
					value={stats.activeLoans} 
					icon={Clock} 
					color="orange"
					note="Currently borrowed"
				/>
				<Stat 
					label="Overdue" 
					value={stats.overdueLoans} 
					icon={AlertCircle} 
					color="red"
					note="Need attention"
				/>
			</div>

			{/* Quick Actions */}
			<QuickActions isLibrarian={true} />

			{/* Recent Activity */}
			<RecentActivity activities={recentActivity} />
		</div>
	);
}

// Borrower dashboard view
function BorrowerView() {
	const { data: session } = useSession();
	const [currentLoans, setCurrentLoans] = useState([]);
	const [recentActivity, setRecentActivity] = useState([]);
	const [stats, setStats] = useState({
		currentLoans: 0,
		dueSoon: 0,
		readingGoal: "0/12"
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (session?.user) {
			fetchUserData();
		}
	}, [session]);

	const fetchUserData = async () => {
		try {
			setLoading(true);
			
			const userId = session?.user?.id;
			if (!userId) return;

			// Fetch real user loans from API
			const loansResponse = await fetch(`${API_URL}/api/loans/user/${userId}`);
			const userLoans = await loansResponse.json();

			// Calculate stats from real data
			const activeLoans = userLoans.filter(loan => loan.status === 'active');
			const dueSoon = activeLoans.filter(loan => {
				const dueDate = new Date(loan.dueAt);
				const today = new Date();
				const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
				return daysLeft <= 3 && daysLeft >= 0;
			});

			// Get completed loans count
			const completedLoans = userLoans.filter(loan => loan.status === 'returned');

			setCurrentLoans(activeLoans);
			setStats({
				currentLoans: activeLoans.length,
				dueSoon: dueSoon.length,
				readingGoal: `${completedLoans.length}/12`
			});

			// Generate recent activity from real loans data
			const activities = [];
			
			// Add recent loans as activities
			const recentLoans = userLoans
				.sort((a, b) => new Date(b.loanedAt) - new Date(a.loanedAt))
				.slice(0, 3);

			recentLoans.forEach(loan => {
				const loanDate = new Date(loan.loanedAt);
				const now = new Date();
				const daysDiff = Math.floor((now - loanDate) / (1000 * 60 * 60 * 24));
				
				let timeText;
				if (daysDiff === 0) timeText = "Today";
				else if (daysDiff === 1) timeText = "Yesterday";
				else if (daysDiff < 7) timeText = `${daysDiff} days ago`;
				else if (daysDiff < 30) timeText = `${Math.floor(daysDiff / 7)} weeks ago`;
				else timeText = `${Math.floor(daysDiff / 30)} months ago`;

				if (loan.status === 'returned') {
					activities.push({
						action: "Book returned",
						details: loan.book?.title || "Unknown Book",
						time: timeText
					});
				} else {
					activities.push({
						action: "Book borrowed",
						details: loan.book?.title || "Unknown Book",
						time: timeText
					});
				}
			});

			// Add welcome message if no other activities
			if (activities.length === 0) {
				activities.push({
					action: "Account active",
					details: `Welcome ${session?.user?.name}!`,
					time: "Now"
				});
			}

			setRecentActivity(activities);
		} catch (error) {
			console.error("Error fetching user data:", error);
			// Set default values on error
			setCurrentLoans([]);
			setStats({
				currentLoans: 0,
				dueSoon: 0,
				readingGoal: "0/12"
			});
			setRecentActivity([]);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-2 text-gray-600">Loading your data...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Stat 
					label="Current Loans" 
					value={currentLoans.length} 
					icon={BookOpen} 
					color="blue"
					note="Books borrowed"
				/>
				<Stat 
					label="Due Soon" 
					value={currentLoans.filter(loan => loan.status === 'due-soon').length} 
					icon={Clock} 
					color="orange"
					note="In next 5 days"
				/>
				<Stat 
					label="Reading Goal" 
					value={stats.readingGoal} 
					icon={TrendingUp} 
					color="green"
					note="Books this year"
				/>
			</div>

			{/* Current Loans */}
			<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Loans</h3>
					<Link href="/dashboard/my-loans">
						<Button variant="outline" size="sm">View All</Button>
					</Link>
				</div>
				{currentLoans.length === 0 ? (
					<p className="text-sm text-gray-500 dark:text-gray-400">No current loans</p>
				) : (
					<div className="space-y-3">
						{currentLoans.map((loan) => (
							<div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-md">
								<div className="flex-1">
									<h4 className="font-medium text-gray-900 dark:text-white">{loan.title}</h4>
									<p className="text-sm text-gray-600 dark:text-gray-400">by {loan.author}</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">Due: {loan.dueDate}</p>
								</div>
								<div className="flex items-center space-x-3">
									<Badge variant={loan.status === 'due-soon' ? 'destructive' : 'secondary'}>
										{loan.daysLeft} days left
									</Badge>
									<Button variant="outline" size="sm">Renew</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Quick Actions */}
			<QuickActions isLibrarian={false} />

			{/* Recent Activity */}
			<RecentActivity activities={recentActivity} />
		</div>
	);
}

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const [userRole, setUserRole] = useState(null);

	useEffect(() => {
		const storedRole = localStorage.getItem('selectedRole');
		setUserRole(storedRole || 'borrower');
	}, []);

	const isLibrarian = userRole === 'librarian';

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-2 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Page Title */}
			<div>
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Dashboard
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					{isLibrarian ? 'Manage your library system' : 'Track your books and loans'}
				</p>
			</div>

			{/* Content based on role */}
			{isLibrarian ? <LibrarianView /> : <BorrowerView />}
		</div>
	);
}
