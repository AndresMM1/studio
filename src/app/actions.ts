'use server';

import { generateWeeklyIncidentSummary } from '@/ai/flows/generate-weekly-incident-summary';
import { generateMonthlyIncidentSummary } from '@/ai/flows/generate-monthly-incident-summary';
import type { Incident } from '@/lib/types';

export async function getWeeklySummary(incidents: Incident[]): Promise<string> {
  if (incidents.length === 0) {
    return "No hay datos de incidentes disponibles para esta semana para generar un resumen.";
  }
  try {
    const result = await generateWeeklyIncidentSummary({
      incidentData: JSON.stringify(incidents),
    });
    return result.summary;
  } catch (error) {
    console.error('Error al generar el resumen semanal:', error);
    return 'Ocurrió un error al generar el resumen semanal. Por favor, inténtalo de nuevo más tarde.';
  }
}

export async function getMonthlySummary(month: string, incidents: Incident[]): Promise<string> {
  // The provided AI flow for monthly summary does not use incident data directly.
  // It generates a generic summary for the given month.
  if (incidents.filter(i => i.startTime.startsWith(month)).length === 0) {
      return `No hay datos de incidentes disponibles para ${month} para generar un resumen.`
  }

  try {
    const result = await generateMonthlyIncidentSummary({ month });
    return result.summary;
  } catch (error) {
    console.error('Error al generar el resumen mensual:', error);
    return 'Ocurrió un error al generar el resumen mensual. Por favor, inténtalo de nuevo más tarde.';
  }
}
