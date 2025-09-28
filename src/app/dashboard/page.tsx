"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "./_components/header";
import { ServiceGrid } from "./_components/service-grid";
import { DetailView } from "./_components/detail-view";
import { ChartPlaceholder } from "./_components/chart-placeholder";
import { fetchServicios, type Servicio } from "@/lib/dashboard/api";

export default function DashboardPage() {
  const [services, setServices] = useState<Servicio[]>([]);
  const [filteredServices, setFilteredServices] = useState<Servicio[]>([]);
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServicios().then((data) => {
      setServices(data);
      setFilteredServices(data);
      setIsLoading(false);
    });
  }, []);

  const handleSearch = (term: string) => {
    const lowercasedTerm = term.toLowerCase();
    setFilteredServices(
      services.filter((s) => s.SERVICE_NAME.toLowerCase().includes(lowercasedTerm))
    );
  };

  if (selectedService) {
    return (
      <DetailView
        service={selectedService}
        onBack={() => setSelectedService(null)}
        apexChartComponent={ChartPlaceholder}
      />
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <DashboardHeader onSearch={handleSearch} />
      <ServiceGrid
        isLoading={isLoading}
        services={filteredServices}
        onSelect={setSelectedService}
      />
    </div>
  );
}