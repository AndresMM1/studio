import { config } from 'dotenv';
config();

import '@/ai/flows/generate-weekly-incident-summary.ts';
import '@/ai/flows/generate-monthly-incident-summary.ts';