"use client";

import { 
  BookOpen, 
  ShieldCheck, 
  ClipboardList,
  Heart,
  Fingerprint,
  HelpCircle,
  BrainCircuit,
  Zap,
  Activity,
  Rocket,
  ShieldAlert,
  Lock,
  Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

export default function AdminHelpPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <BookOpen className="h-8 w-8" /> Manual de Gestão Estratégica
        </h2>
        <p className="text-muted-foreground italic">Guia para o Secretário de Governo e Gestores de Ordem Pública & bull; PMRC v1.2.0 Stable</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Perfil Secretaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">Gestão total de frota, usuários e aprovações de transporte sanitário.</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2">
              <Fingerprint className="h-4 w-4" /> Auditoria v1.2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">Rastreabilidade completa de ações e logs imutáveis de segurança.</p>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase text-rose-600 tracking-widest flex items-center gap-2">
              <Heart className="h-4 w-4" /> Portal Cidadão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">Canal público de consulta para pacientes com privacidade garantida.</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-black uppercase tracking-tighter text-slate-400 mt-8 mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5" /> Protocolos do Gabinete
      </h3>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="protocolo-beta" className="border-2 border-primary/20 rounded-2xl bg-primary/[0.02] px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary p-3 rounded-xl text-white shadow-lg">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-primary">Missão: Teste Beta Operacional</p>
                <p className="text-sm text-primary/70 font-medium">Siga estes passos para iniciar a operação real em Rio Claro</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b pb-1">1. Configuração de Base (Firestore)</p>
                <p className="text-xs leading-relaxed">Acesse o menu <b>Configurações</b> e cadastre primeiro as <b>Unidades (UBS)</b>. Sem elas, os pedidos não podem ser vinculados às localidades corretas do município.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b pb-1">2. Frota e Equipe</p>
                <p className="text-xs leading-relaxed">Insira os veículos e motoristas oficiais. O odômetro inicial é crucial para o sistema monitorar o desgaste e avisar sobre manutenções preventivas via IA.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b pb-1">3. Ativação das UBS</p>
                <p className="text-xs leading-relaxed">Instrua os Gerentes a cadastrarem seus pacientes (<b>CNS é obrigatório</b>) para que os códigos de acesso do Portal do Cidadão funcionem corretamente.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-primary/10 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b pb-1">4. Otimização e Manifesto</p>
                <p className="text-xs leading-relaxed">Ao final da janela de agendamento (13:00h), utilize o <b>Otimizador de Rotas</b> para processar a malha viária e oficializar os manifestos no App do motorista.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="logistica-hibrida" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden border-primary/20">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-800">Motor Logístico Híbrido (Nemotron Nano)</p>
                <p className="text-sm text-muted-foreground">Entenda como a IA de ultra velocidade e o Processador Local garantem a operação 24/7</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
              <p className="text-sm leading-relaxed">
                Para evitar gargalos, o sistema utiliza dois motores de processamento:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit className="h-4 w-4 text-primary" />
                    <p className="text-[10px] font-black text-primary uppercase">Nemotron Nano 9B V2</p>
                  </div>
                  <p className="text-xs text-slate-600">O novo motor Nano processa o agrupamento avançado por distritos em milissegundos. Este processo tem um <b>limite de 25 segundos</b> de espera de rede antes do fallback.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Processador de Contingência</p>
                  </div>
                  <p className="text-xs text-slate-600">Caso a rede oscile ou a IA demore mais que o esperado, o motor local assume instantaneamente o cálculo para devolver as rotas sem atraso.</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="documentos-oficiais" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                <Printer className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-800">Gestão de Documentos Oficiais</p>
                <p className="text-sm text-muted-foreground">Emissão de guias de diárias e combustível (Padrão A4)</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="font-bold text-sm text-indigo-700">Fluxo de Aprovação Financeira:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                    <p className="text-xs">O motorista solicita a diária no App durante a missão.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                    <p className="text-xs">O Secretário aprova o valor no menu <b>Motoristas &gt; Financeiro</b>.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                    <p className="text-xs">A guia A4 é liberada automaticamente no menu <b>Documentos</b> para impressão e assinatura.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-700 uppercase mb-2 flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Segurança Jurídica</p>
                <p className="text-xs leading-relaxed text-indigo-800 italic">
                  &quot;Cada documento possui um HASH único e identificador digital. O rodapé do documento deve ser conferido pela controladoria para evitar fraudes em guias físicas.&quot;
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="emergencia-sos" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden border-rose-100">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-800">Protocolo SOS & Emergências</p>
                <p className="text-sm text-muted-foreground">Como responder a alertas críticos de campo</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 space-y-3">
              <p className="text-xs leading-relaxed">
                Sempre que um motorista aciona o botão <b>SOS</b> no App, um alerta visual vermelho aparece no dashboard do Secretário e na aba de <b>Relatórios de Campo</b>.
              </p>
              <ul className="text-[11px] list-disc pl-4 space-y-1 font-medium text-rose-800">
                <li>Prioridade 0: Verifique o conteúdo do SOS imediatamente.</li>
                <li>Acione o rádio municipal ou telefone cadastrado no motorista.</li>
                <li>Utilize a IA (Briefing de Relatórios) para consolidar múltiplas falhas mecânicas relatadas no dia.</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="p-8 bg-slate-100 rounded-[3rem] border border-dashed border-slate-300 flex flex-col md:flex-row items-center gap-8 mx-1">
        <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center shrink-0">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h4 className="font-black text-xl text-slate-800 uppercase tracking-tighter">Segurança & RBAC PMRC</h4>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl font-medium">
            O sistema opera sob rígidas políticas de Controle de Acesso Baseado em Funções. Toda alteração em dados de pacientes ou frotas é auditada e vinculada ao IP e ID do usuário administrador.
          </p>
        </div>
        <Lock className="h-8 w-8 text-slate-300 hidden md:block" />
      </div>

      <Card className="border-dashed border-2 bg-muted/5 mt-10">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
          <HelpCircle className="h-10 w-10 text-muted-foreground opacity-30" />
          <div>
            <p className="font-bold">Suporte Técnico ao Gabinete</p>
            <p className="text-sm text-muted-foreground">Secretaria Municipal de Ordem Pública - Rio Claro, RJ.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
