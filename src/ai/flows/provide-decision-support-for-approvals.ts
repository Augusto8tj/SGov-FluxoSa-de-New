'use server';
/**
 * @fileOverview Fluxo Genkit para suporte à decisão clínica.
 */

import { aiService } from '@/services/ai-service';

export type ProvideDecisionSupportOutput = {
  recommendation: string;
  criticalFactors: string[];
  suggestedAction: 'approve' | 'deny' | 'escalate' | 'needs_more_info';
};

export async function provideDecisionSupportForApprovals(input: any): Promise<ProvideDecisionSupportOutput> {
  const prompt = `Analise a solicitação de transporte #${input.requestId} para ${input.patientMaskedName}.
Urgência: ${input.urgencyLevel}
Logística: ${input.availableVehiclesSummary}`;

  const result = await aiService.generate<ProvideDecisionSupportOutput>(
    prompt,
    "{ recommendation: string, criticalFactors: string[], suggestedAction: string }"
  );

  if (result.output) return result.output;

  return {
    recommendation: "Aguardando triagem técnica manual.",
    criticalFactors: ["Dados insuficientes para análise de IA"],
    suggestedAction: 'escalate'
  };
}
