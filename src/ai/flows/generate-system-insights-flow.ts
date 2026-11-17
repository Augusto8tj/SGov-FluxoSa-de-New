'use server';
/**
 * @fileOverview Fluxo Genkit para briefings estratégicos da secretaria.
 */

import { aiService } from '@/services/ai-service';

export type SystemInsightsOutput = {
  briefing: string;
  priorityAction: string;
  alertLevel: 'normal' | 'warning' | 'critical';
};

export async function generateSystemInsights(input: any): Promise<SystemInsightsOutput> {
  const prompt = `Resumo executivo para a Secretaria de Saúde de Rio Claro:
- Pedidos: ${input.pendingRequests}
- Veículos: ${input.activeVehicles}/${input.totalVehicles}
- Críticos: ${input.criticalPatientsCount}`;

  const result = await aiService.generate<SystemInsightsOutput>(
    prompt,
    "{ briefing: string, priorityAction: string, alertLevel: 'normal'|'warning'|'critical' }"
  );

  if (result.output) return result.output;

  return {
    briefing: "Sistema operando em modo de contingência local.",
    priorityAction: "Manter monitoramento de rádio.",
    alertLevel: input.criticalPatientsCount > 0 ? 'warning' : 'normal'
  };
}
