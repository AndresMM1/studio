"use client";

import { useEffect, useState, useMemo } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");

  useEffect(() => {
    fetchServicios().then((data) => {
      setServices(data);
      setFilteredServices(data);
      setIsLoading(false);
    });
  }, []);

  const channels = useMemo(
    () => [
      ...new Set(
        services
          .map((s) => s.SERVICE_CHANNEL)
          .filter((c): c is string => !!c)
      ),
    ],
    [services]
  );

  useEffect(() => {
    let results = services;

    if (selectedChannel) {
      results = results.filter(
        (s) => s.SERVICE_CHANNEL === selectedChannel
      );
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      results = results.filter((s) =>
        (s.SERVICE_NAME as string).toLowerCase().includes(lowercasedTerm)
      );
    }

    setFilteredServices(results);
  }, [searchTerm, selectedChannel, services]);

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
      <DashboardHeader
        onSearch={setSearchTerm}
        channels={channels}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
      />
      <ServiceGrid
        isLoading={isLoading}
        services={filteredServices}
        onSelect={setSelectedService}
      />
    </div>
  );
}