"use client";

import { Search } from "lucide-react";

interface DashboardHeaderProps {
  onSearch: (term: string) => void;
  channels: string[];
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
}

export function DashboardHeader({
  onSearch,
  channels,
  selectedChannel,
  onChannelChange,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="search"
            placeholder="Buscar servicio..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full max-w-xs rounded-lg border bg-white py-2 pl-10 pr-4 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="relative">
          <select
            value={selectedChannel}
            onChange={(e) => onChannelChange(e.target.value)}
            className="w-full max-w-xs appearance-none rounded-lg border bg-white py-2 pl-4 pr-10 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos los Canales</option>
            {channels.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* You can add the Aval logo SVG here if needed */}
    </header>
  );
}