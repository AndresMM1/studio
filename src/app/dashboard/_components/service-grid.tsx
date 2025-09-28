"use client";

import { ServiceCard } from "./service-card";
import type { Servicio } from "@/lib/dashboard/api";

interface ServiceGridProps {
  services: Servicio[];
  isLoading: boolean;
  onSelect: (service: Servicio) => void;
}

export function ServiceGrid({ services, isLoading, onSelect }: ServiceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="mt-10 text-center text-sm text-muted-foreground">
        No se encontraron servicios.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {services.map((service) => (
        <ServiceCard
          key={service.SERVICE_NAME}
          service={service}
          onSelect={() => onSelect(service)}
        />
      ))}
    </div>
  );
}