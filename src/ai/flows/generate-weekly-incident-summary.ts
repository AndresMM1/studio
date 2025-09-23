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
  incidentData: z.string().describe('Cadena JSON de datos de incidentes de la última semana. Incluir servicio, prioridad, descripción, ambiente y hora de inicio.'),
});
export type GenerateWeeklyIncidentSummaryInput = z.infer<typeof GenerateWeeklyIncidentSummaryInputSchema>;

const GenerateWeeklyIncidentSummaryOutputSchema = z.object({
  summary: z.string().describe('Un breve resumen de los cambios y tendencias notables en los incidentes de la última semana.'),
});
export type GenerateWeeklyIncidentSummaryOutput = z.infer<typeof GenerateWeeklyIncidentSummaryOutputSchema>;

export async function generateWeeklyIncidentSummary(input: GenerateWeeklyIncidentSummaryInput): Promise<GenerateWeeklyIncidentSummaryOutput> {
  return generateWeeklyIncidentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyIncidentSummaryPrompt',
  input: {schema: GenerateWeeklyIncidentSummaryInputSchema},
  output: {schema: GenerateWeeklyIncidentSummaryOutputSchema},
  prompt: `Eres un analista experto que resume los datos de incidentes para identificar tendencias y cambios clave.

  Basado en los siguientes datos de incidentes de la última semana, genera un breve resumen de los cambios y tendencias notables. Sé conciso y céntrate en la información de alto impacto.

  Datos del Incidente:
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
