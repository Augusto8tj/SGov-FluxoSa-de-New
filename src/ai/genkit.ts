import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { SYSTEM_DEFAULT_MODEL } from './constants';

/**
 * @fileOverview Configuração central do Genkit.
 * O modelo padrão do sistema foi migrado para Llama 3.1 8B para
 * garantir o máximo de agilidade no processamento logístico.
 */

export { SYSTEM_DEFAULT_MODEL };

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
  // Mantemos o plugin para compatibilidade de tipos, 
  // mas as chamadas reais agora são centralizadas no aiService via OpenRouter.
});
