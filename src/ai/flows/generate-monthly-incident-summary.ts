'use server';
/**
 * @fileOverview An AI agent for generating monthly incident summaries.
 *
 * - generateMonthlyIncidentSummary - A function that generates a summary of monthly incident changes.
 * - GenerateMonthlyIncidentSummaryInput - The input type for the generateMonthlyIncidentSummary function.
 * - GenerateMonthlyIncidentSummaryOutput - The return type for the generateMonthlyIncidentSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMonthlyIncidentSummaryInputSchema = z.object({
  month: z.string().describe('The month for which to generate the summary (e.g., YYYY-MM).'),
});
export type GenerateMonthlyIncidentSummaryInput = z.infer<typeof GenerateMonthlyIncidentSummaryInputSchema>;

const GenerateMonthlyIncidentSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of notable incident changes for the specified month.'),
});
export type GenerateMonthlyIncidentSummaryOutput = z.infer<typeof GenerateMonthlyIncidentSummaryOutputSchema>;

export async function generateMonthlyIncidentSummary(input: GenerateMonthlyIncidentSummaryInput): Promise<GenerateMonthlyIncidentSummaryOutput> {
  return generateMonthlyIncidentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMonthlyIncidentSummaryPrompt',
  input: {schema: GenerateMonthlyIncidentSummaryInputSchema},
  output: {schema: GenerateMonthlyIncidentSummaryOutputSchema},
  prompt: `You are an incident analyst who specializes in summarizing monthly incident trends.

  Generate a brief summary of notable incident changes for the month of {{month}}. Focus on key trends and significant changes in incident types, severity, and resolution times.
  Do not include any data tables in the summary.
  The summary should be no more than 200 words.
  `,
});

const generateMonthlyIncidentSummaryFlow = ai.defineFlow(
  {
    name: 'generateMonthlyIncidentSummaryFlow',
    inputSchema: GenerateMonthlyIncidentSummaryInputSchema,
    outputSchema: GenerateMonthlyIncidentSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
