"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Hospital, 
  User, 
  Ambulance, 
  ShieldCheck, 
  Plus, 
  Edit,
  BrainCircuit, 
  Zap, 
  Loader2, 
  Globe,
  Database,
  RefreshCw,
  Trophy,
  Play,
  FileJson,
  Cpu,
  Thermometer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { runModelTest } from "@/ai/flows/model-tester-flow";
import { cn } from "@/lib/utils";
import { Vehicle, UBS, Driver } from "@/lib/types";
import { ubsService } from "@/services/ubs-service";
import { driverService } from "@/services/driver-service";
import { vehicleService } from "@/services/vehicle-service";
import { systemSettingsService, SystemSettings, DEFAULT_SYSTEM_SETTINGS } from "@/services/system-settings-service";

const AI_MODELS = [
  { id: "nvidia/nemotron-nano-9b-v2:free", name: "Nemotron Nano 9B V2 (Padrão)" },
  { id: "nvidia/nemotron-3.5-lightning:free", name: "NVIDIA Nemotron 3.5 Lightning" },
  { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B (Ultra Rápido)" },
  { id: "google/gemma-2-9b-it:free", name: "Google Gemma 2 9B" },
];

type SettingsTab = "ia-hybrid" | "units" | "drivers" | "fleet";

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("ia-hybrid");

  // AI Settings State (inicializado imediatamente com defaults para abertura instantânea)
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [localModels, setLocalModels] = useState<any[]>([]);
  const [isSyncingModels, setIsSyncingModels] = useState(false);

  // Lazy-loaded Tab Data States
  const [units, setUnits] = useState<UBS[]>([]);
  const [unitsLoaded, setUnitsLoaded] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoaded, setDriversLoaded] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Arena State
  const [arenaRunning, setArenaRunning] = useState(false);
  const [arenaResults, setArenaResults] = useState<any[]>([]);

  // Dialog States & Saving Guards
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [isSavingUnit, setIsSavingUnit] = useState(false);
  const [newUnit, setNewUnit] = useState<Partial<UBS>>({ 
    name: "", address: "", managerName: "", phone: "", email: "", operatingHours: "07:00 - 17:00", type: 'UBS' 
  });
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [isSavingDriver, setIsSavingDriver] = useState(false);
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({ name: "", licenseNumber: "", phone: "" });
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({ 
    licensePlate: "", type: "Ambulância", capacity: 1, status: "AVAILABLE", odometer: 0, fuelLevel: 100 
  });

  useEffect(() => {
    const tabParam = new URLSearchParams(window.location.search).get("tab");
    if (tabParam === "units" || tabParam === "drivers" || tabParam === "fleet" || tabParam === "ia-hybrid") {
      setActiveTab(tabParam);
    }

    let cancelled = false;
    systemSettingsService.getSettings()
      .then((sData) => {
        if (!cancelled) setSettings(sData);
      })
      .catch((error) => {
        console.error("Settings: Erro ao carregar configurações:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadUnitsTab = useCallback(async (forceRefresh: boolean = false) => {
    setLoadingUnits(true);
    try {
      const data = await ubsService.getUnits(forceRefresh);
      setUnits(data);
      setUnitsLoaded(true);
    } catch (error) {
      console.error("Settings: Erro ao carregar unidades:", error);
    } finally {
      setLoadingUnits(false);
    }
  }, []);

  const loadDriversTab = useCallback(async (forceRefresh: boolean = false) => {
    setLoadingDrivers(true);
    try {
      const data = await driverService.getDrivers(forceRefresh);
      setDrivers(data);
      setDriversLoaded(true);
    } catch (error) {
      console.error("Settings: Erro ao carregar motoristas:", error);
    } finally {
      setLoadingDrivers(false);
    }
  }, []);

  const loadVehiclesTab = useCallback(async (forceRefresh: boolean = false) => {
    setLoadingVehicles(true);
    try {
      const data = await vehicleService.getVehicles(forceRefresh);
      setVehicles(data);
      setVehiclesLoaded(true);
    } catch (error) {
      console.error("Settings: Erro ao carregar veículos:", error);
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "units" && !unitsLoaded) {
      loadUnitsTab();
    } else if (activeTab === "drivers" && !driversLoaded) {
      loadDriversTab();
    } else if (activeTab === "fleet" && !vehiclesLoaded) {
      loadVehiclesTab();
    }
  }, [activeTab, unitsLoaded, driversLoaded, vehiclesLoaded, loadUnitsTab, loadDriversTab, loadVehiclesTab]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await systemSettingsService.updateSettings(settings);
      toast({ 
        title: "Configurações Salvas", 
        description: `O motor ${settings.aiProvider} foi atualizado com sucesso.` 
      });
    } catch (error) {
      console.error("Settings: Falha ao salvar", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao Salvar", 
        description: "Falha na comunicação com o banco de dados municipal." 
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0) return 'Tamanho N/I';
    return (bytes / (1024 ** 3)).toFixed(2) + ' GB';
  };

  const handleSyncOllama = async () => {
    if (!settings?.ollamaBaseUrl) {
      toast({ variant: "destructive", title: "Ação Necessária", description: "Informe a URL do servidor Ollama primeiro." });
      return;
    }
    
    setIsSyncingModels(true);
    try {
      const baseUrl = settings.ollamaBaseUrl.endsWith('/') ? settings.ollamaBaseUrl.slice(0, -1) : settings.ollamaBaseUrl;
      const headers: any = { "ngrok-skip-browser-warning": "true" };
      
      if (settings.ollamaApiKey) {
        headers["Authorization"] = settings.ollamaApiKey.startsWith('Bearer ') 
          ? settings.ollamaApiKey 
          : `Bearer ${settings.ollamaApiKey}`;
      }

      const response = await fetch(`${baseUrl}/api/tags`, { headers });
      if (!response.ok) throw new Error("Servidor Ollama inacessível.");
      
      const data = await response.json();
      if (data.models) {
        setLocalModels(data.models);
        toast({ title: "Sincronização Concluída", description: `Detectados ${data.models.length} modelos locais.` });
      }
    } catch (error) {
      console.error("Settings: Falha ao sincronizar modelos Ollama:", error);
      toast({ 
        variant: "destructive", 
        title: "Falha na Conexão", 
        description: "Verifique se o servidor Ollama está rodando e se a URL está correta (use https para Ngrok)." 
      });
    } finally {
      setIsSyncingModels(false);
    }
  };

  const handleRunArena = async () => {
    setArenaRunning(true);
    setArenaResults([]);
    const results = [];
    
    for (const model of AI_MODELS) {
      try {
        const res = await runModelTest("Responda apenas 'OK'", model.id);
        results.push({
          name: model.name,
          id: model.id,
          latency: res.latency,
          status: res.error ? 'ERROR' : 'SUCCESS',
          error: res.error
        });
      } catch (err: any) {
        console.error(`Arena: Erro ao testar modelo ${model.id}:`, err);
        results.push({ name: model.name, id: model.id, latency: 0, status: 'ERROR', error: err.message });
      }
      setArenaResults([...results]);
    }
    setArenaRunning(false);
    toast({ title: "Torneio Finalizado", description: "O ranking de eficiência foi atualizado." });
  };

  const handleExportJson = () => {
    const diagnostic = {
      reportId: `DIAG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      municipalEntity: "Prefeitura de Rio Claro - RJ",
      department: "Secretaria de Ordem Pública",
      systemContext: {
        activeModel: settings?.aiModelId,
        provider: settings?.aiProvider,
        environment: "BETA_PRODUCTION"
      },
      diagnostics: {
        totalModelsTested: AI_MODELS.length,
        successfulRequests: arenaResults.filter(r => r.status === 'SUCCESS').length,
        failedRequests: arenaResults.filter(r => r.status === 'ERROR').length,
      },
      rawResults: arenaResults
    };

    const blob = new Blob([JSON.stringify(diagnostic, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostico-ia-rioclaro-${Date.now()}.json`;
    link.click();
  };

  const handleAddUnit = async () => {
    if (isSavingUnit) return;
    setIsSavingUnit(true);
    try {
      if (newUnit.id) {
        await ubsService.updateUnit(newUnit.id, newUnit);
        setUnits(prev => prev.map(u => (u.id === newUnit.id ? { ...u, ...newUnit } as UBS : u)));
      } else {
        const unitPayload = {
          name: newUnit.name || "",
          address: newUnit.address || "",
          managerName: newUnit.managerName,
          phone: newUnit.phone,
          email: newUnit.email,
          operatingHours: newUnit.operatingHours || "07:00 - 17:00",
          type: (newUnit.type || "UBS") as UBS["type"],
          status: 'active' as const,
        };
        const newId = await ubsService.addUnit(unitPayload);
        setUnits(prev => [...prev, { id: newId, ...unitPayload }].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsUnitDialogOpen(false);
      setNewUnit({ name: "", address: "", managerName: "", phone: "", email: "", operatingHours: "07:00 - 17:00", type: 'UBS' });
      toast({ title: "Sucesso", description: "Unidade salva no Firestore." });
    } catch (error) {
      console.error("Settings: Falha ao salvar unidade:", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar unidade." });
    } finally {
      setIsSavingUnit(false);
    }
  };

  const handleAddDriver = async () => {
    if (isSavingDriver) return;
    setIsSavingDriver(true);
    try {
      if (newDriver.id) {
        await driverService.updateDriver(newDriver.id, newDriver);
        setDrivers(prev => prev.map(d => (d.id === newDriver.id ? { ...d, ...newDriver } as Driver : d)));
      } else {
        const driverPayload = {
          name: newDriver.name || "",
          licenseNumber: newDriver.licenseNumber || "",
          phone: newDriver.phone || "",
          available: true,
          status: 'AVAILABLE' as const,
        };
        const newId = await driverService.addDriver(driverPayload);
        setDrivers(prev => [...prev, { id: newId, ...driverPayload }].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsDriverDialogOpen(false);
      setNewDriver({ name: "", licenseNumber: "", phone: "" });
      toast({ title: "Sucesso", description: "Motorista cadastrado." });
    } catch (error) {
      console.error("Settings: Falha ao salvar motorista:", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar motorista." });
    } finally {
      setIsSavingDriver(false);
    }
  };

  const handleAddVehicle = async () => {
    if (isSavingVehicle) return;
    setIsSavingVehicle(true);
    try {
      if (newVehicle.id) {
        await vehicleService.updateVehicle(newVehicle.id, newVehicle);
        setVehicles(prev => prev.map(v => (v.id === newVehicle.id ? { ...v, ...newVehicle } as Vehicle : v)));
      } else {
        const vehiclePayload = {
          licensePlate: (newVehicle.licensePlate || "").toUpperCase(),
          type: (newVehicle.type || "Ambulância") as Vehicle["type"],
          capacity: newVehicle.capacity || 1,
          available: true,
          status: 'AVAILABLE' as const,
          odometer: newVehicle.odometer || 0,
          fuelLevel: newVehicle.fuelLevel || 100,
        };
        const newId = await vehicleService.addVehicle(vehiclePayload);
        setVehicles(prev => [...prev, { id: newId, ...vehiclePayload }].sort((a, b) => a.licensePlate.localeCompare(b.licensePlate)));
      }
      setIsVehicleDialogOpen(false);
      setNewVehicle({ licensePlate: "", type: "Ambulância", capacity: 1, status: "AVAILABLE", odometer: 0, fuelLevel: 100 });
      toast({ title: "Sucesso", description: "Veículo adicionado à frota." });
    } catch (error) {
      console.error("Settings: Falha ao salvar veículo:", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar veículo." });
    } finally {
      setIsSavingVehicle(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Painel Administrativo</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Configurações de infraestrutura e motor de IA Híbrido.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="space-y-4 sm:space-y-6">
        <TabsList className="bg-white border p-2 h-auto flex flex-col sm:flex-row sm:h-12 shadow-sm rounded-2xl gap-1 overflow-hidden">
          <TabsTrigger value="ia-hybrid" className="gap-2 px-6"><BrainCircuit className="h-4 w-4" /> Motor Híbrido</TabsTrigger>
          <TabsTrigger value="units" className="gap-2 px-6"><Hospital className="h-4 w-4" /> Unidades</TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2 px-6"><User className="h-4 w-4" /> Motoristas</TabsTrigger>
          <TabsTrigger value="fleet" className="gap-2 px-6"><Ambulance className="h-4 w-4" /> Frota</TabsTrigger>
        </TabsList>

        <TabsContent value="ia-hybrid" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-primary/5 p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2.5 rounded-2xl text-white shadow-lg">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Gateway de Inteligência</CardTitle>
                    <CardDescription className="text-xs">Defina o provedor ativo para Rio Claro.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Provedor de Serviço</Label>
                    <Select 
                      value={settings.aiProvider} 
                      onValueChange={(val) => setSettings({...settings, aiProvider: val as any})}
                    >
                      <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="OPENROUTER">OpenRouter (Cloud)</SelectItem>
                        <SelectItem value="GOOGLE">Google Gemini (Cloud)</SelectItem>
                        <SelectItem value="OLLAMA">Ollama (Servidor Local)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {settings.aiProvider === 'OLLAMA' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Ollama URL (com https://)</Label>
                          <Input 
                            placeholder="https://seu-tunnel.ngrok-free.dev" 
                            className="h-12 rounded-2xl bg-muted/20 border-none"
                            value={settings.ollamaBaseUrl || ""}
                            onChange={(e) => setSettings({...settings, ollamaBaseUrl: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">API Key / Proxy Token</Label>
                          <Input 
                            type="password"
                            placeholder="Opcional" 
                            className="h-12 rounded-2xl bg-muted/20 border-none"
                            value={settings.ollamaApiKey || ""}
                            onChange={(e) => setSettings({...settings, ollamaApiKey: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Permanência em VRAM</Label>
                            <Select 
                              value={settings.ollamaKeepAlive} 
                              onValueChange={(val) => setSettings({...settings, ollamaKeepAlive: val})}
                            >
                              <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5m">5 minutos (Padrão)</SelectItem>
                                <SelectItem value="-1">Aquecido Indefinidamente (Servidor Sempre Pronto)</SelectItem>
                                <SelectItem value="30m">30 minutos</SelectItem>
                                <SelectItem value="0">Descarregar Imediatamente</SelectItem>
                              </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Temperatura: {settings.ollamaTemperature}</Label>
                              <Thermometer className="h-3 w-3 text-primary" />
                            </div>
                            <Slider 
                              value={[settings.ollamaTemperature || 0.7]} 
                              max={1} 
                              step={0.1} 
                              onValueChange={(val) => setSettings({...settings, ollamaTemperature: val[0]})}
                              className="py-2"
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Peso Selecionado (Hardware Local)</Label>
                        <div className="flex gap-2">
                          <Select 
                            value={settings.aiModelId} 
                            onValueChange={(val) => setSettings({...settings, aiModelId: val})}
                          >
                            <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none flex-1">
                              <SelectValue placeholder="Sincronize modelos..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {localModels.map(m => (
                                <SelectItem key={m.name} value={m.name}>
                                  <div className="flex items-center gap-2">
                                    <Cpu className="h-3 w-3 opacity-50" />
                                    <span>{m.name} ({formatBytes(m.size)})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-12 w-12 rounded-2xl"
                            onClick={handleSyncOllama}
                            disabled={isSyncingModels}
                            title="Buscar modelos no servidor local"
                          >
                            <RefreshCw className={cn("h-4 w-4", isSyncingModels && "animate-spin")} />
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic px-1">O sistema suporta modelos Vision e Deep Think via Ollama.</p>
                      </div>
                    </div>
                  )}

                  {settings.aiProvider !== 'OLLAMA' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Modelo Cloud Ativo</Label>
                      <Select 
                        value={settings.aiModelId} 
                        onValueChange={(val) => setSettings({...settings, aiModelId: val})}
                      >
                        <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {AI_MODELS.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button 
                    className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-primary/20"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                  >
                    {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    Persistir Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-slate-900 text-white">
              <CardHeader className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-lg">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Privacidade Rio Claro</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Protocolo PII Masking Ativo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-white/5 p-4 rounded-2xl italic text-xs text-slate-300">
                  &quot;Toda informação enviada ao motor de IA passa por uma camada de filtragem que mascara dados sensíveis dos cidadãos.&quot;
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-black uppercase">Filtragem de CPF</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">ATIVO</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] font-black uppercase">Filtragem de Email</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">ATIVO</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 p-2.5 rounded-2xl text-white shadow-lg">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Arena SGov: Ranking de IA</CardTitle>
                  <CardDescription className="text-xs uppercase font-bold text-muted-foreground">Benchmark Municipal de Performance</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="h-10 rounded-xl gap-2 font-bold text-[10px] uppercase"
                   onClick={handleExportJson}
                   disabled={arenaResults.length === 0}
                 >
                   <FileJson className="h-4 w-4" /> Diagnóstico JSON
                 </Button>
                 <Button 
                   className="h-10 rounded-xl gap-2 font-black text-[10px] uppercase shadow-lg"
                   onClick={handleRunArena}
                   disabled={arenaRunning}
                 >
                   {arenaRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                   {arenaRunning ? "Testando..." : "Iniciar Torneio"}
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                   <Zap className="h-5 w-5 text-amber-500" />
                 </div>
                 <p className="text-xs text-amber-800 font-medium leading-tight">
                   Esta arena testa a latência real dos modelos contra o servidor de Rio Claro. Note que modelos locais dependem da sua GPU.
                 </p>
               </div>
               <div className="overflow-x-auto">
                 <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="border-none">
                        <TableHead className="font-bold pl-8 text-[10px] uppercase tracking-widest">Posição</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Modelo de Inteligência</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Latência (ms)</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                        <TableHead className="text-right pr-8 font-bold text-[10px] uppercase tracking-widest">Eficiência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {arenaResults.length > 0 ? (
                         [...arenaResults].sort((a,b) => a.latency - b.latency).map((res, idx) => (
                           <TableRow key={res.id} className="hover:bg-primary/5 transition-colors">
                             <TableCell className="pl-8">
                               <Badge className={cn(
                                 "border-none font-black text-[10px]",
                                 idx === 0 ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-600"
                               )}>
                                 #{idx + 1}
                               </Badge>
                             </TableCell>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <span className="font-bold text-sm">{res.name}</span>
                                 {res.id === settings.aiModelId && <Badge className="bg-primary/10 text-primary text-[8px] h-4">ATIVO</Badge>}
                               </div>
                             </TableCell>
                             <TableCell className="font-mono text-xs font-black">
                               {res.status === 'SUCCESS' ? `${res.latency} ms` : "---"}
                             </TableCell>
                             <TableCell>
                               <Badge className={cn(
                                 "border-none text-[8px] font-black uppercase",
                                 res.status === 'SUCCESS' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                               )}>
                                 {res.status === 'SUCCESS' ? 'Excelente' : 'Falha'}
                               </Badge>
                             </TableCell>
                             <TableCell className="text-right pr-8">
                               {res.status === 'SUCCESS' && (
                                 <div className="inline-flex items-center gap-2">
                                   <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(10, 100 - (res.latency / 10))}%` }} />
                                   </div>
                                 </div>
                               )}
                             </TableCell>
                           </TableRow>
                         ))
                       ) : (
                         <TableRow>
                           <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic text-xs uppercase tracking-widest">
                             Clique em &quot;Iniciar Torneio&quot; para medir a performance
                           </TableCell>
                         </TableRow>
                       )}
                    </TableBody>
                 </Table>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
           <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b bg-muted/5">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">Unidades de Saúde (UBS)</CardTitle>
                <CardDescription className="text-xs">Gestão da rede municipal de Rio Claro.</CardDescription>
              </div>
              <Dialog open={isUnitDialogOpen} onOpenChange={(open) => {
                setIsUnitDialogOpen(open);
                if (!open) setNewUnit({ name: "", address: "", managerName: "", phone: "", email: "", operatingHours: "07:00 - 17:00", type: 'UBS' });
              }}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto gap-2 h-11 rounded-2xl shadow-md">
                    <Plus className="h-4 w-4" /> Adicionar UBS
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[2rem]">
                  {isUnitDialogOpen && (
                    <>
                      <DialogHeader>
                        <DialogTitle>{newUnit.id ? "Editar Unidade" : "Nova Unidade de Saúde"}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2"><Label>Nome</Label><Input className="rounded-xl" value={newUnit.name} onChange={e => setNewUnit(p => ({...p, name: e.target.value}))} /></div>
                          <div className="grid gap-2"><Label>Tipo</Label><Input className="rounded-xl" value={newUnit.type} onChange={e => setNewUnit(p => ({...p, type: e.target.value as any}))} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Endereço</Label><Input className="rounded-xl" value={newUnit.address} onChange={e => setNewUnit(p => ({...p, address: e.target.value}))} /></div>
                      </div>
                      <DialogFooter>
                        <Button className="rounded-xl" onClick={handleAddUnit} disabled={isSavingUnit}>
                          {isSavingUnit && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Salvar
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {loadingUnits ? (
                <div className="py-12 flex items-center justify-center gap-2 text-xs text-muted-foreground font-bold uppercase">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Carregando unidades...
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30"><TableRow className="border-none"><TableHead className="font-bold pl-8">Nome</TableHead><TableHead className="font-bold">Responsável</TableHead><TableHead className="text-right pr-8 font-bold">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {units.map(unit => (
                      <TableRow key={unit.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-bold text-sm pl-8">{unit.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{unit.managerName || "Não definido"}</TableCell>
                        <TableCell className="text-right pr-8"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setNewUnit(unit); setIsUnitDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b bg-muted/5">
              <div><CardTitle className="text-xl font-black uppercase tracking-tight">Corpo de Motoristas</CardTitle></div>
              <Dialog open={isDriverDialogOpen} onOpenChange={(open) => {
                setIsDriverDialogOpen(open);
                if (!open) setNewDriver({ name: "", licenseNumber: "", phone: "" });
              }}>
                <DialogTrigger asChild><Button className="w-full sm:w-auto h-11 rounded-2xl shadow-md"><Plus className="h-4 w-4" /> Novo Motorista</Button></DialogTrigger>
                <DialogContent className="rounded-[2rem]">
                  {isDriverDialogOpen && (
                    <>
                      <DialogHeader>
                        <DialogTitle>{newDriver.id ? "Editar Motorista" : "Novo Motorista"}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2"><Label>Nome Completo</Label><Input className="rounded-xl" value={newDriver.name} onChange={e => setNewDriver(p => ({...p, name: e.target.value}))} /></div>
                        <div className="grid gap-2"><Label>CNH</Label><Input className="rounded-xl" value={newDriver.licenseNumber} onChange={e => setNewDriver(p => ({...p, licenseNumber: e.target.value}))} /></div>
                      </div>
                      <DialogFooter>
                        <Button className="rounded-xl" onClick={handleAddDriver} disabled={isSavingDriver}>
                          {isSavingDriver && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Salvar
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {loadingDrivers ? (
                <div className="py-12 flex items-center justify-center gap-2 text-xs text-muted-foreground font-bold uppercase">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Carregando motoristas...
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30"><TableRow className="border-none"><TableHead className="font-bold pl-8">Nome</TableHead><TableHead className="font-bold">Status</TableHead><TableHead className="text-right pr-8 font-bold">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {drivers.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="text-sm font-bold pl-8">{d.name}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] rounded-lg px-2 border-primary/20 text-primary">{d.status}</Badge></TableCell>
                        <TableCell className="text-right pr-8"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setNewDriver(d); setIsDriverDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b bg-muted/5">
              <div><CardTitle className="text-xl font-black uppercase tracking-tight">Frota Municipal</CardTitle></div>
              <Dialog open={isVehicleDialogOpen} onOpenChange={(open) => {
                setIsVehicleDialogOpen(open);
                if (!open) setNewVehicle({ licensePlate: "", type: "Ambulância", capacity: 1, status: "AVAILABLE", odometer: 0, fuelLevel: 100 });
              }}>
                <DialogTrigger asChild><Button className="w-full sm:w-auto h-11 rounded-2xl shadow-md"><Plus className="h-4 w-4" /> Novo Veículo</Button></DialogTrigger>
                <DialogContent className="rounded-[2rem]">
                  {isVehicleDialogOpen && (
                    <>
                      <DialogHeader>
                        <DialogTitle>{newVehicle.id ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2"><Label>Placa</Label><Input className="rounded-xl" value={newVehicle.licensePlate} onChange={e => setNewVehicle(p => ({...p, licensePlate: e.target.value}))} /></div>
                          <div className="grid gap-2"><Label>Capacidade</Label><Input className="rounded-xl" type="number" value={newVehicle.capacity} onChange={e => setNewVehicle(p => ({...p, capacity: parseInt(e.target.value) || 1}))} /></div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button className="rounded-xl" onClick={handleAddVehicle} disabled={isSavingVehicle}>
                          {isSavingVehicle && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Salvar
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {loadingVehicles ? (
                <div className="py-12 flex items-center justify-center gap-2 text-xs text-muted-foreground font-bold uppercase">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Carregando frota...
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30"><TableRow className="border-none"><TableHead className="font-bold pl-8">Placa</TableHead><TableHead className="font-bold">Tipo</TableHead><TableHead className="text-right pr-8 font-bold">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {vehicles.map(v => (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono text-sm font-bold pl-8 uppercase">{v.licensePlate}</TableCell>
                        <TableCell className="text-sm font-medium">{v.type}</TableCell>
                        <TableCell className="text-right pr-8"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setNewVehicle(v); setIsVehicleDialogOpen(true); }}><Edit className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
