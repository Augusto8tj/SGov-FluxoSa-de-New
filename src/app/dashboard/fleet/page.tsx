"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Ambulance, 
  Settings, 
  CheckCircle2, 
  Wrench,
  Filter,
  ChevronUp,
  User,
  Calendar,
  Gauge,
  Fuel,
  Activity,
  ShieldCheck,
  ClipboardList,
  MapPin,
  Clock,
  Droplets,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { vehicleService } from "@/services/vehicle-service";

const MOCK_MANIFEST = [
  { id: "S1", patient: "Maria Souza", time: "14:30", type: "COLETA", location: "UBS Central" },
  { id: "S2", patient: "Maria Souza", time: "15:00", type: "ENTREGA", location: "Hospital Municipal" },
  { id: "S3", patient: "José Santos", time: "15:15", type: "COLETA", location: "UBS Rio Claro Sul" },
  { id: "S4", patient: "José Santos", time: "15:45", type: "ENTREGA", location: "Centro Hemodiálise" },
];

export default function FleetPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({ 
    licensePlate: "", 
    type: "Ambulância", 
    capacity: 1,
    status: 'AVAILABLE',
    odometer: 0,
    fuelLevel: 100,
    lastSanitization: new Date().toISOString().split('T')[0],
    nextMaintenance: "",
    insuranceExpiry: ""
  });
  const { toast } = useToast();

  const loadVehicles = useCallback(async (forceRefresh: boolean = false) => {
    try {
      const data = await vehicleService.getVehicles(forceRefresh);
      setVehicles(data);
    } catch (error) {
      console.error("Erro ao sincronizar frota:", error);
      toast({ title: "Erro", description: "Falha ao sincronizar frota real.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const filteredVehicles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(v => 
      v.licensePlate.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q)
    );
  }, [vehicles, searchTerm]);

  const operationalCount = useMemo(
    () => vehicles.filter(v => v.status === 'AVAILABLE' || v.status === 'IN_USE').length,
    [vehicles]
  );

  const maintenanceCount = useMemo(
    () => vehicles.filter(v => v.status === 'MAINTENANCE').length,
    [vehicles]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold text-[10px] uppercase">Disponível</Badge>;
      case 'IN_USE': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-bold text-[10px] uppercase">Em Rota</Badge>;
      case 'MAINTENANCE': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-bold text-[10px] uppercase">Manutenção</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSaveVehicle = async () => {
    if (isSaving) return;
    if (!newVehicle.licensePlate) {
      toast({ title: "Erro no Cadastro", description: "Informe a placa do veículo.", variant: "destructive" });
      return;
    }

    const vehicleData: Omit<Vehicle, "id"> = {
      type: (newVehicle.type || "Ambulância") as Vehicle["type"],
      licensePlate: newVehicle.licensePlate.toUpperCase(),
      capacity: newVehicle.capacity || 1,
      available: (newVehicle.status || 'AVAILABLE') === 'AVAILABLE',
      status: (newVehicle.status || 'AVAILABLE') as Vehicle["status"],
      odometer: newVehicle.odometer || 0,
      fuelLevel: newVehicle.fuelLevel || 100,
      lastSanitization: newVehicle.lastSanitization || new Date().toISOString(),
      nextMaintenance: newVehicle.nextMaintenance,
      insuranceExpiry: newVehicle.insuranceExpiry,
    };

    setIsSaving(true);
    try {
      const newId = await vehicleService.addVehicle(vehicleData);
      setVehicles(prev => [...prev, { id: newId, ...vehicleData }].sort((a, b) => a.licensePlate.localeCompare(b.licensePlate)));
      setIsDialogOpen(false);
      setNewVehicle({ licensePlate: "", type: "Ambulância", capacity: 1, status: 'AVAILABLE', fuelLevel: 100, odometer: 0, lastSanitization: new Date().toISOString().split('T')[0], nextMaintenance: "", insuranceExpiry: "" });
      toast({ title: "Veículo Cadastrado", description: "O veículo foi adicionado com sucesso." });
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
      toast({ title: "Erro", description: "Falha ao salvar veículo.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedVehicleId(expandedVehicleId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Gestão de Frota</h2>
          <p className="text-muted-foreground">Controle, telemetria e manutenção dos veículos de Rio Claro.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md h-11 px-6 rounded-xl">
              <Plus className="h-4 w-4" /> Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-2xl overflow-y-auto max-h-[90vh]">
            {isDialogOpen && (
              <>
                <DialogHeader>
                  <DialogTitle>Cadastrar Veículo</DialogTitle>
                  <DialogDescription>Adicione um novo veículo à frota municipal com informações técnicas.</DialogDescription>
                </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest px-1">Identificação Básica</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="plate">Placa</Label>
                    <Input 
                      id="plate" 
                      placeholder="AAA-0000" 
                      className="h-12 rounded-xl"
                      value={newVehicle.licensePlate}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, licensePlate: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tipo de Veículo</Label>
                    <Select 
                      value={newVehicle.type} 
                      onValueChange={(val) => setNewVehicle(prev => ({ ...prev, type: val as any }))}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ambulância">Ambulância</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Sedan">Sedan</SelectItem>
                        <SelectItem value="Acessível">Acessível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cap">Vagas</Label>
                    <Input 
                      id="cap" 
                      type="number" 
                      className="h-12 rounded-xl"
                      value={newVehicle.capacity}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select 
                      value={newVehicle.status} 
                      onValueChange={(val) => setNewVehicle(prev => ({ ...prev, status: val as any }))}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Disponível</SelectItem>
                        <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
                        <SelectItem value="IN_USE">Em Rota</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t">
                <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-widest px-1 flex items-center gap-2">
                  <Activity className="h-3 w-3" /> Telemetria & Prazos
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" /> Odômetro</Label>
                    <Input 
                      type="number" 
                      placeholder="KM atual"
                      className="h-12 rounded-xl"
                      value={newVehicle.odometer}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, odometer: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-1.5"><Fuel className="h-3.5 w-3.5" /> Combustível (%)</Label>
                    <Input 
                      type="number" 
                      max="100" min="0"
                      className="h-12 rounded-xl"
                      value={newVehicle.fuelLevel}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, fuelLevel: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Próxima Revisão</Label>
                    <Input 
                      type="date" 
                      className="h-12 rounded-xl"
                      value={newVehicle.nextMaintenance}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, nextMaintenance: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Seguro (Venc.)</Label>
                    <Input 
                      type="date" 
                      className="h-12 rounded-xl"
                      value={newVehicle.insuranceExpiry}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving} className="rounded-xl">Cancelar</Button>
              <Button onClick={handleSaveVehicle} disabled={isSaving} className="h-12 rounded-xl shadow-lg bg-primary">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Veículo
              </Button>
            </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
              <Ambulance className="h-4 w-4 text-primary" /> Frota Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{vehicles.length}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Unidades registradas</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-emerald-600">{operationalCount}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Prontos para serviço</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
              <Wrench className="h-4 w-4 text-amber-500" /> Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-amber-600">{maintenanceCount}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Em revisão técnica</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por placa ou modelo..." 
            className="pl-10 h-11 rounded-xl bg-card border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shrink-0"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground uppercase font-black">Sincronizando Frota...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="font-bold">Veículo</TableHead>
                  <TableHead className="font-bold">Placa</TableHead>
                  <TableHead className="font-bold">Capacidade</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Painel / Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <React.Fragment key={vehicle.id}>
                      <TableRow 
                        className={cn(
                          "transition-colors group",
                          expandedVehicleId === vehicle.id ? "bg-primary/[0.03] hover:bg-primary/[0.05] border-b-0" : "hover:bg-muted/10"
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-2xl flex items-center justify-center transition-colors",
                              expandedVehicleId === vehicle.id ? "bg-primary text-white shadow-lg" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                            )}>
                              <Ambulance className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-sm">{vehicle.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-black text-muted-foreground uppercase">{vehicle.licensePlate}</TableCell>
                        <TableCell className="text-sm font-medium">{vehicle.capacity} {vehicle.capacity === 1 ? 'Vaga' : 'Vagas'}</TableCell>
                        <TableCell>{getStatusBadge(vehicle.status || 'AVAILABLE')}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant={expandedVehicleId === vehicle.id ? "default" : "ghost"} 
                            size="icon"
                            className={cn(
                              "h-9 w-9 rounded-full transition-all",
                              expandedVehicleId === vehicle.id ? "bg-primary shadow-lg" : "text-primary hover:bg-primary/10"
                            )}
                            onClick={() => toggleExpand(vehicle.id)}
                          >
                            {expandedVehicleId === vehicle.id ? <ChevronUp className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Acordeon Expansível: Painel Técnico do Veículo */}
                      {expandedVehicleId === vehicle.id && (
                        <TableRow className="bg-primary/[0.03] border-b-2 border-primary/10">
                          <TableCell colSpan={5} className="p-0">
                            <div className="p-4 sm:p-6 animate-in slide-in-from-top-2 duration-300">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Coluna 1: Status Operacional e Telemetria */}
                                <div className="space-y-4 bg-white p-5 rounded-3xl shadow-sm border border-primary/5">
                                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Telemetria em Tempo Real
                                  </h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-2xl flex flex-col gap-1">
                                      <div className="flex items-center gap-2 text-slate-400">
                                        <Fuel className="h-3 w-3" />
                                        <span className="text-[9px] font-black uppercase">Combustível</span>
                                      </div>
                                      <p className="text-sm font-black text-slate-700">{vehicle.fuelLevel || 0}%</p>
                                      <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                                        <div 
                                          className={cn(
                                            "h-full rounded-full transition-all", 
                                            (vehicle.fuelLevel || 0) > 20 ? "bg-emerald-500" : "bg-rose-500"
                                          )} 
                                          style={{ width: `${vehicle.fuelLevel || 0}%` }} 
                                        />
                                      </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl flex flex-col gap-1">
                                      <div className="flex items-center gap-2 text-slate-400">
                                        <Gauge className="h-3 w-3" />
                                        <span className="text-[9px] font-black uppercase">Odômetro</span>
                                      </div>
                                      <p className="text-sm font-black text-slate-700">{(vehicle.odometer || 0).toLocaleString()} km</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Condutor Escalado:</p>
                                    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-2xl">
                                      <div className="bg-primary/20 p-2 rounded-xl text-primary">
                                        <User className="h-4 w-4" />
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-slate-700">{vehicle.assignedDriverName || "Aguardando Plantão"}</p>
                                        <p className="text-[9px] font-medium text-primary uppercase">Plantão Logística</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Coluna 2: Manutenção e Revisão */}
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Wrench className="h-4 w-4" /> Plano de Manutenção
                                  </h4>
                                  <div className="bg-amber-600 rounded-[2.5rem] p-5 space-y-5 shadow-xl shadow-amber-100/50 text-white">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="bg-white/20 p-2.5 rounded-2xl">
                                          <Calendar className="h-6 w-6" />
                                        </div>
                                        <div>
                                          <p className="text-[9px] font-black text-amber-100 uppercase tracking-tighter leading-none">Próxima Revisão</p>
                                          <p className="text-base font-black">
                                            {vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toLocaleDateString('pt-BR') : 'Não agendada'}
                                          </p>
                                        </div>
                                      </div>
                                      <Badge className="bg-white text-amber-600 border-none font-black text-[10px] h-6 px-3 uppercase">Pendente</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                                      <div className="bg-white/20 p-2.5 rounded-2xl">
                                        <ShieldCheck className="h-6 w-6" />
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-black text-amber-100 uppercase tracking-tighter leading-none">Seguro Municipal</p>
                                        <p className="text-base font-black">Vigente até {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <Button variant="outline" className="w-full h-11 rounded-2xl border-dashed border-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all">
                                    Registrar Ocorrência
                                  </Button>
                                </div>

                                {/* Coluna 3: Histórico e IA */}
                                <div className="space-y-4 bg-slate-50 p-5 rounded-3xl border border-slate-200/50">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Droplets className="h-4 w-4" /> Higienização & IA
                                  </h4>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase">Última Sanitização</span>
                                        <span className="text-[9px] text-muted-foreground">Protocolo COVID/Gripe</span>
                                      </div>
                                      <span className="text-[10px] font-black text-slate-400">
                                        {vehicle.lastSanitization ? new Date(vehicle.lastSanitization).toLocaleDateString('pt-BR') : 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                                      <span className="text-[10px] font-bold text-slate-600 uppercase">Última Revisão</span>
                                      <span className="text-[10px] font-black text-slate-400">
                                        {vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance).toLocaleDateString('pt-BR') : 'N/A'}
                                      </span>
                                    </div>
                                    <Separator className="my-2 bg-slate-200" />
                                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">IA: Prognóstico Técnico</p>
                                      <p className="text-[11px] font-medium text-slate-600 italic leading-relaxed">
                                        &quot;O veículo apresenta desgaste normal. Sugerimos revisão do sistema de freios na próxima parada técnica devido à quilometragem atual.&quot;
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Seção Extra: Manifesto de Missão em Rota */}
                              {vehicle.status === 'IN_USE' && (
                                <div className="mt-6 space-y-4 bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 animate-in slide-in-from-bottom-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                      <ClipboardList className="h-4 w-4" /> Manifesto de Missão Ativa
                                    </h4>
                                    <Badge className="bg-blue-600 text-white border-none text-[9px] font-black uppercase">Rota em Progresso</Badge>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {MOCK_MANIFEST.map((stop, i) => (
                                      <Card key={i} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                        <CardContent className="p-4 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Badge variant="outline" className={cn(
                                              "text-[8px] font-black uppercase px-2",
                                              stop.type === 'COLETA' ? "text-emerald-600 border-emerald-100 bg-emerald-50" : "text-blue-600 border-blue-100 bg-blue-50"
                                            )}>
                                              {stop.type}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                              <Clock className="h-3 w-3" /> {stop.time}
                                            </span>
                                          </div>
                                          <p className="text-xs font-black text-slate-700 truncate">{stop.patient}</p>
                                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{stop.location}</span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground font-medium italic">
                      Nenhum veículo encontrado real cadastrado no sistema.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
