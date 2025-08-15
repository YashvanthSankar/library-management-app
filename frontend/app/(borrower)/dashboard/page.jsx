"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function LoanItem({ loan }) {
  return (
    <div className="flex items-center justify-between text-xs border-b last:border-none border-gray-200 dark:border-gray-800 py-1">
      <span className="truncate max-w-[140px]" title={loan.title}>{loan.title}</span>
      <span className={`px-2 py-0.5 rounded-full border text-[10px] ${loan.status === 'overdue' ? 'border-red-500 text-red-600' : 'border-gray-400 dark:border-gray-600'} `}>{loan.due}</span>
    </div>
  );
}

export default function BorrowerDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulated fetch - replace with real API call /api/dashboard/borrower
    setTimeout(() => {
      setData({
        loans: [
          { id: 1, title: "The Hobbit", due: "Aug 20", status: "ok" },
          { id: 2, title: "Algorithms", due: "Aug 18", status: "ok" },
          { id: 3, title: "Brave New World", due: "Aug 10", status: "overdue" },
        ],
        holds: [
          { id: 11, title: "Sapiens", position: 2 },
          { id: 12, title: "Atomic Habits", position: 5 },
        ],
        fines: 0,
      });
      setLoading(false);
    }, 450);
  }, []);

  return (
    <div className="min-h-screen px-6 py-8 bg-white dark:bg-black text-black dark:text-white space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Your Dashboard</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Browse</Button>
          <Button size="sm" className="bg-black dark:bg-white text-white dark:text-black">Search</Button>
        </div>
      </header>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && data && (
        <>
          <section className="grid gap-6 md:grid-cols-3">
            <div className="border rounded-md border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3 col-span-2">
              <h2 className="font-medium text-sm">Current Loans</h2>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {data.loans.map(l => <LoanItem key={l.id} loan={l} />)}
              </div>
              <div className="flex justify-end">
                <Button size="xs" variant="outline" className="text-[11px] h-6 px-2">View All</Button>
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
                <Button size="xs" variant="outline" className="text-[11px] h-6 px-2">Manage</Button>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            <div className="border rounded-md border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2">
              <h2 className="font-medium text-sm">Fines</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">${data.fines.toFixed(2)}</p>
              {data.fines === 0 && <span className="text-[10px] text-green-600 dark:text-green-400">No outstanding fines</span>}
            </div>
            <div className="border rounded-md border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2 md:col-span-2">
              <h2 className="font-medium text-sm">Tips</h2>
              <ul className="text-[11px] list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                <li>Return overdue books to avoid penalties.</li>
                <li>Renew eligible loans 2 days before due.</li>
                <li>Track hold positions for planning.</li>
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
