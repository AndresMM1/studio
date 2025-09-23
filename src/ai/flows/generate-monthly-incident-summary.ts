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
  month: z.string().describe('El mes para el cual generar el resumen (por ejemplo, AAAA-MM).'),
});
export type GenerateMonthlyIncidentSummaryInput = z.infer<typeof GenerateMonthlyIncidentSummaryInputSchema>;

const GenerateMonthlyIncidentSummaryOutputSchema = z.object({
  summary: z.string().describe('Un resumen de los cambios notables en los incidentes para el mes especificado.'),
});
export type GenerateMonthlyIncidentSummaryOutput = z.infer<typeof GenerateMonthlyIncidentSummaryOutputSchema>;

export async function generateMonthlyIncidentSummary(input: GenerateMonthlyIncidentSummaryInput): Promise<GenerateMonthlyIncidentSummaryOutput> {
  return generateMonthlyIncidentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMonthlyIncidentSummaryPrompt',
  input: {schema: GenerateMonthlyIncidentSummaryInputSchema},
  output: {schema: GenerateMonthlyIncidentSummaryOutputSchema},
  prompt: `Eres un analista de incidentes que se especializa en resumir las tendencias mensuales de incidentes.

  Genera un breve resumen de los cambios notables en los incidentes para el mes de {{month}}. Céntrate en las tendencias clave y los cambios significativos en los tipos de incidentes, la gravedad y los tiempos de resolución.
  No incluyas ninguna tabla de datos en el resumen.
  El resumen no debe tener más de 200 palabras.
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
