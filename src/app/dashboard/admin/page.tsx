"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ShieldCheck, 
  BrainCircuit, 
  CheckCircle, 
  Zap,
  Filter,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowRight,
  Route,
  Loader2 as LoaderIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { provideDecisionSupportForApprovals, ProvideDecisionSupportOutput } from "@/ai/flows/provide-decision-support-for-approvals";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/dashboard/stats-card";
import { requestService } from "@/services/request-service";
import { TransportRequest } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminPage() {
  const [loadingData, setLoadingData] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [analysis, setAnalysis] = useState<Record<string, ProvideDecisionSupportOutput>>({});
  const [loadingAi, setLoadingAi] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const { toast } = useToast();

  const loadPendingRequests = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setLoadingData(true);
    try {
      const all = await requestService.getRequests(forceRefresh);
      setRequests(all);
    } catch (error) {
      console.error("Erro ao sincronizar pedidos no painel de comando:", error);
      toast({ title: "Erro", description: "Falha ao sincronizar pedidos com a central.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  const stats = useMemo(() => {
    const pending = requests.filter(r => r.status === 'PENDING').length;
    const approved = requests.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED').length;
    const denied = requests.filter(r => r.status === 'DENIED').length;
    const critical = requests.filter(r => r.urgencyLevel === 'critical' && r.status === 'PENDING').length;
    
    const totalProcessed = approved + denied;
    const rate = totalProcessed > 0 
      ? `${Math.round((approved / totalProcessed) * 100)}%` 
      : "---";

    return { pending, rate, critical };
  }, [requests]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleAiAnalysis = async (req: TransportRequest) => {
    if (!aiEnabled) return;
    
    setLoadingAi(req.id);
    try {
      const maskedName = req.patientName.split(' ')[0];

      const result = await provideDecisionSupportForApprovals({
        requestId: req.id,
        patientMaskedName: maskedName,
        patientDetails: req.aiRecommendation || "Condição padrão de transporte sanitário municipal.",
        pickupLocation: req.pickupLocation,
        destinationLocation: req.destinationLocation,
        urgencyLevel: req.urgencyLevel,
        availableVehiclesSummary: "Frota operacional disponível com suporte técnico."
      });
      
      setAnalysis(prev => ({ ...prev, [req.id]: result }));
      
      const newExpanded = new Set(expandedIds);
      newExpanded.add(req.id);
      setExpandedIds(newExpanded);

      toast({ title: "Análise IA Concluída", description: `Parecer gerado para o pedido de ${maskedName}.` });
    } catch (error) {
      console.error("Erro ao processar análise IA:", error);
      toast({ title: "Erro na IA", description: "Não foi possível processar a análise agora.", variant: "destructive" });
    } finally {
      setLoadingAi(null);
    }
  };

  const handleAction = async (id: string, action: 'APPROVED' | 'DENIED') => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    try {
      const updateData: Partial<TransportRequest> = { 
        status: action,
        updatedAt: new Date().toISOString() 
      };

      if (action === 'APPROVED') {
        updateData.manifestId = `MF-${id.split('-').pop()}`;
        updateData.vehicleId = "Viatura Local (Simulada)";
        updateData.vehiclePlate = "PMRC-000";
        updateData.driverId = "Plantão Logística";
        updateData.assignedAt = new Date().toISOString();
      }

      await requestService.updateRequest(id, updateData);
      
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updateData } : r));
      
      if (action === 'APPROVED') {
        toast({ title: "Solicitação Aprovada", description: `O pedido de ${req.patientName} foi encaminhado para a logística.` });
      } else {
        toast({ title: "Solicitação Negada", description: `O pedido de ${req.patientName} foi arquivado.`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro ao atualizar status da solicitação:", error);
      toast({ title: "Erro na Ação", description: "Falha ao atualizar status no sistema.", variant: "destructive" });
    }
  };

  const filteredRequests = useMemo(() => requests.filter(req => {
    const isPending = req.status === 'PENDING';
    if (filterUrgency === 'all') return isPending;
    return isPending && req.urgencyLevel === filterUrgency;
  }), [requests, filterUrgency]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" /> Painel de Comando
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Central de aprovação estratégica e triagem inteligente.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="h-10 sm:h-11 rounded-xl gap-2 flex-1 sm:flex-none" onClick={() => loadPendingRequests(true)}>
            <RefreshCw className={cn("h-4 w-4", loadingData && "animate-spin")} /> <span className="hidden xs:inline">Atualizar</span>
          </Button>
          <div className="flex items-center space-x-3 sm:space-x-4 bg-white dark:bg-slate-900 border p-2 sm:p-3 rounded-xl shadow-sm flex-1 sm:flex-none justify-between sm:justify-start">
            <div className="flex items-center space-x-2">
              <BrainCircuit className={aiEnabled ? "text-primary animate-pulse h-4 w-4 sm:h-5 sm:w-5" : "text-muted-foreground h-4 w-4 sm:h-5 sm:w-5"} />
              <div className="grid gap-0">
                <Label htmlFor="ai-toggle" className="text-[10px] sm:text-sm font-semibold leading-none">IA Ativa</Label>
                <p className="text-[8px] text-muted-foreground uppercase font-black tracking-tighter hidden xs:block">Nemotron Nano 9B V2</p>
              </div>
            </div>
            <Switch 
              id="ai-toggle" 
              checked={aiEnabled} 
              onCheckedChange={setAiEnabled}
              className="scale-90"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <StatsCard title="Pendentes" value={stats.pending} icon={Zap} description="Aguardando Triagem" />
        <StatsCard title="Taxa Aprovação" value={stats.rate} icon={CheckCircle} description="Decisões Reais" />
        <StatsCard title="Motor IA" value="Nemotron Nano" icon={BrainCircuit} description="Padrão Sistema" />
        <StatsCard title="Alertas" value={stats.critical} icon={AlertTriangle} description="Casos Críticos" />
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card rounded-2xl sm:rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 p-4 sm:p-6">
          <div>
            <CardTitle className="text-base sm:text-lg">Solicitações Aguardando Decisão</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">Triagem técnica para a malha viária municipal (Exibindo {filteredRequests.length} pendências).</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={filterUrgency !== 'all' ? 'default' : 'ghost'} size="icon" className="h-8 w-8 rounded-full">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filtrar Urgência</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filterUrgency} onValueChange={setFilterUrgency}>
                <DropdownMenuRadioItem value="all" className="text-xs font-bold">Todas as Pendências</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="critical" className="text-xs font-bold text-rose-600">Somente Críticas</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="high" className="text-xs font-bold text-orange-600">Prioridade Alta</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="medium" className="text-xs font-bold text-primary">Prioridade Média</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="low" className="text-xs font-bold text-slate-500">Prioridade Baixa</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-0">
          {loadingData ? (
            <div className="py-20 text-center space-y-3">
              <LoaderIcon className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sincronizando com as UBS...</p>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="font-bold h-10 py-0 pl-6">Paciente / Origem</TableHead>
                    <TableHead className="font-bold h-10 py-0 hidden sm:table-cell">Prioridade</TableHead>
                    <TableHead className="font-bold h-10 py-0 hidden md:table-cell">Suporte IA</TableHead>
                    <TableHead className="text-right font-bold h-10 py-0 pr-6">Decisão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                      <React.Fragment key={req.id}>
                        <TableRow 
                          className={cn(
                            "transition-colors group",
                            expandedIds.has(req.id) ? "bg-primary/[0.02] border-b-0" : "hover:bg-muted/5 border-b"
                          )}
                        >
                          <TableCell className="py-4 pl-6">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-800">{req.patientName}</span>
                                <Badge className="sm:hidden text-[8px] h-auto uppercase font-black px-1.5 leading-snug" variant={req.urgencyLevel === 'critical' ? 'destructive' : 'default'}>
                                  {req.urgencyLevel}
                                </Badge>
                              </div>
                              <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-black mt-0.5">
                                {req.ubsId} &bull; {req.pickupLocation}
                              </span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="hidden sm:table-cell">
                            <Badge 
                              variant={req.urgencyLevel === 'critical' ? 'destructive' : req.urgencyLevel === 'high' ? 'destructive' : 'default'} 
                              className={cn(
                                "text-[10px] font-black uppercase px-3 h-auto leading-snug",
                                req.urgencyLevel === 'critical' && req.status === 'PENDING' && "animate-pulse"
                              )}
                            >
                              {req.urgencyLevel.toUpperCase()}
                            </Badge>
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            {aiEnabled ? (
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant={analysis[req.id] ? "secondary" : "outline"} 
                                  size="sm" 
                                  className={cn(
                                    "h-8 gap-2 border-primary/20 text-[9px] font-black uppercase rounded-lg shadow-sm transition-all",
                                    analysis[req.id] && "bg-primary/10 text-primary border-primary/30"
                                  )}
                                  onClick={() => handleAiAnalysis(req)}
                                  disabled={loadingAi === req.id || req.status !== 'PENDING'}
                                >
                                  {loadingAi === req.id ? (
                                    <LoaderIcon className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <BrainCircuit className={cn("h-3.5 w-3.5", analysis[req.id] ? "text-primary" : "text-muted-foreground")} />
                                  )}
                                  {analysis[req.id] ? "RE-ANALISAR" : "ANALISAR IA"}
                                </Button>
                                {analysis[req.id] && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 text-[8px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                                    onClick={() => toggleExpand(req.id)}
                                  >
                                    {expandedIds.has(req.id) ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                    {expandedIds.has(req.id) ? "RECOLHER" : "DETALHES"}
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[9px] text-muted-foreground italic font-bold">IA DESATIVADA</span>
                            )}
                          </TableCell>

                          <TableCell className="text-right pr-6">
                            {req.status === 'PENDING' ? (
                              <div className="flex justify-end gap-3 sm:gap-4">
                                <Button 
                                  size="icon" 
                                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100 transition-all active:scale-90" 
                                  onClick={() => handleAction(req.id, 'DENIED')}
                                  title="Negar Solicitação"
                                >
                                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100 transition-all active:scale-90" 
                                  onClick={() => handleAction(req.id, 'APPROVED')}
                                  title="Aprovar Solicitação"
                                >
                                  <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                                </Button>
                              </div>
                            ) : req.status === 'APPROVED' ? (
                              <div className="flex justify-end items-center gap-3">
                                <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px] uppercase h-9 px-3 flex items-center">
                                  APROVADO
                                </Badge>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-10 rounded-xl gap-2 border-primary/20 text-primary font-black text-[10px] uppercase shadow-sm bg-white hover:bg-primary/5 transition-all"
                                  asChild
                                >
                                  <Link href="/dashboard/manifests">
                                    <Route className="h-4 w-4" /> VER MANIFESTO
                                  </Link>
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 font-black text-[10px] uppercase h-9 px-3 flex items-center">
                                  NEGADO
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>

                        {expandedIds.has(req.id) && analysis[req.id] && (
                          <TableRow className="bg-primary/[0.02] border-b-2 border-primary/10">
                            <TableCell colSpan={4} className="p-0">
                              <div className="p-4 sm:p-6 animate-in slide-in-from-top-2 duration-300">
                                <div className="max-w-6xl mx-auto bg-white rounded-[2rem] border border-primary/10 shadow-xl overflow-hidden">
                                  <div className="p-5 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-12">
                                    <div className="flex-1 space-y-6">
                                      <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0 mt-1">
                                          <BrainCircuit className="h-7 w-7" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                          <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] leading-snug">Parecer Nemotron Nano</h4>
                                          <Badge className={cn(
                                            "text-[10px] font-black uppercase py-1.5 px-3 border-none h-auto whitespace-normal text-left leading-snug",
                                            analysis[req.id]?.suggestedAction === 'approve' ? 'bg-emerald-100 text-emerald-700' :
                                            analysis[req.id]?.suggestedAction === 'deny' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                          )}>
                                            Ação Sugerida: {analysis[req.id]?.suggestedAction.replace('_', ' ')}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      <div className="bg-primary/[0.03] p-6 rounded-[2rem] border border-primary/5 relative mt-8">
                                        <div className="absolute top-0 left-8 -translate-y-1/2 bg-white px-3 text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap">Recomendação Estratégica</div>
                                        <p className="text-sm font-medium text-slate-600 leading-snug italic whitespace-normal">
                                          &quot;{analysis[req.id]?.recommendation}&quot;
                                        </p>
                                      </div>
                                    </div>

                                    <div className="w-full md:w-[350px] space-y-4">
                                      <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 px-1">
                                        <Activity className="h-4 w-4 text-primary" /> Variáveis de Escopo Analisadas
                                      </p>
                                      <div className="grid grid-cols-1 gap-2">
                                        {analysis[req.id]?.criticalFactors.map((factor, idx) => (
                                          <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 font-bold hover:bg-white hover:border-primary/20 transition-all group">
                                            <div className="size-2.5 rounded-full bg-primary/30 group-hover:scale-125 group-hover:bg-primary transition-all shrink-0" />
                                            <span className="whitespace-normal leading-snug">{factor}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-slate-50 px-8 py-3.5 flex items-center justify-between border-t">
                                    <div className="flex items-center gap-2">
                                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proteção de Dados & bull; Nemotron Nano 9B V2</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(req.id)} className="text-[10px] font-black text-primary uppercase">Fechar Painel</Button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic text-sm">
                        {filterUrgency !== 'all' 
                          ? `Nenhuma solicitação de urgência "${filterUrgency.toUpperCase()}" encontrada.`
                          : "Nenhuma solicitação aguardando decisão no momento."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-5 sm:p-8 bg-blue-50 rounded-[2rem] sm:rounded-[3rem] border border-dashed border-blue-200 flex flex-col md:flex-row items-center gap-6 mx-1">
        <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center shrink-0">
          <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-1.5">
          <h4 className="font-black text-lg sm:text-xl text-blue-800 uppercase tracking-tighter">Workflow de Triagem Aumentada (Nano)</h4>
          <p className="text-[12px] sm:text-sm text-blue-600 leading-snug max-w-3xl font-medium">
            O motor Nemotron Nano 9B cruza a gravidade relatada pela UBS com a disponibilidade da frota para sugerir a melhor decisão técnica em milissegundos. Utilize a IA para garantir que casos de Hemodiálise, Oncologia e Pós-operatórios tenham a prioridade correta garantida pelo protocolo municipal.
          </p>
        </div>
        <ArrowRight className="h-8 w-8 text-blue-300 hidden md:block" />
      </div>
    </div>
  );
}
