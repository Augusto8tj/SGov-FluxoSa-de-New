'use server';

import { ai } from "@/ai/ai-instance";
import { z } from 'genkit';
import { systemSettingsService } from "@/services/system-settings-service";

/**
 * @fileOverview Fluxos de diagnóstico para validação de infraestrutura de IA.
 */

export const checkAiConnection = ai.defineFlow(
  {
    name: 'checkAiConnection',
    inputSchema: z.void(),
    outputSchema: z.object({
      status: z.enum(['online', 'offline']),
      provider: z.string(),
      models: z.array(z.string()).optional(),
      error: z.string().optional()
    }),
  },
  async () => {
    const settings = await systemSettingsService.getSettings();
    
    if (settings.aiProvider === 'OLLAMA') {
      try {
        const baseUrl = settings.ollamaBaseUrl?.endsWith('/') ? settings.ollamaBaseUrl.slice(0, -1) : settings.ollamaBaseUrl;
        const response = await fetch(`${baseUrl}/api/tags`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });
        if (!response.ok) throw new Error("Servidor Ollama inacessível.");
        
        const data = await response.json();
        const modelNames = data.models?.map((m: any) => String(m.name)) || [];
        
        return {
          status: 'online' as const,
          provider: 'OLLAMA (Local)',
          models: modelNames
        };
      } catch (e: any) {
        console.error("Check AI Connection Error (OLLAMA):", e);
        return { 
          status: 'offline' as const, 
          provider: 'OLLAMA', 
          error: String(e.message) 
        };
      }
    } else {
      return {
        status: 'online' as const,
        provider: `${settings.aiProvider} (Cloud)`,
        models: [settings.aiModelId]
      };
    }
  }
);
