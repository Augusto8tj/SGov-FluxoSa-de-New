"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Printer, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Página de Layout de Impressão (Modo A4).
 * Esta página é otimizada para window.print().
 * Atualizada para Next.js 15: props params e searchParams são Promises.
 */

function PrintContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "daily";
  const driver = searchParams.get("driver") || "Condutor Não Identificado";
  const value = searchParams.get("value") || "R$ 0,00";
  const date = searchParams.get("date") || new Date().toLocaleDateString();
  const id = searchParams.get("id") || "PROTO-2024-XXX";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-0 sm:p-10 flex flex-col items-center">
      {/* Botões de Ação (Escondidos na Impressão) */}
      <div className="fixed top-6 right-6 flex gap-3 print:hidden z-50">
        <Button variant="outline" className="rounded-full shadow-lg bg-white" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <Button className="rounded-full shadow-lg" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Imprimir Documento
        </Button>
      </div>

      {/* Papel A4 Simulado */}
      <div id="printable-area" className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none p-[20mm] flex flex-col">
        
        {/* Cabeçalho Oficial */}
        <div className="flex items-center justify-between border-b-2 border-primary pb-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary flex items-center justify-center rounded-2xl text-white font-black text-2xl">RC</div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">Prefeitura de Rio Claro - RJ</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secretaria Municipal de Ordem Pública</p>
              <p className="text-[10px] text-slate-400 font-medium">Gestão de Transporte Sanitário & Logística</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">Documento ID</p>
            <p className="text-sm font-black text-primary">{id}</p>
          </div>
        </div>

        {/* Título do Documento */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black uppercase border-y py-4 border-slate-100 text-slate-800">
            {type === 'daily' ? 'Requisição de Auxílio Diária' : 'Ordem de Abastecimento de Combustível'}
          </h2>
        </div>

        {/* Corpo do Documento */}
        <div className="flex-1 space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiário / Requerente</p>
              <p className="text-lg font-bold text-slate-800 border-b pb-1 border-slate-100">{driver}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Solicitado</p>
                <p className="text-lg font-black text-primary border-b pb-1 border-slate-100">{value}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Referência</p>
                <p className="text-lg font-bold text-slate-800 border-b pb-1 border-slate-100">{date}</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Justificativa Operacional</h3>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                {type === 'daily' 
                  ? "Auxílio destinado à cobertura de despesas de alimentação e estadia durante missão intermunicipal de transporte sanitário de pacientes críticos, conforme escala de plantão da Secretaria de Ordem Pública."
                  : "Autorização para abastecimento em posto conveniado (Posto Central PMRC) para a viatura oficial designada, visando a continuidade da malha viária de transporte de pacientes da rede UBS."}
              </p>
            </div>
          </div>

          {/* Área de Assinaturas */}
          <div className="mt-20 grid grid-cols-2 gap-20 pt-20">
            <div className="text-center">
              <div className="border-t border-slate-400 pt-2">
                <p className="text-sm font-bold text-slate-800">{driver}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assinatura do Condutor</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-400 pt-2">
                <p className="text-sm font-bold text-slate-800">Gabinete - Ordem Pública</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Autoridade Competente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé de Segurança */}
        <div className="mt-auto pt-10 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Documento validado eletronicamente &bull; PMRC SGov v1.2.0
            </div>
          </div>
          <div className="h-12 w-12 bg-slate-100 rounded flex items-center justify-center opacity-50">
            <p className="text-[8px] font-bold text-center leading-none uppercase">QR CODE<br/>VALIDADOR</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold uppercase tracking-widest">Carregando Modelo Oficial...</div>}>
      <PrintContent />
    </Suspense>
  );
}
