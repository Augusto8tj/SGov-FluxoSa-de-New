"use client";

import { 
  ShieldAlert, 
  PhoneCall, 
  Stethoscope, 
  AlertTriangle, 
  FileText,
  HeartPulse,
  Wind,
  Droplets,
  Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

export default function GuidelinesPage() {
  return (
    <div className="space-y-6 pb-10">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">Central de Protocolos</h2>
        <p className="text-xs text-slate-500">Manual de Conduta e Operação - PMRC</p>
      </div>

      <Card className="bg-rose-600 text-white border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <PhoneCall className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Emergência Logística</p>
              <p className="text-xl font-black">(19) 3526-0000</p>
              <p className="text-[9px] opacity-70">Disponível 24h para suporte ao condutor</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Info className="h-4 w-4" /> Procedimentos Operacionais
        </h3>
        
        <Accordion type="single" collapsible className="w-full space-y-3">
          <AccordionItem value="item-1" className="border rounded-xl bg-white px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Emergência Clínica</p>
                  <p className="text-[10px] text-slate-500">PCR, Convulsão e Mal-estar</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 space-y-4 pt-2">
              <div className="space-y-2">
                <p className="font-bold text-xs flex items-center gap-1"><HeartPulse className="h-3 w-3" /> Suspeita de PCR:</p>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  <li>Estacione o veículo imediatamente em local seguro.</li>
                  <li>Acione o SAMU (192) informando a localização exata.</li>
                  <li>Inicie compressões torácicas se houver treinamento.</li>
                  <li>Mantenha a central de logística informada via rádio/telefone.</li>
                </ul>
              </div>
              <div className="space-y-2 border-t pt-2">
                <p className="font-bold text-xs flex items-center gap-1"><Wind className="h-3 w-3" /> Suporte de Oxigênio:</p>
                <p className="text-xs">Verifique o manômetro antes de sair. Mantenha o fluxo conforme prescrição médica fixada no prontuário do paciente.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border rounded-xl bg-white px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Transporte de Macas</p>
                  <p className="text-[10px] text-slate-500">Fixação e Segurança do Paciente</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 space-y-3 pt-2">
              <p className="text-xs font-semibold">Normas Obrigatórias:</p>
              <ul className="text-xs list-decimal pl-4 space-y-2">
                <li><span className="font-bold">Trava de Segurança:</span> Nunca inicie o trajeto sem conferir o clique duplo de travamento da maca no piso da viatura.</li>
                <li><span className="font-bold">Cintos:</span> Uso obrigatório dos 3 pontos (tórax e pernas) para o paciente.</li>
                <li><span className="font-bold">Posicionamento:</span> Cabeceira elevada a 30&deg; para pacientes com histórico respiratório, salvo indicação contrária.</li>
                <li><span className="font-bold">Rampa:</span> Utilize sempre o auxílio da trava de inclinação ao operar a rampa hidráulica ou manual.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border rounded-xl bg-white px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Biossegurança</p>
                  <p className="text-[10px] text-slate-500">Higiene e Controle de Infecção</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 space-y-3 pt-2">
              <p className="text-xs italic">O transporte sanitário municipal exige rigorosa limpeza para evitar contaminação cruzada.</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-50 rounded border text-[10px]">
                  <p className="font-bold mb-1">Pós-Cada Viagem:</p>
                  <p>Álcool 70% nas superfícies de toque e maçanetas.</p>
                </div>
                <div className="p-2 bg-slate-50 rounded border text-[10px]">
                  <p className="font-bold mb-1">Final do Turno:</p>
                  <p>Lavagem completa do compartimento com quaternário de amônia.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border rounded-xl bg-white px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Incidentes e Falhas</p>
                  <p className="text-[10px] text-slate-500">Pane Mecânica ou Colisão</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 space-y-3 pt-2 text-xs">
              <p>1. Sinalize o local com triângulo a 30 metros.</p>
              <p>2. Se houver pacientes críticos, priorize a transferência imediata para outra viatura via central.</p>
              <p>3. Não abandone o veículo com equipamentos clínicos desprotegidos.</p>
              <p>4. Em caso de colisão, aguarde a perícia municipal para o laudo de seguro.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border rounded-xl bg-white px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Documentação</p>
                  <p className="text-[10px] text-slate-500">Manifesto e Assinaturas</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 space-y-3 pt-2 text-xs">
              <p className="font-bold text-primary">Digitalização Obrigatória:</p>
              <p>Todas as paradas devem ser finalizadas no App para registro de geolocalização e horário.</p>
              <p className="border-l-2 border-primary pl-2 italic">&quot;O não registro no sistema impede a auditoria de produtividade e manutenção do auxílio-condutor.&quot;</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="p-4 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase">Manual Vigente</p>
        <p className="text-xs text-slate-600 font-medium mt-1">Revisão 04/2024 - Secretaria de Ordem Pública</p>
      </div>
    </div>
  );
}
