"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { LogOut, User, Settings } from "lucide-react";

// Re‑usable small stat card
function Stat({ label, value, note }) {
	return (
		<div className="rounded-md border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-1 bg-white dark:bg-black">
			<span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
			<span className="text-xl font-semibold leading-none">{value}</span>
			{note && <span className="text-[10px] text-gray-400">{note}</span>}
		</div>
	);
}

// Librarian view section
function LibrarianView() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState(null);

	useEffect(() => {
		const t = setTimeout(() => {
			setData({
				stats: { activeLoans: 42, overdue: 5, holds: 7 },
				recentBooks: ["Clean Code", "Refactoring", "Design Patterns"],
				overdueSample: [
					{ id: 1, user: "Alice", title: "Dune", due: "Aug 10" },
					{ id: 2, user: "Bob", title: "1984", due: "Aug 11" },
				],
			});
			setLoading(false);
		}, 400);
		return () => clearTimeout(t);
	}, []);

	if (loading) return <p className="text-sm text-gray-500">Loading librarian data...</p>;

	return (
		<div className="space-y-8">
			<section className="grid gap-4 sm:grid-cols-3">
				<Stat label="Active Loans" value={data.stats.activeLoans} />
				<Stat label="Overdue" value={data.stats.overdue} note="Needs attention" />
				<Stat label="Holds" value={data.stats.holds} />
			</section>
			<section className="grid gap-6 md:grid-cols-2">
				<div className="border rounded-md border-gray-200 dark:border-gray-800 p-4">
					<h2 className="font-medium text-sm mb-3">Recent Books</h2>
						<ul className="space-y-2 text-xs">
							{data.recentBooks.map(b => (
								<li key={b} className="flex justify-between border-b last:border-none border-dotted border-gray-200 dark:border-gray-800 pb-1">
									<span>{b}</span>
									<button className="text-[10px] underline">View</button>
								</li>
							))}
						</ul>
				</div>
				<div className="border rounded-md border-gray-200 dark:border-gray-800 p-4">
					<h2 className="font-medium text-sm mb-3">Overdue (Sample)</h2>
					<table className="w-full text-xs">
						<thead className="text-gray-500">
							<tr className="text-left">
								<th className="py-1">User</th>
								<th className="py-1">Title</th>
								<th className="py-1">Due</th>
								<th className="py-1" />
							</tr>
						</thead>
						<tbody>
							{data.overdueSample.map(row => (
								<tr key={row.id} className="border-t border-gray-100 dark:border-gray-800">
									<td className="py-1 pr-2">{row.user}</td>
									<td className="py-1 pr-2">{row.title}</td>
									<td className="py-1 pr-2">{row.due}</td>
									<td className="py-1 text-right">
										<button className="text-[10px] underline">Remind</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}

// Borrower view section
function BorrowerView() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState(null);

	useEffect(() => {
		const t = setTimeout(() => {
			setData({
				loans: [
					{ id: 1, title: "The Hobbit", due: "Aug 20", status: "ok" },
					{ id: 2, title: "Brave New World", due: "Aug 11", status: "overdue" },
				],
				holds: [{ id: 8, title: "Sapiens", position: 2 }],
				fines: 0,
			});
			setLoading(false);
		}, 380);
		return () => clearTimeout(t);
	}, []);

	if (loading) return <p className="text-sm text-gray-500">Loading your data...</p>;

	return (
		<div className="space-y-8">
			<section className="grid gap-6 md:grid-cols-3">
				<div className="border rounded-md border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3 md:col-span-2">
					<h2 className="font-medium text-sm">Current Loans</h2>
					<div className="divide-y divide-gray-200 dark:divide-gray-800 text-xs">
						{data.loans.map(l => (
							<div key={l.id} className="flex justify-between py-1">
								<span className="truncate max-w-[160px]" title={l.title}>{l.title}</span>
								<span className={`px-2 py-0.5 rounded-full border text-[10px] ${l.status === 'overdue' ? 'border-red-500 text-red-600' : 'border-gray-400 dark:border-gray-600'}`}>{l.due}</span>
							</div>
						))}
					</div>
					<div className="flex justify-end">
						<Button size="xs" variant="outline" className="h-6 px-2 text-[11px]">View All</Button>
					</div>
				</div>
				<div className="border rounded-md border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3">
					<h2 className="font-medium text-sm">Holds</h2>
					<ul className="space-y-2 text-xs">
						{data.holds.map(h => (
							<li key={h.id} className="flex justify-between border-b last:border-none border-dotted border-gray-200 dark:border-gray-800 pb-1">
								<span className="truncate max-w-[120px]" title={h.title}>{h.title}</span>
								<span className="text-[10px] text-gray-500">#{h.position}</span>
							</li>
						))}
					</ul>
					<div className="flex justify-end">
						<Button size="xs" variant="outline" className="h-6 px-2 text-[11px]">Manage</Button>
					</div>
				</div>
			</section>
			<section className="grid gap-6 md:grid-cols-3">
				<div className="border rounded-md border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2">
					<h2 className="font-medium text-sm">Fines</h2>
					<p className="text-xs text-gray-600 dark:text-gray-400">₹{data.fines.toFixed(2)}</p>
					{data.fines === 0 && <span className="text-[10px] text-green-600 dark:text-green-400">No outstanding fines</span>}
				</div>
				<div className="border rounded-md border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2 md:col-span-2">
					<h2 className="font-medium text-sm">Tips</h2>
					<ul className="text-[11px] list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
						<li>Renew loans a couple days before due.</li>
						<li>Return overdue items promptly.</li>
						<li>Watch hold positions.</li>
					</ul>
				</div>
			</section>
		</div>
	);
}

export default function UnifiedDashboard() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [role, setRole] = useState("borrower");

	// Redirect to login if not authenticated
	useEffect(() => {
		if (status === "loading") return;
		if (!session) {
			router.push("/login");
		} else {
			// Set role from session when available
			setRole(session.user.role || "borrower");
		}
	}, [session, status, router]);

	// Show loading while checking auth
	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
				<div className="text-sm text-gray-500">Loading...</div>
			</div>
		);
	}

	// Don't render if no session
	if (!session) {
		return null;
	}

	const user = session.user;

	// User Profile Component
	function UserProfile() {
		const getInitials = (name) => {
			if (!name) return "U";
			return name
				.split(" ")
				.map(word => word[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		};

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="relative h-10 w-10 rounded-full">
						<Avatar className="h-10 w-10">
							<AvatarImage src={user.image} alt={user.name || "User"} />
							<AvatarFallback className="bg-gray-100 dark:bg-gray-800">
								{getInitials(user.name)}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end" forceMount>
					<div className="flex flex-col space-y-1 p-2">
						<p className="text-sm font-medium leading-none">{user.name}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
						<div className="flex items-center gap-1 mt-1">
							<div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
								{role === "librarian" ? "📚 Librarian" : "📖 Borrower"}
							</div>
						</div>
					</div>
					<DropdownMenuSeparator />
					{/* <DropdownMenuItem className="cursor-pointer">
						<User className="mr-2 h-4 w-4" />
						<span>Profile</span>
					</DropdownMenuItem>
					<DropdownMenuItem className="cursor-pointer">
						<Settings className="mr-2 h-4 w-4" />
						<span>Settings</span>
					</DropdownMenuItem> */}
					<DropdownMenuSeparator />
					<DropdownMenuItem 
						className="cursor-pointer text-red-600 dark:text-red-400"
						onClick={() => signOut({ callbackUrl: "/" })}
					>
						<LogOut className="mr-2 h-4 w-4" />
						<span>Log out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<div className="min-h-screen px-6 py-8 bg-white dark:bg-black text-black dark:text-white space-y-8">
			<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-start gap-4 w-full justify-between md:justify-start">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							Welcome back, {user.name?.split(" ")[0] || "User"}!
						</h1>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
							Role: <span className="font-medium capitalize">{role}</span>
						</p>
					</div>
					<div className="flex items-center gap-3">
						<ThemeToggle />
						<UserProfile />
					</div>
				</div>
				
				{/* Keep role toggle for testing - remove in production */}
				<div className="flex items-center gap-2">
					{/* <span className="text-xs text-gray-500">Test Role:</span> */}
					<Button
						size="sm"
						variant={role === 'borrower' ? 'default' : 'outline'}
						className={role === 'borrower' ? 'bg-black dark:bg-white text-white dark:text-black' : ''}
						onClick={() => setRole('borrower')}
					>
						Borrower
					</Button>
					<Button
						size="sm"
						variant={role === 'librarian' ? 'default' : 'outline'}
						className={role === 'librarian' ? 'bg-black dark:bg-white text-white dark:text-black' : ''}
						onClick={() => setRole('librarian')}
					>
						Librarian
					</Button>
				</div>
			</header>
			
			{role === 'librarian' ? <LibrarianView /> : <BorrowerView />}
		</div>
	);
}

