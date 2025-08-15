"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// Placeholder stat card component
function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-1 bg-white dark:bg-black">
      <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-xl font-semibold">{value}</span>
      {accent && <span className="text-[10px] text-gray-400">{accent}</span>}
    </div>
  );
}

export default function LibrarianDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulated fetch - replace with real API call /api/dashboard/librarian
    setTimeout(() => {
      setData({
        activeLoans: 42,
        overdue: 5,
        holdsPending: 7,
        recentBooks: [
          { id: 1, title: "Clean Code" },
          { id: 2, title: "Pragmatic Programmer" },
          { id: 3, title: "Refactoring" },
        ],
        overdueList: [
          { id: 101, user: "Alice", title: "Dune", due: "2025-08-10" },
          { id: 102, user: "Bob", title: "1984", due: "2025-08-11" },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen px-6 py-8 bg-white dark:bg-black text-black dark:text-white space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Librarian Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Add Book</Button>
          <Button size="sm" className="bg-black dark:bg-white text-white dark:text-black">Manage Users</Button>
        </div>
      </header>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && data && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Active Loans" value={data.activeLoans} />
            <StatCard label="Overdue" value={data.overdue} accent="Needs attention" />
            <StatCard label="Holds Pending" value={data.holdsPending} />
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="border rounded-md border-gray-200 dark:border-gray-800 p-4">
              <h2 className="font-medium mb-3 text-sm">Recent Books</h2>
              <ul className="space-y-2 text-sm">
                {data.recentBooks.map(b => (
                  <li key={b.id} className="flex justify-between border-b last:border-none border-dotted border-gray-200 dark:border-gray-800 pb-1">
                    <span>{b.title}</span>
                    <button className="text-xs underline">View</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border rounded-md border-gray-200 dark:border-gray-800 p-4">
              <h2 className="font-medium mb-3 text-sm">Overdue (Top)</h2>
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
                  {data.overdueList.map(o => (
                    <tr key={o.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="py-1 pr-2">{o.user}</td>
                      <td className="py-1 pr-2">{o.title}</td>
                      <td className="py-1 pr-2">{o.due}</td>
                      <td className="py-1 text-right">
                        <button className="text-[10px] underline">Remind</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
