"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  UserRoundCheck, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  ShieldAlert, 
  Coins, 
  TrendingUp,
  Award,
  Calendar as CalendarIcon,
  Info,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/dashboard/stats-card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { driverService } from "@/services/driver-service";
import { Driver } from "@/lib/types";

export default function DriversManagementPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const loadDrivers = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setLoading(true);
    try {
      const data = await driverService.getDrivers(forceRefresh);
      setDrivers(data);
    } catch (error) {
      console.error("Erro ao carregar condutores:", error);
      toast({ title: "Erro", description: "Falha ao carregar condutores reais.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const filteredDrivers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return drivers.filter(d => 
      d.name.toLowerCase().includes(query) || 
      (d.phone && d.phone.includes(searchTerm))
    );
  }, [drivers, searchTerm]);

  const activeDriversCount = useMemo(
    () => drivers.filter(d => d.status === 'AVAILABLE' || d.status === 'ON_ROUTE').length,
    [drivers]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <UserRoundCheck className="h-8 w-8" /> Gestão de Condutores
          </h2>
          <p className="text-muted-foreground text-sm">Controle de pessoal, financeiro e conformidade técnica.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-11 rounded-xl gap-2 shadow-sm">
                <CalendarIcon className="h-4 w-4" /> Escala Mensal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] w-[95vw] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              {isScheduleOpen && (
                <>
                  <div className="bg-primary p-5 sm:p-6 text-white shrink-0">
                    <DialogHeader className="text-left space-y-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 sm:p-2.5 rounded-2xl">
                          <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter">Escala de Plantão</DialogTitle>
                          <DialogDescription className="text-primary-foreground/70 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-white">
                            Gestão de Disponibilidade & bull; PMRC
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>
                  </div>
                  
                  <div className="p-4 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8 bg-white max-h-[75vh] overflow-y-auto no-scrollbar">
                    <div className="w-full flex-1 flex flex-col items-center gap-4">
                      <div className="w-full border rounded-[2rem] p-4 sm:p-6 shadow-inner bg-slate-50 flex flex-col items-center">
                        <div className="text-center mb-4">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Selecione uma Data</p>
                          <p className="text-sm font-bold text-slate-600">
                            {date ? format(date, "MMMM 'de' yyyy", { locale: ptBR }) : "Carregando..."}
                          </p>
                        </div>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          locale={ptBR}
                          className="rounded-xl border bg-white shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="w-full md:w-[300px] space-y-6">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                          <Info className="h-4 w-4 text-primary" /> 
                          Plantão: {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "Selecione"}
                        </h4>
                        <p className="text-[9px] text-muted-foreground font-medium px-1 italic">Consulte a escala oficial no Firestore.</p>
                      </div>
                      
                      <div className="space-y-3">
                        {drivers.length > 0 ? drivers.slice(0, 3).map((d) => (
                          <div key={d.id} className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between group hover:bg-blue-100 transition-colors cursor-pointer shadow-sm">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-blue-900">{d.name}</span>
                              <span className="text-[8px] font-bold text-blue-600 uppercase">Status: {d.status}</span>
                            </div>
                            <Badge className="bg-blue-600 text-white text-[8px] uppercase border-none h-5 px-2 shrink-0">Escalado</Badge>
                          </div>
                        )) : (
                          <p className="text-[10px] text-muted-foreground italic px-1">Nenhum condutor cadastrado para este dia.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter className="p-4 bg-slate-50 border-t shrink-0">
                    <Button className="w-full rounded-2xl uppercase text-[10px] font-black tracking-widest h-12 shadow-lg" onClick={() => setIsScheduleOpen(false)}>
                      Fechar Consulta
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
          <Button className="h-11 rounded-xl gap-2 shadow-lg" asChild>
             <a href="/dashboard/settings?tab=drivers">
               <Plus className="h-4 w-4" /> Novo Motorista
             </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatsCard title="Ativos hoje" value={activeDriversCount} icon={CheckCircle2} description="Em operação real" />
        <StatsCard title="Diárias Pendentes" value={0} icon={Coins} description="Aguardando Gabinete" />
        <StatsCard title="Vencimento CNH" value={0} icon={ShieldAlert} description="Próximos 30 dias" />
        <StatsCard title="Score Médio" value="N/A" icon={Award} description="Avaliação IA" />
      </div>

      <Tabs defaultValue="roster" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar justify-start">
          <TabsTrigger value="roster" className="rounded-lg gap-2 whitespace-nowrap">Corpo de Condutores</TabsTrigger>
          <TabsTrigger value="financials" className="rounded-lg gap-2 whitespace-nowrap">Solicitações Financeiras</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg gap-2 whitespace-nowrap">Produtividade & IA</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-6 outline-none">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, telefone ou CNH..." 
                className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0"><Filter className="h-4 w-4" /></Button>
          </div>

          <Card className="border-none shadow-md overflow-hidden bg-card rounded-2xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground uppercase font-black">Sincronizando Condutores...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-none">
                      <TableHead className="font-bold">Motorista</TableHead>
                      <TableHead className="font-bold">Habilitação (CNH)</TableHead>
                      <TableHead className="font-bold">Status Atual</TableHead>
                      <TableHead className="text-right font-bold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.length > 0 ? filteredDrivers.map((driver) => (
                      <TableRow key={driver.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {driver.name[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-slate-700">{driver.name}</span>
                              <span className="text-[10px] text-muted-foreground font-medium">{driver.phone || "Sem telefone"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-slate-600">{driver.licenseNumber}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[9px] font-black uppercase px-2 h-5 border-none",
                            driver.status === 'ON_ROUTE' ? "bg-blue-100 text-blue-700" : 
                            driver.status === 'AVAILABLE' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                          )}>
                            {driver.status === 'ON_ROUTE' ? 'Em Rota' : driver.status === 'AVAILABLE' ? 'Disponível' : 'Fora de Serviço'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">
                          Nenhum condutor real cadastrado no sistema.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6 outline-none">
          <div className="py-20 text-center opacity-30">
            <Coins className="h-16 w-16 mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">Sem solicitações financeiras reais</p>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="outline-none">
           <div className="py-20 text-center opacity-30">
            <TrendingUp className="h-16 w-16 mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">Aguardando dados de produtividade</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
