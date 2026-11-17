"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  MessageSquare, 
  User, 
  Clock, 
  Ambulance, 
  CheckCircle2, 
  Loader2, 
  Search,
  Filter,
  Eye,
  AlertCircle,
  ShieldCheck,
  BrainCircuit,
  Zap,
  Check,
  History,
  TrendingUp,
  LayoutList,
  Calendar,
  ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { reportService } from "@/services/report-service";
import { analyzeFieldReports, FieldAnalysisOutput } from "@/ai/flows/analyze-field-reports-flow";
import { DriverReport } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<DriverReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<DriverReport | null>(null);
  
  // IA States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<FieldAnalysisOutput | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<FieldAnalysisOutput[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const { toast } = useToast();

  const loadReports = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setLoading(true);
    try {
      const data = await reportService.getReports(forceRefresh);
      setReports(data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      toast({ title: "Erro", description: "Falha ao carregar relatórios.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleMarkAsRead = async (report: DriverReport) => {
    if (report.read) return;
    try {
      await reportService.markAsRead(report.id);
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, read: true } : r));
    } catch (error) {
      console.error("Erro ao marcar relatório como lido:", error);
    }
  };

  const handleAiAnalysis = async () => {
    const unreadReports = reports.filter(r => !r.read);
    if (unreadReports.length === 0) {
      toast({ title: "Tudo em ordem", description: "Não há novos relatórios para análise." });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeFieldReports(unreadReports);
      setLastAnalysis(result);
      setAnalysisHistory(prev => [result, ...prev]);
      
      // Marcar lidos após análise
      const unreadIds = unreadReports.map(r => r.id);
      await reportService.markManyAsRead(unreadIds);
      
      setReports(prev => prev.map(r => unreadIds.includes(r.id) ? { ...r, read: true } : r));
      
      toast({ 
        title: "Triagem Concluída", 
        description: `IA analisou ${unreadReports.length} relatos novos.` 
      });
    } catch (error) {
      console.error("Erro na triagem IA de relatórios:", error);
      toast({ title: "Falha na IA", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleTask = (task: string) => {
    const newSet = new Set(completedTasks);
    if (newSet.has(task)) {
      newSet.delete(task);
    } else {
      newSet.add(task);
    }
    setCompletedTasks(newSet);
  };

  const filteredReports = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return reports.filter(r => 
      r.driverName.toLowerCase().includes(query) ||
      r.content.toLowerCase().includes(query)
    );
  }, [reports, searchTerm]);

  const unreadCount = useMemo(() => reports.filter(r => !r.read).length, [reports]);
  const hasUnreadSos = useMemo(() => reports.some(r => r.type === 'SOS' && !r.read), [reports]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" /> Relatórios de Campo
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Monitoramento e inteligência operacional em tempo real.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button 
            className={cn(
              "gap-2 h-10 sm:h-11 px-4 sm:px-6 rounded-xl shadow-lg transition-all flex-1 sm:flex-none text-[10px] sm:text-sm uppercase font-black tracking-widest",
              unreadCount > 0 ? "bg-primary animate-pulse" : "bg-muted-foreground/20 text-muted-foreground"
            )}
            onClick={handleAiAnalysis}
            disabled={isAnalyzing || unreadCount === 0}
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4 shrink-0" />}
            Triagem IA {unreadCount > 0 && `(${unreadCount})`}
          </Button>
          <Button variant="outline" className="gap-2 h-10 sm:h-11 px-4 sm:px-6 rounded-xl flex-1 sm:flex-none text-[10px] sm:text-sm font-bold" onClick={() => loadReports(true)}>
            <Clock className="h-4 w-4 shrink-0" /> <span className="xs:inline hidden">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Alerta SOS em destaque se houver um não lido */}
      {hasUnreadSos && (
        <div className="p-4 sm:p-6 bg-rose-600 text-white rounded-[1.5rem] sm:rounded-3xl shadow-xl shadow-rose-100 flex items-center gap-4 animate-bounce mx-1">
          <div className="bg-white/20 p-3 rounded-2xl">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-black uppercase tracking-tighter text-lg">EMERGÊNCIA ATIVA!</h3>
            <p className="text-xs font-bold text-rose-100 uppercase tracking-widest">Verifique os alertas SOS na lista abaixo imediatamente.</p>
          </div>
        </div>
      )}

      {lastAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="lg:col-span-2 border-none shadow-xl bg-primary text-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 pointer-events-none">
              <TrendingUp className="h-20 w-20 sm:h-32 sm:w-32" />
            </div>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 fill-white" />
                  <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-tighter">Briefing IA de Decisão</CardTitle>
                </div>
                <Badge className={cn(
                  "font-black text-[8px] sm:text-[10px] uppercase border-none px-2 sm:px-3",
                  lastAnalysis.priorityLevel === 'critical' ? 'bg-rose-500 text-white' : 'bg-white/20 text-white'
                )}>
                  {lastAnalysis.priorityLevel}
                </Badge>
              </div>
              <CardDescription className="text-white/70 text-[10px] sm:text-xs mt-1">Resumo estratégico para o Gabinete.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <p className="text-xs sm:text-sm font-medium leading-relaxed bg-white/10 p-4 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/10">
                &quot;{lastAnalysis.executiveSummary}&quot;
              </p>
              <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-2 sm:px-3 py-1 rounded">
                <ShieldCheck className="h-3 w-3 shrink-0" /> Protocolo Nvidia Nemotron Nano
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-[1.5rem] sm:rounded-[2rem] bg-card overflow-hidden">
            <CardHeader className="bg-muted/30 p-4 sm:p-6">
              <CardTitle className="text-[10px] sm:text-xs uppercase text-muted-foreground font-black tracking-widest flex items-center gap-2">
                <LayoutList className="h-4 w-4 text-primary shrink-0" /> Checklist de Providências
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {lastAnalysis.recommendedActions.map((action, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                      completedTasks.has(action.task) ? "bg-emerald-50 border-emerald-100 opacity-60" : "bg-slate-50 border-slate-100 hover:bg-white"
                    )}
                    onClick={() => toggleTask(action.task)}
                  >
                    <Checkbox checked={completedTasks.has(action.task)} className="mt-1" />
                    <div className="space-y-0.5">
                      <p className="text-[11px] sm:text-xs font-bold text-slate-700 leading-tight">{action.task}</p>
                      <p className="text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-tighter">{action.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        <div className="md:col-span-5 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por condutor..." 
                className="pl-10 h-11 sm:h-12 bg-card border-none shadow-sm rounded-xl text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl shrink-0"><Filter className="h-4 w-4" /></Button>
          </div>

          <Card className="border-none shadow-md overflow-hidden bg-card rounded-xl sm:rounded-2xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 sm:py-24 gap-4">
                <Loader2 className="h-8 sm:h-10 w-8 sm:w-10 text-primary animate-spin" />
                <p className="text-[10px] sm:text-sm text-muted-foreground font-black uppercase tracking-widest">Sincronizando Relatórios...</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-none">
                      <TableHead className="font-bold h-10 py-0 pl-4 sm:pl-6 text-[10px] sm:text-xs uppercase">Status</TableHead>
                      <TableHead className="font-bold h-10 py-0 text-[10px] sm:text-xs uppercase">Condutor</TableHead>
                      <TableHead className="font-bold h-10 py-0 text-[10px] sm:text-xs uppercase hidden sm:table-cell">Data/Hora</TableHead>
                      <TableHead className="font-bold h-10 py-0 text-[10px] sm:text-xs uppercase">Resumo</TableHead>
                      <TableHead className="text-right font-bold h-10 py-0 pr-4 sm:pr-6 text-[10px] sm:text-xs uppercase">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report) => (
                        <TableRow 
                          key={report.id} 
                          className={cn(
                            "group transition-colors",
                            report.type === 'SOS' ? "bg-rose-50" : (!report.read ? "bg-primary/[0.03] font-bold" : "hover:bg-muted/10 opacity-70")
                          )}
                        >
                          <TableCell className="pl-4 sm:pl-6 py-3 sm:py-4">
                            {report.type === 'SOS' ? (
                              <Badge className="bg-rose-600 text-white border-none text-[8px] uppercase px-1.5 h-4 sm:h-5 animate-pulse">CRÍTICO</Badge>
                            ) : !report.read ? (
                              <Badge className="bg-primary text-white border-none text-[8px] uppercase px-1.5 h-4 sm:h-5 animate-bounce">Novo</Badge>
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 opacity-50" />
                            )}
                          </TableCell>
                          <TableCell className="py-3 sm:py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-muted flex items-center justify-center text-[10px] sm:text-xs font-bold text-muted-foreground uppercase shrink-0">
                                {report.driverName[0]}
                              </div>
                              <span className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{report.driverName.split(' ')[0]}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[10px] sm:text-xs text-muted-foreground font-mono hidden sm:table-cell py-3 sm:py-4">
                            {format(new Date(report.timestamp), "dd/MM HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="py-3 sm:py-4">
                            <p className={cn(
                              "text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[250px] italic",
                              report.type === 'SOS' ? "text-rose-700 font-bold" : "text-muted-foreground"
                            )}>
                              &quot;{report.content}&quot;
                            </p>
                          </TableCell>
                          <TableCell className="text-right pr-4 sm:pr-6 py-3 sm:py-4">
                            <Button 
                              variant={report.type === 'SOS' ? "destructive" : "ghost"} 
                              size="sm" 
                              className={cn(
                                "gap-1 sm:gap-2 font-bold text-[9px] sm:text-[10px] uppercase h-7 sm:h-8 rounded-lg px-2 sm:px-3",
                                report.type !== 'SOS' && "text-primary"
                              )}
                              onClick={() => {
                                setSelectedReport(report);
                                handleMarkAsRead(report);
                              }}
                            >
                              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">{report.type === 'SOS' ? 'SOCORRO' : 'Abrir'}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic text-xs">
                          Nenhum relatório de campo encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          <Card className="border-none shadow-md rounded-xl sm:rounded-2xl bg-card">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-[10px] sm:text-xs uppercase text-muted-foreground font-black tracking-widest flex items-center gap-2">
                <History className="h-4 w-4 text-primary shrink-0" /> Histórico de Análises
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              {analysisHistory.length > 0 ? (
                analysisHistory.slice(0, 3).map((hist, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-xl space-y-1 group hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => setIsHistoryDialogOpen(true)}>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase text-primary">Análise #{analysisHistory.length - i}</span>
                      <span className="text-[8px] text-muted-foreground font-bold">HOJE</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] leading-tight text-slate-600 line-clamp-2 italic">&quot;{hist.executiveSummary}&quot;</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 sm:py-10 opacity-20">
                  <BrainCircuit className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sem Histórico</p>
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full h-10 rounded-xl border-dashed border-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all"
                onClick={() => setIsHistoryDialogOpen(true)}
              >
                Ver Todas Análises
              </Button>
            </CardContent>
          </Card>

          <div className="p-4 sm:p-5 bg-blue-50 rounded-[1.5rem] sm:rounded-3xl border border-dashed border-blue-200 mx-1">
            <h4 className="text-[9px] text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">Suporte à Decisão</h4>
            <p className="text-[10px] sm:text-[11px] text-blue-600 leading-relaxed font-medium">
              A IA agrupa relatos por padrões mecânicos ou logísticos, permitindo visualizar gargalos operacionais antes que virem crises.
            </p>
          </div>
        </div>
      </div>

      {/* Dialog de Histórico Completo de Análises */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px] w-[95vw] rounded-2xl sm:rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {isHistoryDialogOpen && (
            <>
              <div className="bg-slate-900 p-4 sm:p-6 text-white">
                <DialogHeader className="space-y-0 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary p-2 sm:p-2.5 rounded-xl sm:rounded-2xl">
                      <History className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg sm:text-xl font-black tracking-tight uppercase">Log de Triagem IA</DialogTitle>
                      <DialogDescription className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                        Histórico de Briefings & bull; PMRC
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              
              <ScrollArea className="max-h-[60vh] sm:max-h-[70vh] bg-slate-50">
                <div className="p-4 sm:p-6 space-y-6">
                  {analysisHistory.length > 0 ? (
                    analysisHistory.map((hist, idx) => (
                      <div key={idx} className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-none text-[8px] sm:text-[10px] font-black uppercase">
                              Sessão #{analysisHistory.length - idx}
                            </Badge>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {format(new Date(), "dd/MM/yyyy")}
                            </span>
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[8px] sm:text-[9px] font-black uppercase",
                            hist.priorityLevel === 'critical' ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-slate-500'
                          )}>
                            {hist.priorityLevel}
                          </Badge>
                        </div>
                        
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border shadow-sm space-y-4">
                          <div className="space-y-2">
                            <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Resumo Executivo</p>
                            <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed italic">
                              &quot;{hist.executiveSummary}&quot;
                            </p>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-3">
                            <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Providências Sugeridas</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {hist.recommendedActions.map((act, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                  <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-700 truncate">{act.task}</p>
                                    <p className="text-[7px] sm:text-[8px] font-black text-primary uppercase">{act.department}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        {idx < analysisHistory.length - 1 && <Separator className="my-8" />}
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-4 opacity-30">
                      <BrainCircuit className="h-16 w-16 mx-auto text-slate-400" />
                      <p className="text-sm font-black uppercase tracking-widest">Nenhuma análise realizada</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 sm:p-6 bg-white border-t">
                <Button className="w-full rounded-xl sm:rounded-2xl h-11 sm:h-12 font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-lg" onClick={() => setIsHistoryDialogOpen(false)}>
                  Fechar Histórico
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-2xl sm:rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {selectedReport && (
            <div className="flex flex-col">
              <div className={cn(
                "p-5 sm:p-6 text-white",
                selectedReport.type === 'SOS' ? "bg-rose-600" : "bg-primary"
              )}>
                <DialogHeader className="space-y-0 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl">
                      {selectedReport.type === 'SOS' ? <ShieldAlert className="h-6 w-6 sm:h-7 sm:w-7" /> : <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />}
                    </div>
                    <div>
                      <DialogTitle className="text-lg sm:text-xl font-black tracking-tight leading-none uppercase">
                        {selectedReport.type === 'SOS' ? 'ALERTA SOS CRÍTICO' : 'Relato de Campo'}
                      </DialogTitle>
                      <DialogDescription className="text-[8px] sm:text-[10px] uppercase font-bold opacity-80 mt-1 tracking-widest text-white">
                        {selectedReport.type === 'SOS' ? 'EMERGÊNCIA OPERACIONAL' : 'Operação & Rio Claro'}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold">{selectedReport.driverName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] sm:text-[10px] opacity-80">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {format(new Date(selectedReport.timestamp), "HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-6 bg-white">
                <div className="space-y-3">
                  <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <AlertCircle className="h-4 w-4 text-primary shrink-0" /> Conteúdo do Relatório
                  </h4>
                  <div className={cn(
                    "p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border italic text-xs sm:text-sm leading-relaxed shadow-inner min-h-[100px] sm:min-h-[120px]",
                    selectedReport.type === 'SOS' ? "bg-rose-50 border-rose-100 text-rose-800 font-bold" : "bg-slate-50 border-slate-100 text-slate-700"
                  )}>
                    &quot;{selectedReport.content}&quot;
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl sm:rounded-2xl flex flex-col gap-1 border">
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-tighter">Viatura</p>
                    <div className="flex items-center gap-2">
                      <Ambulance className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
                      <span className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase truncate">{selectedReport.vehicleId || "N/A"}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl sm:rounded-2xl flex flex-col gap-1 border">
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-tighter">Triagem</p>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500 shrink-0" />
                      <span className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase">Recebido</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-slate-50 border-t">
                <Button className={cn(
                  "w-full rounded-xl sm:rounded-2xl h-11 sm:h-12 font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-lg",
                  selectedReport.type === 'SOS' ? "bg-rose-600 hover:bg-rose-700" : ""
                )} onClick={() => setSelectedReport(null)}>
                  Ciente e Arquivar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}