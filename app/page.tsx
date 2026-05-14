// app/page.tsx
"use client";
import Image from "next/image";
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
  job: string;
  customer: string;
  city: string;
  service: string;
  status: string;
  dispatchTime: string;
  eta: string;
  equipment: string;
  priority: string;
  foreman: string;
  notes: string;
};
const formatExcelTime = (value: any) => {
  if (!value) return "-";

  // Already formatted text
  if (typeof value === "string" && value.includes(":")) {
    return value;
  }

  // Excel serial time conversion
  const excelTime = Number(value);

  if (isNaN(excelTime)) return value;

  const totalMinutes = Math.round(excelTime * 24 * 60);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const period = hours >= 12 ? "PM" : "AM";

  const formattedHour =
    hours % 12 === 0 ? 12 : hours % 12;

  return `${formattedHour}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;
};
const statusStyles: Record<string, string> = {
  "En Route":
    "bg-orange-500/10 border-orange-500/60",

  "On Site":
    "bg-blue-500/10 border-blue-500/60",

  Drying:
    "bg-cyan-500/10 border-cyan-500/60",

  Completed:
    "bg-green-500/10 border-green-500/60",

  Scheduled:
    "bg-zinc-500/10 border-zinc-500/60",

  "Emergency Call":
    "bg-red-600/15 border-red-500/80 animate-pulse",
};

const priorityStyles: Record<string, string> = {
  Low:
    "bg-zinc-600 text-white",

  Medium:
    "bg-yellow-500 text-black",

  High:
    "bg-orange-500 text-white",

  Emergency:
    "bg-red-600 text-white animate-pulse",
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
  const fetchDispatch = async () => {
    try {
      const response = await fetch("/api/dispatch");

      const data = await response.json();

      // Find actual header row
      const headerIndex = data.findIndex(
        (row: any[]) => row.includes("Technician")
      );

      if (headerIndex === -1) return;

      // Remove blank rows above header
      const rows = data.slice(headerIndex + 1);

      // Remove empty rows
      const cleanedRows = rows.filter(
        (row: any[]) =>
          row.some(
            (cell) =>
              cell !== null &&
              cell !== undefined &&
              cell !== ""
          )
      );

      const parsed = cleanedRows.map((row: any[]) => ({
  technician: row[0] || "",
  job: row[1] || "",
  customer: row[2] || "",
  city: row[3] || "",
  service: row[4] || "",
  status: row[5] || "",
dispatchTime: formatExcelTime(row[6]),
eta: formatExcelTime(row[7]),
  equipment: row[8] || "",
  priority: row[9] || "",
  foreman: row[10] || "",
  notes: row[11] || "",
}));

      setDispatch(parsed);
    } catch (error) {
      console.error(error);
    }
  };

  fetchDispatch();

  const interval = setInterval(fetchDispatch, 30000);

  return () => clearInterval(interval);
}, []);
  return (
    <main className="min-h-screen bg-[#0f1115] text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(181,18,27,0.18),transparent_40%)] pointer-events-none" />

<div className="flex items-center gap-6">

<Image
  src="/drymedic-logo.png"
  alt="DRYmedic"
  width={220}
  height={80}
  priority
  className="object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]"
/>

  <div>
    <h1 className="text-2xl font-bold tracking-tight">
      Live Dispatch
    </h1>

    <p className="text-sm text-zinc-400">
      Technician Operations Dashboard
    </p>
  </div>

</div>


 {/* Dispatch Cards */}
<section className="relative z-10 px-4 py-3">
  <div className="grid grid-cols-1 gap-3">
    {dispatch.map((job, index) => (
      <div
        key={index}
        className={`
  rounded-2xl border p-3 backdrop-blur-md shadow-xl transition-all
  ${statusStyles[job.status]}
  ${job.priority === "Emergency"
    ? "shadow-red-500/40 shadow-2xl"
    : ""}
`}
      >
        <div className="grid grid-cols-10 gap-3 items-center">

          {/* Technician */}
          <div>
            <p className="text-[9px] uppercase opacity-60">
              Technician
            </p>

            <h2 className="text-lg font-bold">
              {job.technician}
            </h2>
          </div>

          {/* Job */}
          <div>
            <p className="text-[9px] uppercase opacity-60">
              Job
            </p>

            <h3 className="text-sm font-semibold">
              {job.job}
            </h3>
          </div>

          {/* Customer */}
          <div>
            <p className="text-[9px] uppercase opacity-60">
              Customer
            </p>

            <h3 className="text-sm font-semibold">
              {job.customer}
            </h3>
          </div>

          {/* City */}
          <div>
            <p className="text-[9px] uppercase opacity-60">
              Location
            </p>

            <h3 className="text-sm font-semibold">
              {job.city}
            </h3>
          </div>

          {/* Service */}
          <div>
            <p className="text-[9px] uppercase opacity-60">
              Service
            </p>

            <h3 className="text-sm font-medium">
              {job.service}
            </h3>
          </div>

          {/* Status */}
          <div>
            <p className="text-[9px] uppercase opacity-60">
              Status
            </p>

            <h3 className="text-sm font-bold">
              {job.status}
            </h3>
          </div>

          {/* ETA */}
          <div>
            <p className="text-[9px] uppercase opacity-60">
              ETA
            </p>

            <h3 className="text-base font-bold">
              {job.eta}
            </h3>
          </div>

          {/* Crew Lead */}
          <div>
            <p className="text-[9px] uppercase opacity-60">
              Foreman
            </p>

            <h3 className="text-sm font-semibold">
              {job.foreman}
            </h3>
          </div>

{/* Priority */}
<div>
  <p className="text-[9px] uppercase opacity-60">
    Priority
  </p>

  <div
    className={`inline-flex px-2 py-1 rounded-full text-xs font-bold mt-1 ${priorityStyles[job.priority]}`}
  >
    {job.priority}
  </div>
</div>

          {/* Notes */}
          <div>
            <p className="text-[9px] uppercase opacity-60">
              Notes
            </p>

            <h3 className="text-sm truncate">
              {job.notes}
            </h3>
          </div>

        </div>
      </div>
    ))}
  </div>
</section>
      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-10 py-4 flex items-center justify-between bg-black/20 backdrop-blur-md">
        <p className="text-zinc-400 text-sm">
          DRYmedic Birmingham Operations Center
        </p>

        <p className="text-zinc-500">
          Auto-refreshing every 30 seconds
        </p>
      </footer>
    </main>
  );
}