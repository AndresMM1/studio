"use client";

import { Search } from "lucide-react";

interface DashboardHeaderProps {
  onSearch: (term: string) => void;
}

export function DashboardHeader({ onSearch }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 mb-6">
      <div className="relative">
        <input
          type="search"
          placeholder="Buscar servicio..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border bg-white py-2 pl-10 pr-4 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {/* You can add the Aval logo SVG here if needed */}
    </header>
  );
}