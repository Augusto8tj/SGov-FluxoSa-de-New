"use client";

import { 
  BookOpen, 
  Clock, 
  ClipboardList,
  AlertTriangle,
  KeyRound,
  Lock,
  Navigation,
  ShieldCheck,
  PhoneCall,
  UserPlus
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function UbsHelpPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <BookOpen className="h-8 w-8" /> Manual de Operação da Unidade (UBS)
        </h2>
        <p className="text-muted-foreground italic">Guia de gestão local de transporte sanitário - Portal UBS v1.2.0 Stable</p>
      </div>

      <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="h-16 w-16 bg-rose-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
          <Clock className="h-8 w-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-rose-800 uppercase tracking-tighter text-lg">Janela de Agendamento Crítica</h4>
          <p className="text-sm text-rose-700 font-medium">
            O sistema aceita novos pedidos de transporte das <b>08:00 às 13:00</b> para o dia seguinte. Após este horário, o sistema bloqueia automaticamente para que a Secretaria possa planejar a logística da frota municipal.
          </p>
        </div>
        <Badge className="bg-rose-600 text-white border-none font-bold hidden md:block">REGRA DE OURO</Badge>
      </div>

      <h3 className="text-lg font-black uppercase tracking-tighter text-slate-400 mt-8 mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5" /> Protocolos Operacionais Diários
      </h3>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* SEÇÃO: CADASTRO DE CIDADÃOS */}
        <AccordionItem value="cadastro-base" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden border-emerald-100">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-emerald-500 p-3 rounded-xl text-white">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-800">Gestão de Cidadãos (Base Local)</p>
                <p className="text-sm text-muted-foreground">Como manter a base de dados da sua unidade em dia</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
              <p className="text-xs leading-relaxed font-medium">
                Antes de solicitar qualquer transporte, o paciente deve estar cadastrado em &quot;Meus Pacientes&quot;.
              </p>
              <ul className="text-[11px] list-disc pl-4 space-y-2 font-medium text-slate-600">
                <li><span className="font-black">CNS / Prontuário:</span> O número do Cartão Nacional de Saúde é a chave primária. Garanta que ele esteja correto para evitar duplicidades no município.</li>
                <li><span className="font-black">Comorbidades:</span> Informe condições como &quot;Hemodiálise&quot;, &quot;Oncologia&quot; ou &quot;Cadeirante&quot;. Isso ajuda a IA a priorizar a ambulância correta.</li>
                <li><span className="font-black">Privacidade:</span> O sistema oculta sobrenomes no Portal do Cidadão para segurança da LGPD.</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="embarque-preciso" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden border-primary/20">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <Navigation className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-800">Protocolo de Local de Embarque</p>
                <p className="text-sm text-muted-foreground">Definição precisa do ponto de encontro viário</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="p-4 bg-blue-50 rounded-xl border border-primary/10 space-y-3">
              <p className="text-xs leading-relaxed">
                Este campo é vital para o motorista. Não insira apenas &quot;UBS&quot;. Seja específico:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Certo ✅</p>
                  <p className="text-[11px]">&quot;UBS Central - Portaria do Lado B (Rampa)&quot;</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-rose-100">
                  <p className="text-[10px] font-black text-rose-600 uppercase mb-1">Errado ❌</p>
                  <p className="text-[11px]">&quot;Na frente do posto&quot;</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">Este dado aparece no GPS do motorista e no celular do paciente, evitando que a viatura fique circulando e perca o horário.</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="codigo-acesso" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden border-indigo-100">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-indigo-600 p-3 rounded-xl text-white">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <p className="font-black text-lg text-slate-800">Código de Acesso do Cidadão</p>
                <p className="text-sm text-muted-foreground">Transparência e segurança para o paciente</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-3">
              <p className="text-xs leading-relaxed">
                Após a Secretaria aprovar o pedido (status <b>Confirmado</b>), um código de 6 dígitos é gerado.
              </p>
              <ul className="text-[11px] list-disc pl-4 space-y-1 font-medium text-indigo-800">
                <li>O código deve ser entregue ao paciente (ou anotado na guia de agendamento).</li>
                <li>O paciente acessa o <b>Portal do Cidadão</b> para ver qual viatura e motorista o buscarão.</li>
                <li>Se o pedido for cancelado ou negado, o código deixará de funcionar automaticamente.</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="privacidade-seguranca" className="border rounded-2xl bg-card px-4 shadow-sm overflow-hidden border-amber-100">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Sigilo Rio Claro (LGPD)</p>
                <p className="text-sm text-muted-foreground">Proteção de dados sensíveis</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 space-y-4 pb-6 pt-2">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <p className="text-xs leading-relaxed text-amber-800">
                O Portal do Cidadão é público, por isso adotamos o <b>Protocolo de Pseudonimização</b>. Nenhuma doença ou prontuário clínico é exibido publicamente. O portal mostra apenas a logística necessária para o embarque seguro do morador.
              </p>
              <Separator className="my-3 bg-amber-200" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                <p className="text-[10px] font-black uppercase text-amber-700 tracking-widest">Protocolo de Privacidade Ativo</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="p-6 bg-slate-100 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 rounded-[2rem] bg-white shadow-lg flex items-center justify-center shrink-0">
          <PhoneCall className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-lg text-slate-800 uppercase tracking-tighter">Dúvida sobre Agendamento?</h4>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
            Contate a Central de Regulação Municipal via rádio ou telefone (19) 3526-0000 para autorizações excepcionais fora da janela das 13h.
          </p>
        </div>
      </div>

      <Card className="border-dashed border-2 bg-muted/5 mt-10">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
          <AlertTriangle className="h-10 w-10 text-rose-500 opacity-20" />
          <div>
            <p className="font-bold text-sm">Controle de Auditoria</p>
            <p className="text-xs text-muted-foreground">Toda solicitação feita neste portal é vinculada ao ID do Gerente responsável da UBS.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
