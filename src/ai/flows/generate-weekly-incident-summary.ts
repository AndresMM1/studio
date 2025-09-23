'use server';
/**
 * @fileOverview An AI agent to generate a brief summary of notable incident changes each week.
 *
 * - generateWeeklyIncidentSummary - A function that generates the weekly incident summary.
 * - GenerateWeeklyIncidentSummaryInput - The input type for the generateWeeklyIncidentSummary function.
 * - GenerateWeeklyIncidentSummaryOutput - The return type for the generateWeeklyIncidentSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeeklyIncidentSummaryInputSchema = z.object({
  incidentData: z.string().describe('JSON string of incident data from the last week.  Include reference, status, location, time, type, and severity.'),
});
export type GenerateWeeklyIncidentSummaryInput = z.infer<typeof GenerateWeeklyIncidentSummaryInputSchema>;

const GenerateWeeklyIncidentSummaryOutputSchema = z.object({
  summary: z.string().describe('A brief summary of notable incident changes from the last week.'),
});
export type GenerateWeeklyIncidentSummaryOutput = z.infer<typeof GenerateWeeklyIncidentSummaryOutputSchema>;

export async function generateWeeklyIncidentSummary(input: GenerateWeeklyIncidentSummaryInput): Promise<GenerateWeeklyIncidentSummaryOutput> {
  return generateWeeklyIncidentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyIncidentSummaryPrompt',
  input: {schema: GenerateWeeklyIncidentSummaryInputSchema},
  output: {schema: GenerateWeeklyIncidentSummaryOutputSchema},
  prompt: `You are an expert analyst summarizing incident data to identify key trends and changes.

  Based on the following incident data from the last week, generate a brief summary of notable changes and trends. Be concise and focus on high-impact information.

  Incident Data:
  {{incidentData}}
  `,
});

const generateWeeklyIncidentSummaryFlow = ai.defineFlow(
  {
    name: 'generateWeeklyIncidentSummaryFlow',
    inputSchema: GenerateWeeklyIncidentSummaryInputSchema,
    outputSchema: GenerateWeeklyIncidentSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
