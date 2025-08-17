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
	Users, 
	UserCheck, 
	UserX, 
	Mail,
	Calendar,
	Shield,
	UserRound
} from "lucide-react";
import { API_URL } from "@/lib/utils";

export default function MembersPage() {
	const { data: session } = useSession();
	const [members, setMembers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredMembers, setFilteredMembers] = useState([]);

	// Check if user is librarian
	const [userRole, setUserRole] = useState(null);
	useEffect(() => {
		const storedRole = localStorage.getItem('selectedRole');
		setUserRole(storedRole || 'borrower');
	}, []);

	// Fetch members data
	useEffect(() => {
		fetchMembers();
	}, []);

	// Filter members based on search
	useEffect(() => {
		if (searchTerm.trim() === "") {
			setFilteredMembers(members);
		} else {
			const filtered = members.filter(member =>
				member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				member.role?.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredMembers(filtered);
		}
	}, [searchTerm, members]);

	const fetchMembers = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${API_URL}/api/users`);
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json();
			
			if (data.success) {
				setMembers(data.data || []);
				setFilteredMembers(data.data || []);
			} else {
				console.error("API returned error:", data.message);
				// For now, show empty state instead of error
				setMembers([]);
				setFilteredMembers([]);
			}
		} catch (error) {
			console.error("Error fetching members:", error);
			// For now, show empty state instead of error
			setMembers([]);
			setFilteredMembers([]);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusToggle = async (memberId, currentStatus) => {
		try {
			const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
			
			const response = await fetch(`${API_URL}/api/users/${memberId}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			
			if (data.success) {
				// Update the local state
				setMembers(prev => prev.map(member => 
					member.id === memberId 
						? { ...member, status: newStatus }
						: member
				));
				console.log(`Member status updated to ${newStatus}`);
			} else {
				console.error("Failed to update member status:", data.message);
				alert(`Failed to update member status: ${data.message}`);
			}
		} catch (error) {
			console.error("Error updating member status:", error);
			alert(`Error updating member status: ${error.message}`);
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const getRoleBadgeVariant = (role) => {
		return role === 'librarian' ? 'default' : 'secondary';
	};

	const getStatusBadgeVariant = (status) => {
		return status === 'active' ? 'default' : 'destructive';
	};

	// Redirect if not librarian
	if (userRole !== 'librarian') {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						Access Restricted
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Only librarians can access the members page.
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
					<p className="mt-2 text-gray-600">Loading members...</p>
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
						Library Members
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Manage library member accounts and access
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Users className="h-5 w-5 text-gray-500" />
					<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
						{filteredMembers.length} members
					</span>
				</div>
			</div>

			{/* Search Bar */}
			<div className="flex items-center space-x-4">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					<Input
						placeholder="Search members by name, email, or role..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{/* Members Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
					<div className="flex items-center">
						<div className="rounded-md p-2 bg-blue-50 dark:bg-blue-900/20">
							<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
							<p className="text-xl font-bold text-gray-900 dark:text-white">
								{members.length}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
					<div className="flex items-center">
						<div className="rounded-md p-2 bg-green-50 dark:bg-green-900/20">
							<UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
							<p className="text-xl font-bold text-gray-900 dark:text-white">
								{members.filter(m => m.status === 'active').length}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
					<div className="flex items-center">
						<div className="rounded-md p-2 bg-purple-50 dark:bg-purple-900/20">
							<Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Librarians</p>
							<p className="text-xl font-bold text-gray-900 dark:text-white">
								{members.filter(m => m.role === 'librarian').length}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Members Table */}
			<div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Member</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Joined</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredMembers.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center py-8">
									<UserRound className="h-8 w-8 text-gray-400 mx-auto mb-2" />
									<p className="text-gray-500 dark:text-gray-400">
										{searchTerm ? "No members found matching your search." : "No members found."}
									</p>
								</TableCell>
							</TableRow>
						) : (
							filteredMembers.map((member) => (
								<TableRow key={member.id}>
									<TableCell>
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
												<span className="text-sm font-medium text-gray-600 dark:text-gray-300">
													{member.name?.charAt(0)?.toUpperCase() || 'U'}
												</span>
											</div>
											<div>
												<p className="font-medium text-gray-900 dark:text-white">
													{member.name || 'Unknown User'}
												</p>
												<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
													<Mail className="h-3 w-3 mr-1" />
													{member.email}
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant={getRoleBadgeVariant(member.role)}>
											{member.role}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={getStatusBadgeVariant(member.status)}>
											{member.status}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
											<Calendar className="h-3 w-3 mr-1" />
											{formatDate(member.createdAt)}
										</div>
									</TableCell>
									<TableCell>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleStatusToggle(member.id, member.status)}
											className="flex items-center space-x-1"
										>
											{member.status === 'active' ? (
												<>
													<UserX className="h-3 w-3" />
													<span>Deactivate</span>
												</>
											) : (
												<>
													<UserCheck className="h-3 w-3" />
													<span>Activate</span>
												</>
											)}
										</Button>
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
