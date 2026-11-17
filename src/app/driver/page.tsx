"use client";

import { useState, useEffect } from "react";
import { 
  Ambulance, 
  Zap, 
  BrainCircuit, 
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Navigation,
  LogOut,
  Heart,
  Star,
  ShieldCheck,
  Loader2,
  Gauge,
  Fuel,
  Coins,
  FileText,
  ShieldAlert,
  Wrench,
  Clock,
  MapPin,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { generateDriverBriefing, DriverBriefingOutput } from "@/ai/flows/generate-driver-briefing-flow";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { reportService } from "@/services/report-service";
import { Separator } from "@/components/ui/separator";

const MOCK_MISSION = [
  { id: "S1", name: "UBS Lídice", type: 'PICKUP', patient: "Benedito Silva", time: "08:00", address: "Distrito de Lídice, Rio Claro - RJ", boarded: false },
  { id: "S2", name: "Hospital Municipal", type: 'DROPOFF', patient: "Benedito Silva", time: "08:45", address: "Centro, Rio Claro - RJ", boarded: false },
  { id: "S3", name: "UBS Central", type: 'PICKUP', patient: "Maria de Fátima", time: "09:30", address: "Av. Principal, Centro", boarded: false },
  { id: "S4", name: "Clínica Hemodiálise", type: 'DROPOFF', patient: "Maria de Fátima", time: "10:00", address: "Bairro do Sul", boarded: false },
];

const MOCK_MAINTENANCE = [
  { id: "M1", type: 'Óleo', date: '2024-05-10', odometer: 12100, description: 'Troca de óleo sintético 5W30 e filtro.' },
  { id: "M2", type: 'Pneus', date: '2024-04-15', odometer: 11800, description: 'Alinhamento e balanceamento preventivo.' },
  { id: "M3", type: 'Freios', date: '2024-03-02', odometer: 10500, description: 'Troca de pastilhas dianteiras.' },
];

export default function DriverDashboard() {
  const [mounted, setMounted] = useState(false);
  const [briefing, setBriefing] = useState<DriverBriefingOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [checklistDone, setChecklistDone] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [startOdometer, setStartOdometer] = useState("");
  const [endOdometer, setEndOdometer] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);
  
  // Requisition States
  const [fuelValue, setFuelValue] = useState("");
  const [dailyAllowanceValue, setDailyAllowanceValue] = useState("");
  const [isFuelDialogOpen, setIsFuelDialogOpen] = useState(false);
  const [isDailyDialogOpen, setIsDailyDialogOpen] = useState(false);

  // New Features States
  const [missionStops, setMissionStops] = useState(MOCK_MISSION);
  const [isSOSDialogOpen, setIsSOSDialogOpen] = useState(false);
  const [sosReason, setSOSReason] = useState("");
  const [isSOSSending, setIsSOSSending] = useState(false);

  const { toast } = useToast();
  const { logout, user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenMaps = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const getBriefing = async () => {
    setLoadingAi(true);
    try {
      const result = await generateDriverBriefing({
        driverName: user?.name || "Condutor",
        vehicleType: "Ambulância Municipal",
        passengers: [{ maskedName: "Benedito", needs: ["Maca", "Oxigênio"], urgency: "crítica" }],
        routeDetails: "Itinerário entre Lídice e Centro."
      });
      setBriefing(result);
    } catch (error) {
      console.error("Erro ao gerar briefing da IA:", error);
      toast({ title: "Erro na IA", variant: "destructive" });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleStartManifest = () => {
    if (!startOdometer) {
      toast({ title: "Atenção", description: "Informe a quilometragem inicial.", variant: "destructive" });
      return;
    }
    setChecklistDone(true);
    toast({ title: "Jornada Iniciada", description: "Manifesto ativo. Boa viagem!" });
  };

  const handleBoarding = async (stopId: string) => {
    const stop = missionStops.find(s => s.id === stopId);
    if (!stop) return;

    try {
      await reportService.addBoardingLog({
        requestId: stopId,
        patientName: stop.patient,
        timestamp: new Date().toISOString(),
        lat: -22.72 + (Math.random() * 0.1),
        lng: -44.13 + (Math.random() * 0.1)
      });

      setMissionStops(prev => prev.map(s => s.id === stopId ? { ...s, boarded: true } : s));
      toast({ title: "Confirmado", description: `Check-in de ${stop.patient} realizado.` });
    } catch (error) {
      console.error("Erro ao registrar embarque:", error);
      toast({ title: "Erro", description: "Falha ao registrar embarque.", variant: "destructive" });
    }
  };

  const handleSOS = async () => {
    if (!sosReason.trim()) {
      toast({ title: "Atenção", description: "Descreva brevemente a emergência.", variant: "destructive" });
      return;
    }

    setIsSOSSending(true);
    try {
      await reportService.addReport({
        driverId: user?.uid || "DRIVER",
        driverName: user?.name || user?.email || "Motorista Municipal",
        vehicleId: "Viatura Local",
        content: `🚨 ALERTA SOS: ${sosReason}`,
        timestamp: new Date().toISOString(),
        type: 'SOS'
      });

      setIsSOSDialogOpen(false);
      setSOSReason("");
      toast({ title: "Alerta Enviado", description: "A Central foi notificada e está enviando suporte.", variant: "destructive" });
    } catch (error) {
      console.error("Erro ao enviar alerta SOS:", error);
      toast({ title: "Erro", description: "Falha ao enviar SOS. Tente contato via rádio.", variant: "destructive" });
    } finally {
      setIsSOSSending(false);
    }
  };

  const handleFinalizeMission = async () => {
    if (!endOdometer || !feedbackNote.trim()) {
      toast({ title: "Atenção", description: "Informe a quilometragem final e relate o turno.", variant: "destructive" });
      return;
    }

    if (Number(endOdometer) <= Number(startOdometer)) {
      toast({ title: "Erro", description: "A quilometragem final deve ser maior que a inicial.", variant: "destructive" });
      return;
    }

    setIsSendingFeedback(true);
    try {
      await reportService.addReport({
        driverId: user?.uid || "DRIVER",
        driverName: user?.name || user?.email || "Motorista Municipal",
        vehicleId: "Viatura Local",
        content: `KM Final: ${endOdometer}. Relato: ${feedbackNote}`,
        timestamp: new Date().toISOString()
      });

      setIsFeedbackOpen(false);
      setMissionComplete(true);
    } catch (error: any) {
      console.error("Erro ao finalizar missão:", error);
      toast({ title: "Erro no envio", description: error.message, variant: "destructive" });
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleRequestFuel = () => {
    toast({ title: "Requisição Enviada", description: `Pedido de R$ ${fuelValue} em combustível encaminhado para aprovação.` });
    setIsFuelDialogOpen(false);
    setFuelValue("");
  };

  const handleRequestDaily = () => {
    toast({ title: "Diária Solicitada", description: `Requisição de diária enviada com sucesso.` });
    setIsDailyDialogOpen(false);
    setDailyAllowanceValue("");
  };

  if (!mounted) return null;

  if (missionComplete) {
    return (
      <div className="space-y-8 py-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-primary text-white p-6 rounded-full shadow-2xl">
              <CheckCircle2 className="h-16 w-16" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Missão Cumprida!</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Seu trabalho hoje garantiu o acesso à saúde para cidadãos de Rio Claro.
            </p>
          </div>

          <Card className="w-full border-none bg-accent/20 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-center gap-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-primary text-primary" />)}
              </div>
              <p className="text-sm font-semibold text-primary italic">
                &quot;Excelente conduta. Informações sincronizadas com sucesso.&quot;
              </p>
            </CardContent>
          </Card>

          <div className="w-full pt-4 space-y-4">
            <Button className="w-full h-14 text-lg font-bold gap-2" onClick={() => window.location.reload()}>
              <Ambulance className="h-5 w-5" /> Nova Jornada
            </Button>
            <Button variant="outline" className="w-full h-12 font-semibold gap-2 border-none" onClick={logout}>
              <LogOut className="h-4 w-4" /> Sair do Sistema
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-black pt-6">
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> PMRC & bull; Saúde & Ordem Pública
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Minha Jornada</h2>
          <p className="text-xs text-slate-500">Rio Claro, RJ & bull; {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</p>
        </div>
        <Badge variant={checklistDone ? "default" : "outline"} className={cn(checklistDone ? "bg-emerald-600 text-white" : "bg-accent/20 text-primary border-primary/20")}>
          {checklistDone ? "EM ROTA" : "PREPARAÇÃO"}
        </Badge>
      </div>

      {!checklistDone ? (
        <Card className="border-2 border-primary/20 bg-primary/5 shadow-none rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-tighter">
              <ClipboardCheck className="h-5 w-5" /> Segurança Municipal
            </CardTitle>
            <CardDescription className="text-primary/70 text-xs">Verificação obrigatória antes da partida.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {["Pneus", "Sistema de Freios", "Equipamentos Clínicos", "Higienização"].map((item, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-primary/5">
                  <Checkbox id={`check-${i}`} className="h-5 w-5" />
                  <label htmlFor={`check-${i}`} className="text-sm font-bold text-slate-700">{item}</label>
                </div>
              ))}
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-primary/10">
              <Label htmlFor="odo-start" className="text-[10px] font-black uppercase text-primary">Quilometragem Inicial (Odômetro)</Label>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input 
                  id="odo-start" 
                  type="number" 
                  placeholder="Ex: 12450" 
                  className="pl-10 h-12 bg-white rounded-xl focus:ring-primary"
                  value={startOdometer}
                  onChange={(e) => setStartOdometer(e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full mt-2 h-14 shadow-lg font-black uppercase text-xs tracking-widest rounded-2xl" onClick={handleStartManifest}>
              Iniciar Manifesto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-2">
            <Card className="flex-1 bg-primary text-primary-foreground border-none shadow-xl rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Ambulance className="h-20 w-20" /></div>
              <CardContent className="pt-6 relative">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl"><Ambulance className="h-8 w-8" /></div>
                  <div className="flex-1">
                    <p className="font-black text-lg leading-none uppercase tracking-tighter">Viatura Operacional</p>
                    <p className="text-[10px] opacity-80 mt-1 uppercase font-bold tracking-widest">Início: {startOdometer} km & bull; {missionStops.length} Paradas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Dialog open={isSOSDialogOpen} onOpenChange={setIsSOSDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="h-auto px-4 rounded-2xl shadow-xl shadow-rose-100 flex flex-col gap-1 items-center justify-center animate-pulse">
                  <ShieldAlert className="h-6 w-6" />
                  <span className="text-[10px] font-black uppercase">SOS</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-w-md w-[95vw]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-rose-600">
                    <ShieldAlert className="h-5 w-5" /> Alerta de Emergência
                  </DialogTitle>
                  <DialogDescription>Use apenas para acidentes ou situações críticas de saúde.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-slate-400">Descreva o Incidente</Label>
                    <Textarea 
                      placeholder="Ex: Pane mecânica na estrada, Paciente passando mal..." 
                      className="min-h-[100px] rounded-2xl border-rose-100 focus:ring-rose-500"
                      value={sosReason}
                      onChange={(e) => setSOSReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="destructive" className="w-full h-12 rounded-xl font-black uppercase tracking-widest" onClick={handleSOS} disabled={isSOSSending}>
                    {isSOSSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Enviar Alerta Crítico"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Seção Administrativa */}
          <div className="grid grid-cols-3 gap-3">
            <Dialog open={isFuelDialogOpen} onOpenChange={setIsFuelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-16 flex flex-col gap-1 border-dashed border-2 border-primary/20 text-primary hover:bg-primary/5 rounded-2xl">
                  <Fuel className="h-5 w-5" />
                  <span className="text-[8px] font-black uppercase">Abastecer</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-w-md w-[95vw]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-primary" /> Requisição de Abastecimento
                  </DialogTitle>
                  <DialogDescription>Solicite autorização para abastecer a viatura.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label>Valor Estimado / Litros</Label>
                    <Input placeholder="Ex: R$ 200,00" value={fuelValue} onChange={(e) => setFuelValue(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Posto Conveniado</Label>
                    <Input placeholder="Ex: Posto Central PMRC" />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full h-12 rounded-xl" onClick={handleRequestFuel}>Enviar Requisição</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDailyDialogOpen} onOpenChange={setIsDailyDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-16 flex flex-col gap-1 border-dashed border-2 border-primary/20 text-primary hover:bg-primary/5 rounded-2xl">
                  <Coins className="h-5 w-5" />
                  <span className="text-[8px] font-black uppercase">Diárias</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-w-md w-[95vw]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" /> Requisição de Diária
                  </DialogTitle>
                  <DialogDescription>Solicite o auxílio para viagens de longa distância.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label>Motivo da Diária</Label>
                    <Input placeholder="Ex: Viagem Intermunicipal / RJ" value={dailyAllowanceValue} onChange={(e) => setDailyAllowanceValue(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Duração Prevista</Label>
                    <Input placeholder="Ex: 12 horas" />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full h-12 rounded-xl" onClick={handleRequestDaily}>Solicitar Diária</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-16 flex flex-col gap-1 border-dashed border-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 rounded-2xl">
                  <Wrench className="h-5 w-5" />
                  <span className="text-[8px] font-black uppercase">Histórico</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-w-md w-[95vw] p-0 overflow-hidden">
                <div className="bg-emerald-600 p-6 text-white">
                  <DialogHeader className="text-left space-y-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white/20 p-2 rounded-xl"><Wrench className="h-5 w-5" /></div>
                      <div>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter">Manutenção V1</DialogTitle>
                        <DialogDescription className="text-emerald-100 text-[10px] uppercase font-bold tracking-widest">Registros de Oficina & bull; PMRC</DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                  {MOCK_MAINTENANCE.map(m => (
                    <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] uppercase">{m.type}</Badge>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(m.date), "dd/MM/yyyy")}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 italic leading-relaxed">&quot;{m.description}&quot;</p>
                      <Separator className="my-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Odômetro: {m.odometer.toLocaleString()} KM</p>
                    </div>
                  ))}
                </div>
                <DialogFooter className="p-6 bg-slate-50 border-t">
                  <Button variant="ghost" className="w-full rounded-xl uppercase text-[10px] font-black">Fechar Consulta</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary fill-primary" /> Briefing da IA
              </h3>
              {!briefing && (
                <Button variant="ghost" size="sm" onClick={getBriefing} disabled={loadingAi} className="text-[10px] font-black h-7 text-primary hover:bg-primary/5">
                  {loadingAi ? <Zap className="h-3 w-3 animate-spin mr-1" /> : <BrainCircuit className="h-4 w-4 mr-1" />} ANALISAR
                </Button>
              )}
            </div>

            {briefing && (
              <Card className="border-l-4 border-l-primary bg-white shadow-md border-none animate-in slide-in-from-top-2 rounded-xl">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 w-fit px-2 py-0.5 rounded">
                    <ShieldCheck className="h-3 w-3" /> Dados Protegidos
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-slate-700">{briefing.summary}</p>
                  <div className="space-y-2">
                    {briefing.criticalAlerts.map((alert, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        {alert}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest px-1">Manifesto de Paradas</h3>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
              {missionStops.map((stop) => (
                <div key={stop.id} className="relative pl-8">
                  <div className={cn(
                    "absolute left-1.5 top-1 size-3 rounded-full border-2 border-white shadow-sm",
                    stop.type === 'PICKUP' ? (stop.boarded ? "bg-emerald-500" : "bg-primary") : "bg-primary/40"
                  )} />
                  <Card className={cn(
                    "border-none shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden",
                    stop.boarded && "bg-emerald-50/30 ring-1 ring-emerald-100"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn(
                                "text-[9px] h-4 py-0 uppercase font-black tracking-widest",
                                stop.boarded && "border-emerald-200 text-emerald-600"
                              )}>
                                {stop.type === 'PICKUP' ? 'Coleta' : 'Entrega'}
                              </Badge>
                              <span className="text-[10px] font-black text-slate-400">{stop.time}</span>
                            </div>
                            {stop.boarded && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                          </div>
                          <p className="font-black text-slate-800 text-sm uppercase tracking-tighter">{stop.name}</p>
                          <p className="text-xs font-medium text-slate-500 mt-1">Cidadão: {stop.patient}</p>
                          
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-10 gap-2 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 rounded-lg"
                              onClick={() => handleOpenMaps(stop.address)}
                            >
                              <Navigation className="h-3 w-3" /> Abrir Trajeto
                            </Button>
                            {stop.type === 'PICKUP' && (
                              <Button 
                                variant={stop.boarded ? "secondary" : "default"}
                                size="sm" 
                                className={cn(
                                  "h-10 gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg",
                                  stop.boarded ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-primary"
                                )}
                                onClick={() => handleBoarding(stop.id)}
                                disabled={stop.boarded}
                              >
                                {stop.boarded ? <Check className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                                {stop.boarded ? "Embarcado" : "Check-in"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-14 gap-2 text-xs font-black uppercase tracking-widest shadow-xl bg-primary hover:bg-primary/90 mt-4 rounded-2xl">
                <CheckCircle2 className="h-5 w-5" /> Finalizar Missão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[95vw] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-black tracking-tighter">
                  <FileText className="h-6 w-6 text-primary" /> Relatório de Viagem
                </DialogTitle>
                <DialogDescription>Confirme os dados de telemetria e o relato operacional.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="odo-end" className="text-xs font-black uppercase text-slate-400">Quilometragem Final (Odômetro)</Label>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input 
                      id="odo-end" 
                      type="number" 
                      placeholder="Ex: 12580" 
                      className="pl-10 h-12 rounded-xl"
                      value={endOdometer}
                      onChange={(e) => setEndOdometer(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-black uppercase text-slate-400">Resumo da Missão</Label>
                  <Textarea 
                    placeholder="Relate ocorrências, falhas mecânicas ou elogios..."
                    className="min-h-[120px] focus:ring-primary rounded-2xl"
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  className="w-full h-12 text-xs font-black uppercase tracking-widest shadow-lg rounded-xl" 
                  onClick={handleFinalizeMission}
                  disabled={isSendingFeedback}
                >
                  {isSendingFeedback ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Enviar e Encerrar Turno
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}