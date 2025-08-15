"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
	// TODO: derive from auth/session; manual toggle for now
	const [role, setRole] = useState("borrower"); // 'borrower' | 'librarian'

	return (
		<div className="min-h-screen px-6 py-8 bg-white dark:bg-black text-black dark:text-white space-y-8">
					<header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="flex items-start gap-4 w-full justify-between md:justify-start">
							<div>
								<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Role: <span className="font-medium">{role}</span></p>
							</div>
							<ThemeToggle />
						</div>
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								variant={role === 'borrower' ? 'default' : 'outline'}
								className={role === 'borrower' ? 'bg-black dark:bg-white text-white dark:text-black' : ''}
								onClick={() => setRole('borrower')}
							>Borrower</Button>
							<Button
								size="sm"
								variant={role === 'librarian' ? 'default' : 'outline'}
								className={role === 'librarian' ? 'bg-black dark:bg-white text-white dark:text-black' : ''}
								onClick={() => setRole('librarian')}
							>Librarian</Button>
						</div>
					</header>
			{role === 'librarian' ? <LibrarianView /> : <BorrowerView />}
		</div>
	);
}

