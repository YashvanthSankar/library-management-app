"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Book, BookOpen, Users, FileText, Menu, X } from "lucide-react";

export default function DashboardLayout({ children }) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const pathname = usePathname();
	const [userRole, setUserRole] = useState(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Get user role from localStorage
	useEffect(() => {
		const storedRole = localStorage.getItem('selectedRole');
		setUserRole(storedRole || 'borrower');
	}, []);

	// Handle session redirect
	useEffect(() => {
		if (status !== "loading" && !session) {
			router.push('/login');
		}
	}, [session, status, router]);

	const isLibrarian = userRole === 'librarian';

	// Handle sign out
	const handleSignOut = async () => {
		localStorage.removeItem('selectedRole');
		await signOut({ callbackUrl: '/' });
	};

	// Toggle mobile menu
	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	// Navigation items based on role
	const getNavigationItems = () => {
		const commonItems = [
			{ href: '/dashboard', label: 'Dashboard', icon: FileText },
			{ href: '/dashboard/books', label: 'Books', icon: Book },
		];

		if (isLibrarian) {
			return [
				...commonItems,
				{ href: '/dashboard/members', label: 'Members', icon: Users },
				{ href: '/dashboard/loans', label: 'Loans', icon: BookOpen },
				{ href: '/dashboard/fines', label: 'Fines', icon: Settings },
			];
		} else {
			return [
				...commonItems,
				{ href: '/dashboard/my-loans', label: 'My Loans', icon: BookOpen },
				{ href: '/dashboard/my-fines', label: 'My Fines', icon: Settings },
				{ href: '/dashboard/profile', label: 'My Profile', icon: User },
			];
		}
	};

	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-2 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-2 text-gray-600">Redirecting...</p>
				</div>
			</div>
		);
	}

	const navigationItems = getNavigationItems();

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-black">
			{/* Top Navigation Bar */}
			<nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Left side - Navigation Menu */}
						<div className="flex items-center space-x-8">
							{/* Logo/Brand */}
							<div className="flex-shrink-0">
								<h1 className="text-xl font-bold text-gray-900 dark:text-white">
									Library Management
								</h1>
							</div>
							
							{/* Navigation Links */}
							<div className="hidden md:block">
								<div className="ml-10 flex items-baseline space-x-4">
									{navigationItems.map((item) => {
										const Icon = item.icon;
										const isActive = pathname === item.href;
										return (
											<Link
												key={item.href}
												href={item.href}
												className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
													isActive
														? 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'
														: 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
												}`}
											>
												<Icon className="h-4 w-4" />
												{item.label}
											</Link>
										);
									})}
								</div>
							</div>
						</div>

						{/* Right side - User Profile & Theme */}
						<div className="flex items-center space-x-4">
							{/* Welcome Message */}
							<div className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
								Welcome back, {session.user?.name || 'User'}!
							</div>

							{/* Role Badge */}
							<div className="hidden sm:block">
								<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
									isLibrarian 
										? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
										: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
								}`}>
									👩‍💼 {isLibrarian ? 'Librarian' : 'Borrower'}
								</span>
							</div>

							{/* Theme Toggle */}
							<ThemeToggle />

							{/* User Profile Dropdown */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="relative h-8 w-8 rounded-full">
										<Avatar className="h-8 w-8">
											<AvatarImage src={session.user?.image} alt={session.user?.name} />
											<AvatarFallback>
												{session.user?.name?.charAt(0) || 'U'}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<div className="flex items-center justify-start gap-2 p-2">
										<div className="flex flex-col space-y-1 leading-none">
											<p className="font-medium">{session.user?.name}</p>
											<p className="w-[200px] truncate text-sm text-muted-foreground">
												{session.user?.email}
											</p>
										</div>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
										<LogOut className="mr-2 h-4 w-4" />
										Sign out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Mobile menu button */}
						<div className="md:hidden">
							<Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
								{isMobileMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</Button>
						</div>
					</div>
				</div>

				{/* Mobile Navigation Menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden border-t border-gray-200 dark:border-gray-800">
						<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
							{navigationItems.map((item) => {
								const Icon = item.icon;
								const isActive = pathname === item.href;
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setIsMobileMenuOpen(false)}
										className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
											isActive
												? 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'
												: 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
										}`}
									>
										<Icon className="h-4 w-4" />
										{item.label}
									</Link>
								);
							})}
						</div>
					</div>
				)}
			</nav>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				{children}
			</main>
		</div>
	);
}
