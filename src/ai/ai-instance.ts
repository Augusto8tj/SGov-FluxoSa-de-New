
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview Instância central do Genkit configurada para suporte multi-plugin.
 * Genkit v1.x syntax.
 */

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
