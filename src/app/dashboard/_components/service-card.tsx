"use client";

import { Flame, Box, FileBarChart, ChartLine, Search as SearchIcon } from "lucide-react";
import type { Servicio } from "@/lib/dashboard/api";

interface ServiceCardProps {
  service: Servicio;
  onSelect: () => void;
}

function toProperCase(str: string) {
  if (!str) return "";
  return str.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-blue-500/10 bg-white p-7 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-center justify-between pb-6">
        <h3 className="text-lg font-semibold text-gray-800">{toProperCase(service.SERVICE_NAME)}</h3>
      <div className="mt-5 flex justify-end">
        <button
          onClick={onSelect}
          title="Más detalles"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/40"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </div>
      </div>



      
    </div>
  );
}

function MetricRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-blue-500/5">
      <div className="flex items-center gap-3.5">
        {icon}
        <span className="font-light text-gray-600">{label}</span>
      </div>
      <span className="font-bold text-blue-600">{value}</span>
    </div>
  );
}