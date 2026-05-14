"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

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

  if (typeof value === "string" && value.includes(":")) {
    return value;
  }

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
  const [dispatch, setDispatch] = useState<DispatchItem[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState("");

  // LIVE CLOCK
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setCurrentTime(
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

  // WEATHER
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=33.4718&longitude=-86.8008&current=temperature_2m&temperature_unit=fahrenheit"
        );

        const data = await response.json();

        setWeather(data.current);
      } catch (error) {
        console.error(error);
      }
    };

    fetchWeather();

    const interval = setInterval(fetchWeather, 300000);

    return () => clearInterval(interval);
  }, []);
    // HARD PAGE REFRESH EVERY 30 SECONDS
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // FETCH EXCEL DATA
  useEffect(() => {
    const fetchDispatch = async () => {
      try {
        const response = await fetch("/api/dispatch");

        const data = await response.json();

        const headerIndex = data.findIndex(
          (row: any[]) => row.includes("Technician")
        );

        if (headerIndex === -1) return;

        const rows = data.slice(headerIndex + 1);

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

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 px-6 py-4">

        <div className="flex items-center justify-between">

          {/* LEFT */}
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
              <h1 className="text-xl font-bold tracking-tight">
                Live Dispatch
              </h1>

              <p className="text-sm text-zinc-400">
                Technician Operations Dashboard
              </p>
            </div>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            {/* WEATHER */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-md">
              <p className="text-xs uppercase tracking-widest text-zinc-400">
                Homewood, AL
              </p>

              <div className="flex items-center gap-3 mt-1">

                <div className="text-2xl">
                  ☀️
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {weather?.temperature_2m ?? "--"}°
                  </h2>

                  <p className="text-xs text-zinc-400">
                    Current Weather
                  </p>
                </div>

              </div>
            </div>

            {/* CLOCK */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">

                <Clock3 className="w-5 h-5 text-red-400" />

                <h2 className="text-3xl font-bold tracking-wide">
                  {currentTime}
                </h2>

              </div>
            </div>

          </div>

        </div>

      </header>

      {/* Dispatch Cards */}
      <section className="relative z-10 px-4 py-3 pb-24">

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

                <div>
                  <p className="text-[9px] uppercase opacity-60">
                    Technician
                  </p>

                  <h2 className="text-lg font-bold">
                    {job.technician}
                  </h2>
                </div>

                <div>
                  <p className="text-[9px] uppercase opacity-60">
                    Job
                  </p>

                  <h3 className="text-sm font-semibold">
                    {job.job}
                  </h3>
                </div>

                <div>
                  <p className="text-[9px] uppercase opacity-60">
                    Customer
                  </p>

                  <h3 className="text-sm font-semibold">
                    {job.customer}
                  </h3>
                </div>

                <div>
                  <p className="text-[9px] uppercase opacity-60">
                    Location
                  </p>

                  <h3 className="text-sm font-semibold">
                    {job.city}
                  </h3>
                </div>

                <div>
                  <p className="text-[9px] uppercase opacity-60">
                    Service
                  </p>

                  <h3 className="text-sm font-medium">
                    {job.service}
                  </h3>
                </div>

                <div>
                  <p className="text-[9px] uppercase opacity-60">
                    Status
                  </p>

                  <h3 className="text-sm font-bold">
                    {job.status}
                  </h3>
                </div>

                <div>
                  <p className="text-[9px] uppercase opacity-60">
                    ETA
                  </p>

                  <h3 className="text-base font-bold">
                    {job.eta}
                  </h3>
                </div>

                <div>
                  <p className="text-[9px] uppercase opacity-60">
                    Foreman
                  </p>

                  <h3 className="text-sm font-semibold">
                    {job.foreman}
                  </h3>
                </div>

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