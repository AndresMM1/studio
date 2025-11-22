'use server';

import type { Incident } from '@/lib/types';

export async function getWeeklySummary(_incidents: Incident[]): Promise<string> {
  return "AI Summary Disabled";
}

export async function getMonthlySummary(_month: string, _incidents: Incident[]): Promise<string> {
  return "AI Summary Disabled";
}
