"use client";

import { Server, Database, Shield, Smartphone, Waypoints } from "lucide-react";

// A more compact node for the vertical tree diagram
function DiagramNode({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="z-10 flex w-28 flex-col items-center rounded-md border bg-white p-2 text-center shadow-sm">
      <div className="text-blue-500">{icon}</div>
      <p className="mt-1 text-xs font-semibold text-gray-700">{title}</p>
    </div>
  );
}

// The main diagram component, redesigned for a standard card size
export function ArchitectureDiagram() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl border bg-slate-50/50 p-4">
      <div className="relative flex flex-col items-center gap-3">
        {/* Top Node: Client */}
        <DiagramNode icon={<Smartphone size={18} />} title="Cliente" />

        {/* Connector Line */}
        <div className="h-4 w-0.5 bg-slate-300" />

        {/* Middle Node: Gateway */}
        <DiagramNode icon={<Waypoints size={18} />} title="API Gateway" />

        {/* T-Connector to services */}
        <div className="relative h-4 w-full">
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-slate-300" />
          <div className="absolute bottom-0 left-[25%] h-0.5 w-[50%] bg-slate-300" />
        </div>

        {/* Services Layer */}
        <div className="relative flex w-full justify-between">
          {/* Vertical lines connecting to the services */}
          <div className="absolute left-[25%] top-[-1rem] h-4 w-0.5 bg-slate-300" />
          <div className="absolute right-[25%] top-[-1rem] h-4 w-0.5 bg-slate-300" />

          <DiagramNode icon={<Shield size={16} />} title="Auth" />
          <DiagramNode icon={<Server size={16} />} title="Logic" />
        </div>

        {/* Inverted T-Connector to database */}
        <div className="relative h-4 w-full">
          <div className="absolute bottom-0 left-1/2 h-full w-0.5 -translate-x-1/2 bg-slate-300" />
          <div className="absolute top-0 left-[25%] h-0.5 w-[50%] bg-slate-300" />
        </div>

        {/* Bottom Node: Database */}
        <DiagramNode icon={<Database size={18} />} title="Base de Datos" />
      </div>
    </div>
  );
}