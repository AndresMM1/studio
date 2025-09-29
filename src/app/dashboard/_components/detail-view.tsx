"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  GitPullRequest,
  Info,
  AppWindow,
  Database,
  User,
  Shield,
  FileText,
  Network,
  Building,
  Share2, // Import a new icon for the diagram
} from "lucide-react";
import {
  fetchServicioDetalle,
  fetchIncidentes,
  fetchCambios,
  fetchAplicaciones,
  fetchBasesDatos,
  fetchServicioInfo, // Import the new fetch function
  type Servicio,
  type ServicioDetalle,
  type ServicioInfo, // Import the new type
  type DataRow,
} from "@/lib/dashboard/api";
import { IncidentsLineChart } from "./incidents-line-chart";
import { ArchitectureDiagram } from "./architecture-diagram"; // Import the new diagram component
import {
  transformCambio,
  transformIncidente,
  transformAplicacion,
  transformBaseDatos,
} from "@/lib/dashboard/transformers";

// --- Column Configuration ---
// This config now matches the keys produced by our transformers
const columnConfig = {
  incidentes: {
    IDIncidente: "ID",
    Titulo: "Título",
    Prioridad: "Prioridad",
    Estado: "Estado",
  },
  cambios: {
    IDCambio: "ID",
    Resumen: "Resumen",
    Estado: "Estado",
    FechaSolicitud: "Fecha Solicitud",
  },
  aplicaciones: {
    NombreAplicacion: "Nombre",
    Tipo: "Tipo",
    Entorno: "Entorno",
  },
  basesDatos: {
    NombreBD: "Nombre",
    Motor: "Motor",
    Servidor: "Servidor",
  },
};

interface DetailViewProps {
  service: Servicio;
  onBack: () => void;
}

export function DetailView({ service, onBack }: DetailViewProps) {
  const [detalle, setDetalle] = useState<ServicioDetalle | null>(null);
  const [servicioInfo, setServicioInfo] = useState<ServicioInfo | null>(null);
  const [incidentes, setIncidentes] = useState<DataRow[]>([]);
  const [cambios, setCambios] = useState<DataRow[]>([]);
  const [aplicaciones, setAplicaciones] = useState<DataRow[]>([]);
  const [basesDatos, setBasesDatos] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const [detalleData, servicioInfoData, incidentesData, cambiosData, aplicacionesData, basesDatosData] = await Promise.all([
          fetchServicioDetalle(service.SERVICE_NAME),
          fetchServicioInfo(service.SERVICE_NAME),
          fetchIncidentes(service.SERVICE_NAME),
          fetchCambios(service.SERVICE_NAME),
          fetchAplicaciones(service.SERVICE_NAME),
          fetchBasesDatos(service.SERVICE_NAME),
        ]);
        setDetalle(detalleData);
        setServicioInfo(servicioInfoData);
        // Use transformers for all data types
        setIncidentes(incidentesData.slice(-1).map(transformIncidente));
        setCambios(cambiosData.slice(-1).map(transformCambio));
        setAplicaciones(aplicacionesData.map(transformAplicacion)); // Apply to all applications
        setBasesDatos(basesDatosData.map(transformBaseDatos)); // Apply to all databases
      } catch (err) {
        console.error("Failed to load service details:", err);
        setError("Could not load service details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [service.SERVICE_NAME]);

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center gap-4 rounded-xl   p-4 ">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{service.SERVICE_NAME}</h1>
      </header>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )}
      {error && <div className="text-center text-red-500">{error}</div>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Existing Cards */}
          <DetailsCard title="Incidentes" icon={<AlertTriangle className="h-5 w-5 text-red-500" />}>
            <IncidentsLineChart />
            <DataTable rows={incidentes} type="incidentes" />
          </DetailsCard>
          <DetailsCard title="Cambios" icon={<GitPullRequest className="h-5 w-5 text-blue-500" />}>
            <IncidentsLineChart />
            <DataTable rows={cambios} type="cambios" />
          </DetailsCard>
          
          {/* New Service Info Card */}
          <DetailsCard title="Descripción del Servicio" icon={<FileText className="h-5 w-5 text-cyan-500" />}>
            <ServiceInfoDisplay info={servicioInfo} />
          </DetailsCard>

          {/* Architecture Diagram Card - Now a standard size card */}
          <DetailsCard title="Arquitectura del Servicio" icon={<Share2 className="h-5 w-5 text-indigo-500" />}>
            <ArchitectureDiagram />
          </DetailsCard>
          <DetailsCard title="Información" icon={<Info className="h-5 w-5 text-gray-500" />}>
            <DefinitionList data={detalle} />
          </DetailsCard>
          <DetailsCard title="Aplicaciones" icon={<AppWindow className="h-5 w-5 text-green-500" />}>
            <DataTable rows={aplicaciones} type="aplicaciones" />
          </DetailsCard>
          <DetailsCard title="Bases de Datos" icon={<Database className="h-5 w-5 text-purple-500" />}>
            <DataTable rows={basesDatos} type="basesDatos" />
          </DetailsCard>
        </div>
      )}
    </div>
  );
}

function DetailsCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 border-b pb-3 text-xl font-semibold text-gray-700">{title}</h2>
      <div className="space-y-4">{children}</div>
      </div>
  );
}

function ServiceInfoDisplay({ info }: { info: ServicioInfo | null }) {
  if (!info) {
    return <p className="text-sm text-muted-foreground">No hay información disponible.</p>;
  }

  const infoMap = {
    SERVICE_DESCRIPTION: "Descripción",
    SERVICE_IMPACT: "Impacto",
    SERVICE_IMPORTANCE: "Importancia",
    SERVICE_WIF: "Para que es",
  };

  return (
    <div className="space-y-6">
      {Object.entries(infoMap).map(([key, title]) => {
        const value = info[key];
        if (!value) return null;
        return (
          <div key={key}>
            <h3 className="text-md font-semibold text-slate-600">{title}</h3>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-500">{value}</p>
          </div>
        );
      })}
    </div>
  );
}

function DataTable({ rows, type }: { rows: DataRow[]; type: keyof typeof columnConfig }) {
    if (!rows || rows.length === 0) {
      return <p className="text-sm text-muted-foreground">No hay datos disponibles.</p>;
    }

    // Get the specific column configuration for the given type (e.g., "cambios")
    const columns = columnConfig[type];
    // Get the keys to use for data lookup (e.g., ["IDCambio", "Resumen", "Estado", "FechaSolicitud"])
    const columnKeys = Object.keys(columns);

    return (
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {/* Map over the keys to create table headers */}
              {columnKeys.map((key) => (
                <th key={key} className="px-4 py-2 font-medium text-slate-600">
                  {/* Use the value from the config as the header title (e.g., "ID") */}
                  {columns[key as keyof typeof columns]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t hover:bg-slate-50">
                {/* Map over the same keys to create table cells */}
                {columnKeys.map((key) => {
                  // Use the key to get the specific data from the row object
                  const cellValue = String(row[key] ?? "N/A");
                  return (
                    <td key={key} className="truncate px-4 py-2 text-slate-500" title={cellValue}>
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function DefinitionList({ data }: { data: ServicioDetalle | null }) {
    if (!data) {
      return <p className="text-sm text-muted-foreground">No hay detalles disponibles.</p>;
    }

    const getIconForKey = (key: string) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("leader")) return <User className="h-4 w-4 text-slate-400" />;
      if (lowerKey.includes("owner")) return <Shield className="h-4 w-4 text-slate-400" />;
      if (lowerKey.includes("ds")) return <FileText className="h-4 w-4 text-slate-400" />;
      if (lowerKey.includes("canal")) return <Network className="h-4 w-4 text-slate-400" />;
      if (lowerKey.includes("gerencia") || lowerKey.includes("direccion")) return <Building className="h-4 w-4 text-slate-400" />;
      return <Info className="h-4 w-4 text-slate-400" />; // Default icon
    };

    return (
      <dl className="space-y-4">
        {Object.entries(data).map(([key, value]) => {
          const displayValue = String(value ?? "N/A");
          const isMultiValue = displayValue.includes(";");

          return (
            <div key={key} className="rounded-lg bg-slate-50 p-4">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {getIconForKey(key)}
                <span>{key.replace(/_/g, " ")}</span>
              </dt>
              <dd className="mt-2 pl-6 text-sm text-slate-800">
                {isMultiValue
                  ? displayValue.split(";").map((item, index) => (
                    <span key={index} className="block">
                      {item.trim()}
                    </span>
                  ))
                  : displayValue}
              </dd>
            </div>
          );
        })}
      </dl>
    );
  }