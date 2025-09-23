'use server';

import { generateWeeklyIncidentSummary } from '@/ai/flows/generate-weekly-incident-summary';
import { generateMonthlyIncidentSummary } from '@/ai/flows/generate-monthly-incident-summary';
import type { Incident } from '@/lib/types';

export async function getWeeklySummary(incidents: Incident[]): Promise<string> {
  if (incidents.length === 0) {
    return "No incident data available for this week to generate a summary.";
  }
  try {
    const result = await generateWeeklyIncidentSummary({
      incidentData: JSON.stringify(incidents),
    });
    return result.summary;
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return 'An error occurred while generating the weekly summary. Please try again later.';
  }
}

export async function getMonthlySummary(month: string, incidents: Incident[]): Promise<string> {
  // The provided AI flow for monthly summary does not use incident data directly.
  // It generates a generic summary for the given month.
  if (incidents.filter(i => i.time.startsWith(month)).length === 0) {
      return `No incident data available for ${month} to generate a summary.`
  }

  try {
    const result = await generateMonthlyIncidentSummary({ month });
    return result.summary;
  } catch (error) {
    console.error('Error generating monthly summary:', error);
    return 'An error occurred while generating the monthly summary. Please try again later.';
  }
}
