"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Ambulance, 
  Zap, 
  Loader2, 
  Route as RouteIcon,
  Navigation,
  Send,
  UserCheck,
  ClipboardList,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateOptimizedRoutes, GenerateOptimizedRoutesOutput } from "@/ai/flows/generate-optimized-routes";
import { requestService } from "@/services/request-service";
import { vehicleService } from "@/services/vehicle-service";
import { driverService } from "@/services/driver-service";
import { TransportRequest, Vehicle, Driver } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function RoutesPage() {
  const [optimizing, setOptimizing] = useState(false);
  const [committing, setCommitting] = useState(false);
  
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [result, setResult] = useState<GenerateOptimizedRoutesOutput | null>(null);
  
  const [selectedDrivers, setSelectedDrivers] = useState<Record<number, string>>({});
  
  const { toast } = useToast();

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      const [reqs, vehs, drvs] = await Promise.all([
        requestService.getRequests(forceRefresh),
        vehicleService.getVehicles(forceRefresh),
        driverService.getAvailableDrivers(forceRefresh)
      ]);
      
      // FILTRO CRÍTICO: Somente pedidos aprovados e sem manifesto
      const pendingManifest = reqs.filter(r => r.status === 'APPROVED' && !r.manifestId);
      setRequests(pendingManifest);
      setVehicles(vehs.filter(v => v.available));
      setDrivers(drvs);
    } catch (error) {
      console.error("Erro ao carregar dados da malha viária:", error);
      toast({ title: "Erro de Carga", description: "Não foi possível sincronizar os dados da malha viária.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runOptimization = async () => {
    if (requests.length === 0) {
      toast({ title: "Fila Vazia", description: "Não há solicitações aprovadas aguardando roteirização." });
      return;
    }

    setOptimizing(true);
    setResult(null);
    try {
      const appointments = requests.map(r => ({
        id: r.id,
        patientId: r.patientName,
        pickupLocation: r.pickupLocation,
        destination: r.destinationLocation
      }));

      const data = await generateOptimizedRoutes({
        appointments,
        vehicles: vehicles.map(v => ({ id: v.id, type: v.type, capacity: v.capacity, available: v.available })),
      });
      
      setResult(data);
      setSelectedDrivers({});
      toast({ 
        title: "Otimização Concluída", 
        description: "A inteligência lógica distribuiu os pacientes nos melhores trajetos." 
      });
    } catch (error) {
      console.error("Erro na otimização de rotas:", error);
      toast({ 
        title: "Falha Logística", 
        description: "Não foi possível calcular as rotas no momento.", 
        variant: "destructive" 
      });
    } finally {
      setOptimizing(false);
    }
  };

  const handleCommitManifestos = async () => {
    if (!result) return;

    const missingDriver = result.assignments.some((_, idx) => !selectedDrivers[idx]);
    if (missingDriver) {
      toast({ title: "Atenção", description: "Atribua um motorista para cada manifesto gerado.", variant: "destructive" });
      return;
    }

    setCommitting(true);
    try {
      const assignments = result.assignments.map((a, idx) => {
        const driverId = selectedDrivers[idx];
        const driver = drivers.find(d => d.id === driverId);
        const vehicle = vehicles.find(v => v.id === a.vehicleId);

        return {
          ...a,
          vehicleType: vehicle?.type || "Viatura Municipal",
          driverId: driverId,
          driverName: driver?.name || "Motorista Municipal"
        };
      });

      await requestService.createManifestBatch(assignments);
      const committedIds = new Set(assignments.flatMap(a => a.route));
      setRequests(prev => prev.filter(r => !committedIds.has(r.id)));

      toast({ title: "Manifestos Oficializados", description: "A escala de campo foi enviada para os condutores." });
      setResult(null);
      setSelectedDrivers({});
    } catch (error: any) {
      console.error("Erro ao oficializar manifestos:", error);
      toast({ title: "Erro na Persistência", description: error.message, variant: "destructive" });
    } finally {
      setCommitting(false);
    }
  };

  const updateDriverSelection = (assignmentIdx: number, driverId: string) => {
    setSelectedDrivers(prev => ({
      ...prev,
      [assignmentIdx]: driverId
    }));
  };

  // Função para verificar se um motorista já está ocupado em outro manifesto deste planejamento
  const isDriverUnavailable = (driverId: string, currentAssignmentIdx: number) => {
    return Object.entries(selectedDrivers).some(
      ([idx, id]) => parseInt(idx) !== currentAssignmentIdx && id === driverId
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Otimizador de Rotas</h2>
          <p className="text-muted-foreground">Logística inteligente para transporte sanitário em Rio Claro.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadData(true)} className="h-11 rounded-xl">Recarregar Fila</Button>
          <Button 
            onClick={runOptimization} 
            disabled={optimizing || requests.length === 0}
            className="bg-primary hover:bg-primary/90 shadow-md h-11 px-8 gap-2 rounded-xl"
          >
            {optimizing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 text-accent" />}
            {optimizing ? "Processando..." : "Gerar Roteirização"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Painel Logístico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Navigation className="h-4 w-4" /> Fila de Espera
                </span>
                <Badge variant={requests.length > 0 ? "default" : "secondary"}>{requests.length} Pedidos</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Ambulance className="h-4 w-4" /> Frota Disponível
                </span>
                <Badge variant="secondary">{vehicles.length} Veículos</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4" /> Motoristas Ativos
                </span>
                <Badge variant="secondary">{drivers.length} Condutores</Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t mt-2">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Modo Demonstração Ativo</span>
              </div>
            </CardFooter>
          </Card>
          
          <div className="p-4 bg-blue-50 rounded-2xl border border-dashed border-blue-200 flex items-start gap-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
              <RouteIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-blue-700">Triagem Logística</p>
              <p className="text-[10px] text-blue-600 leading-tight">O sistema agrupa pacientes com rotas próximas para reduzir o consumo de combustível e tempo de espera.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {!result && !optimizing && (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center py-20 bg-muted/5 rounded-[2.5rem]">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Navigation className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Pronto para Otimização</h3>
              <p className="text-muted-foreground text-xs max-w-xs text-center mt-1">
                {requests.length > 0 
                  ? `Existem ${requests.length} pedidos aguardando. Clique em "Gerar Roteirização" para processar.`
                  : "A fila de espera está vazia no momento."}
              </p>
            </Card>
          )}

          {optimizing && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div>
                <p className="text-lg font-black uppercase tracking-tighter animate-pulse">Calculando Eficiência...</p>
                <p className="text-sm text-muted-foreground">Cruzando dados geográficos e capacidade da frota.</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid gap-4 md:grid-cols-2">
                {result.assignments.map((assignment, idx) => (
                  <Card key={idx} className="border-none shadow-sm overflow-hidden border-l-4 border-l-primary rounded-2xl bg-card">
                    <CardHeader className="pb-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-black uppercase">MISSÃO #{idx + 1}</Badge>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase">
                          <Navigation className="h-3 w-3" /> {assignment.estimatedDistanceKm} km
                        </div>
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2 mt-2">
                        <Ambulance className="h-5 w-5 text-primary" />
                        {vehicles.find(v => v.id === assignment.vehicleId)?.type || "Viatura Escalada"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-black uppercase text-primary">Condutor Responsável</Label>
                          {selectedDrivers[idx] && (
                            <div className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase animate-in fade-in">
                              <UserCheck className="h-2.5 w-2.5" /> Atribuído
                            </div>
                          )}
                        </div>
                        <Select 
                          value={selectedDrivers[idx] || ""} 
                          onValueChange={(val) => updateDriverSelection(idx, val)}
                        >
                          <SelectTrigger className="h-10 bg-white rounded-lg border-none shadow-sm">
                            <SelectValue placeholder="Selecione o motorista..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-xl">
                            {drivers.map(d => {
                              const unavailable = isDriverUnavailable(d.id, idx);
                              return (
                                <SelectItem 
                                  key={d.id} 
                                  value={d.id} 
                                  disabled={unavailable}
                                  className={cn("cursor-pointer", unavailable && "opacity-50")}
                                >
                                  <div className="flex items-center justify-between w-full min-w-[200px]">
                                    <span>{d.name}</span>
                                    {unavailable && (
                                      <Badge variant="secondary" className="ml-2 text-[8px] font-black uppercase h-4 px-1.5 bg-rose-50 text-rose-600 border-none">
                                        <AlertCircle className="h-2.5 w-2.5 mr-1" /> Ocupado
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                          <ClipboardList className="h-3.5 w-3.5" /> Itinerário do Manifesto
                        </p>
                        <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-muted">
                          {assignment.route.map((appId) => {
                            const req = requests.find(r => r.id === appId);
                            return (
                              <div key={appId} className="relative">
                                <div className="absolute -left-[20px] top-1 size-3 rounded-full bg-primary ring-4 ring-white" />
                                <div>
                                  <p className="text-sm font-bold text-slate-700 leading-none">{req?.patientName || "Paciente Local"}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Rota: {req?.pickupLocation} → {req?.destinationLocation}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-dashed border-emerald-200 text-[10px] text-emerald-700 italic">
                        IA: {assignment.notes}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-primary text-primary-foreground border-none shadow-xl rounded-3xl overflow-hidden mt-6">
                <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex gap-3">
                    <Zap className="h-6 w-6 text-accent shrink-0 mt-1" />
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest opacity-80">Resumo da Roteirização</p>
                      <p className="text-sm font-medium leading-relaxed">{result.optimizationSummary}</p>
                    </div>
                  </div>
                  <Button 
                    className="bg-white text-primary hover:bg-slate-100 h-12 px-6 gap-2 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg"
                    onClick={handleCommitManifestos}
                    disabled={committing}
                  >
                    {committing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {committing ? "Oficializando..." : "Oficializar Missões"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
