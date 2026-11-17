'use server';
/**
 * @fileOverview Fluxo Genkit para resumo de demanda UBS.
 */

import { aiService } from '@/services/ai-service';

export type UbsDemandOutput = {
  summary: string;
  recommendation: string;
  priorityLevel: 'low' | 'medium' | 'high';
};

export async function summarizeUbsDemand(input: any): Promise<UbsDemandOutput> {
  const prompt = `Resumo estratégico para a ${input.ubsName}:
Pendentes: ${input.pendingRequests}, Casos Urgentes: ${input.urgentCases}`;

  const result = await aiService.generate<UbsDemandOutput>(
    prompt,
    "{ summary: string, recommendation: string, priorityLevel: string }"
  );

  if (result.output) return result.output;

  return {
    summary: `A unidade possui ${input.pendingRequests} pedidos pendentes.`,
    recommendation: "Acompanhe o status no portal da secretaria.",
    priorityLevel: 'medium'
  };
}
