'use server';
/**
 * @fileOverview Fluxo Genkit para briefings de motoristas.
 * Utiliza o modelo padrão do sistema via AI Service.
 */

import { aiService } from '@/services/ai-service';

export type DriverBriefingOutput = {
  summary: string;
  criticalAlerts: string[];
  protocolReminder: string;
};

export async function generateDriverBriefing(input: any): Promise<DriverBriefingOutput> {
  const prompt = `Gere um briefing de segurança para o condutor ${input.driverName} do veículo ${input.vehicleType}.
Passageiros: ${JSON.stringify(input.passengers)}
Rota: ${input.routeDetails}`;

  const result = await aiService.generate<DriverBriefingOutput>(
    prompt,
    "{ summary: string, criticalAlerts: string[], protocolReminder: string }"
  );

  if (result.output) return result.output;

  // Fallback
  return {
    summary: `Olá ${input.driverName}, você tem ${input.passengers.length} passageiros na rota.`,
    criticalAlerts: ["Verifique equipamentos de segurança antes de partir."],
    protocolReminder: "Mantenha o rádio na frequência municipal."
  };
}
