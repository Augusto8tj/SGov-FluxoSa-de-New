"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ClipboardList, 
  Users, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  BrainCircuit, 
  Zap,
  AlertTriangle,
  MapPin,
  Loader2,
  Info,
  KeyRound
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { summarizeUbsDemand, UbsDemandOutput } from "@/ai/flows/summarize-ubs-demand-flow";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { requestService } from "@/services/request-service";
import { patientService } from "@/services/patient-service";
import { useAuth } from "@/hooks/use-auth";
import { TransportRequest } from "@/lib/types";

export default function UbsDashboard() {
  const [loading, setLoading] = useState(true);
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [aiReport, setAiReport] = useState<UbsDemandOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Real Data States
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const loadRealData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setLoading(true);
    try {
      const [reqs, pats] = await Promise.all([
        requestService.getRequests(forceRefresh),
        patientService.getPatients(forceRefresh)
      ]);

      const ubsId = user?.unitId || "UBS-01";
      const myRequests = reqs.filter(r => r.ubsId === ubsId || r.operatorId === "UBS_MGR");
      
      setRequests(myRequests);
      setPatientCount(pats.length);
    } catch (error) {
      console.error("Erro ao carregar dados da UBS:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setIsWithinWindow(hour >= 8 && hour < 13);
    };
    
    checkTime();
    loadRealData();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [loadRealData]);

  const handleGenerateReport = async () => {
    setLoadingAi(true);
    try {
      const pendingCount = requests.filter(r => r.status === 'PENDING').length;
      const urgentCount = requests.filter(r => r.urgencyLevel === 'critical' || r.urgencyLevel === 'high').length;

      const result = await summarizeUbsDemand({
        ubsName: "UBS Central",
        pendingRequests: pendingCount,
        urgentCases: urgentCount,
        commonDestinations: Array.from(new Set(requests.map(r => r.destinationLocation))).slice(0, 3)
      });
      setAiReport(result);
      toast({ title: "Análise Concluída", description: "Resumo estratégico gerado para sua unidade." });
    } catch (error) {
      console.error("Erro ao gerar relatório de demanda da UBS:", error);
      toast({ variant: "destructive", title: "Erro na IA", description: "Não foi possível gerar o resumo agora." });
    } finally {
      setLoadingAi(false);
    }
  };

  const pendingRequestsCount = useMemo(
    () => requests.filter(r => r.status === 'PENDING').length,
    [requests]
  );
  const approvedRequestsCount = useMemo(
    () => requests.filter(r => r.status === 'APPROVED').length,
    [requests]
  );
  const upcomingTrips = useMemo(
    () => requests.filter(r => r.status === 'APPROVED' || r.status === 'PENDING').slice(0, 5),
    [requests]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Portal da Unidade</h2>
          <p className="text-muted-foreground">Gestão de transporte para a UBS Central - Rio Claro, RJ.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild disabled={!isWithinWindow} className={cn("bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 px-6 rounded-xl", !isWithinWindow && "opacity-50 grayscale")}>
            <Link href={isWithinWindow ? "/ubs-portal/requests" : "#"} className="gap-2">
              <PlusCircle className="h-4 w-4" /> Novo Pedido
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Nossos Pedidos" value={requests.length} icon={ClipboardList} description="Total na fila" />
        <StatsCard title="Em Análise" value={pendingRequestsCount} icon={Clock} description="Na Secretaria" className="border-b-4 border-b-amber-500" />
        <StatsCard title="Confirmados" value={approvedRequestsCount} icon={CheckCircle2} description="Aguardando Veículo" className="border-b-4 border-b-emerald-500" />
        <StatsCard title="Nossa Base" value={patientCount} icon={Users} description="Cidadãos Cadastrados" />
      </div>

      {!isWithinWindow && (
        <Card className="bg-rose-50 border-rose-200 border-2 shadow-none rounded-2xl mx-1">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-rose-100 p-3 rounded-full text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-rose-800">Janela de Agendamento Fechada</p>
              <p className="text-xs text-rose-700 leading-tight">Novos pedidos permitidos apenas entre 08h e 13h. Contate o Gabinete para emergências fora da janela.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Sincronizando Dados Reais...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-7">
          <div className="md:col-span-4 space-y-6">
            <Card className="border-none shadow-sm bg-primary/5 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Análise de Demanda Local</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs font-bold text-primary"
                  onClick={handleGenerateReport}
                  disabled={loadingAi}
                >
                  {loadingAi ? "Analisando..." : "Gerar Insights"}
                </Button>
              </CardHeader>
              <CardContent>
                {aiReport ? (
                  <div className="space-y-4 animate-in fade-in">
                    <p className="text-sm leading-relaxed text-slate-700">{aiReport.summary}</p>
                    <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-primary/10">
                      <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-primary">Dica: {aiReport.recommendation}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-muted-foreground italic">Utilize a IA para entender a situação do transporte da unidade agora.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Próximos Embarques na Unidade</CardTitle>
                <CardDescription className="text-xs">Confira os horários previstos para seus pacientes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingTrips.length > 0 ? (
                  upcomingTrips.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors border">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-700 uppercase tracking-tighter">{item.patientName}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                          <MapPin className="h-3 w-3 text-rose-500" /> {item.destinationLocation} &bull; {new Date(item.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[9px] h-5 font-bold px-2",
                        item.status === 'APPROVED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                        item.status === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-700 border-slate-200"
                      )}>
                        {item.status === 'APPROVED' ? 'CONFIRMADO' : item.status === 'PENDING' ? 'EM ANÁLISE' : item.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-30 italic text-sm">Sem viagens previstas.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3 space-y-6">
            <Card className="border-none shadow-sm h-full flex flex-col rounded-2xl bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Recursos Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <Button variant="outline" className="w-full justify-start gap-4 h-20 rounded-[1.5rem] border-dashed group hover:border-primary transition-all" asChild>
                  <Link href="/ubs-portal/patients">
                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold">Base de Cidadãos</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Sincronizar Pacientes</p>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-4 h-20 rounded-[1.5rem] border-dashed group hover:border-indigo-400 transition-all" asChild>
                  <Link href="/ubs-portal/manifests">
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                      <KeyRound className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold">Códigos de Acesso</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Portal do Cidadão</p>
                    </div>
                  </Link>
                </Button>
                
                <div className="mt-auto p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Protocolo de Suporte</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Utilize o botão de <b>lâmpada</b> no cabeçalho para visualizar as etapas de implantação nesta unidade.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
