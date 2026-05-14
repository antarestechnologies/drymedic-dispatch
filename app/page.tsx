// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  AlertTriangle,
  Truck,
  CheckCircle2,
  Droplets,
} from "lucide-react";

type DispatchItem = {
  technician: string;
  city: string;
  customer: string;
  service: string;
  status: string;
  eta: string;
  priority: string;
};

const statusStyles: Record<string, string> = {
  "En Route":
    "bg-orange-500/20 border-orange-500 text-orange-300",
  "On Site":
    "bg-blue-500/20 border-blue-500 text-blue-300",
  Drying:
    "bg-cyan-500/20 border-cyan-500 text-cyan-300",
  Completed:
    "bg-green-500/20 border-green-500 text-green-300",
  Scheduled:
    "bg-zinc-500/20 border-zinc-500 text-zinc-300",
};

export default function DispatchBoard() {
  const [time, setTime] = useState("");
  const [dispatch, setDispatch] = useState<DispatchItem[]>([]);

  // LIVE CLOCK
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    };

    updateClock();

    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  // FETCH EXCEL DATA
  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        /**
         * REPLACE THIS WITH YOUR EXCEL CSV SHARE LINK
         *
         * Microsoft 365 Excel:
         * File -> Share -> Publish -> CSV
         *
         * OR:
         * Use Graph API later for auth/security
         */

        const response = await fetch(
          "https://drymedic150-my.sharepoint.com/:x:/g/personal/carson_drymedicbirminghamal_com/IQAulEtLPNLTR4xIl7WBsOs2AcbR1LxEaJNrtR1rAaTlpGg?e=YoJ3uN"
        );

        const csvText = await response.text();

        const rows = csvText
          .split("\n")
          .map((row) => row.split(","));

        // Remove header row
        rows.shift();

        const parsed = rows.map((row) => ({
          technician: row[0],
          customer: row[1],
          city: row[2],
          service: row[3],
          status: row[4],
          eta: row[5],
          priority: row[6],
        }));

        setDispatch(parsed);
      } catch (error) {
        console.error("Failed loading dispatch data:", error);
      }
    };

    fetchExcelData();

    // AUTO REFRESH EVERY 30 SECONDS
    const refresh = setInterval(fetchExcelData, 30000);

    return () => clearInterval(refresh);
  }, []);

  return (
    <main className="min-h-screen bg-[#0f1115] text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(181,18,27,0.18),transparent_40%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 px-10 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            DRYmedic Live Dispatch
          </h1>

          <p className="text-zinc-400 mt-1 text-lg">
            Technician Operations Dashboard
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
          <Clock3 className="w-6 h-6 text-red-400" />

          <span className="text-3xl font-semibold tracking-wide">
            {time}
          </span>
        </div>
      </header>

      {/* Emergency Banner */}
      <section className="relative z-10 px-10 pt-6">
        <div className="bg-red-600/15 border border-red-500 rounded-2xl px-6 py-4 flex items-center gap-4">
          <AlertTriangle className="w-7 h-7 text-red-400" />

          <div>
            <h2 className="font-semibold text-xl">
              Live Technician Tracking
            </h2>

            <p className="text-zinc-300">
              Dashboard synced directly to cloud dispatch spreadsheet
            </p>
          </div>
        </div>
      </section>

      {/* Dispatch Cards */}
      <section className="relative z-10 px-10 py-8">
        <div className="grid grid-cols-1 gap-6">
          {dispatch.map((job, index) => (
            <div
              key={index}
              className={`rounded-3xl border p-6 backdrop-blur-md shadow-2xl transition-all ${statusStyles[job.status]}`}
            >
              <div className="grid grid-cols-6 gap-6 items-center">
                {/* Technician */}
                <div>
                  <p className="text-sm uppercase tracking-widest opacity-60">
                    Technician
                  </p>

                  <h2 className="text-3xl font-bold mt-1">
                    {job.technician}
                  </h2>
                </div>

                {/* Customer */}
                <div>
                  <p className="text-sm uppercase tracking-widest opacity-60">
                    Customer
                  </p>

                  <h3 className="text-2xl font-semibold mt-1">
                    {job.customer}
                  </h3>
                </div>

                {/* Location */}
                <div>
                  <p className="text-sm uppercase tracking-widest opacity-60">
                    Location
                  </p>

                  <h3 className="text-2xl font-semibold mt-1">
                    {job.city}
                  </h3>
                </div>

                {/* Service */}
                <div>
                  <p className="text-sm uppercase tracking-widest opacity-60">
                    Service
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <Droplets className="w-5 h-5" />

                    <span className="text-xl font-medium">
                      {job.service}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm uppercase tracking-widest opacity-60">
                    Status
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    {job.status === "On Site" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Truck className="w-5 h-5" />
                    )}

                    <span className="text-2xl font-bold">
                      {job.status}
                    </span>
                  </div>
                </div>

                {/* ETA */}
                <div>
                  <p className="text-sm uppercase tracking-widest opacity-60">
                    ETA
                  </p>

                  <h3 className="text-3xl font-bold mt-1">
                    {job.eta}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-10 py-4 flex items-center justify-between bg-black/20 backdrop-blur-md">
        <p className="text-zinc-400 text-lg">
          DRYmedic Birmingham Operations Center
        </p>

        <p className="text-zinc-500">
          Auto-refreshing every 30 seconds
        </p>
      </footer>
    </main>
  );
}