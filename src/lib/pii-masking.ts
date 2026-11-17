
/**
 * @fileOverview Utilitário de segurança para conformidade com LGPD.
 * Mascara dados sensíveis antes do envio para provedores de LLM.
 */

export function maskPII(text: string): string {
  if (!text) return text;

  // Regex para CPF (000.000.000-00 ou 00000000000)
  const cpfRegex = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g;
  
  // Regex para Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  // Regex para RG (Simples)
  const rgRegex = /\d{1,2}\.?\d{3}\.?\d{3}-?[a-zA-Z0-9]/g;

  return text
    .replace(cpfRegex, "[CPF MASCARADO]")
    .replace(emailRegex, "[EMAIL MASCARADO]")
    .replace(rgRegex, "[RG MASCARADO]");
}
