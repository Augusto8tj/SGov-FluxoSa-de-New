"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  Filter, 
  CheckCircle2, 
  History,
  AlertTriangle,
  Loader2,
  BrainCircuit,
  Calendar as CalendarIcon,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  Navigation
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TransportRequest, Patient } from "@/lib/types";
import { classifyUrgency } from "@/ai/flows/classify-urgency-flow";
import { requestService } from "@/services/request-service";
import { patientService } from "@/services/patient-service";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { openAfterDropdownClose } from "@/lib/query-cache";

export default function UbsRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [isWithinWindow, setIsWithinWindow] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [urgency, setUrgency] = useState<string>("low");
  
  // Date-Time States
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date());
  const [selectedHour, setSelectedHour] = useState("08");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRequest, setEditingRequest] = useState<TransportRequest | null>(null);

  const { toast } = useToast();

  const loadData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      const [reqs, pats] = await Promise.all([
        requestService.getRequests(forceRefresh),
        patientService.getPatients(forceRefresh)
      ]);
      // Filtra apenas pedidos desta UBS (Simulado como UBS-01 para o portal)
      setRequests(reqs.filter(r => r.ubsId === "UBS-01" || r.operatorId === "UBS_MGR"));
      setPatients(pats);
    } catch (error) {
      console.error("Erro ao carregar solicitações da UBS:", error);
      toast({ title: "Erro de Conexão", description: "Usando dados locais de demonstração.", variant: "default" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsWithinWindow(hour >= 8 && hour < 13);
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setPatientId("");
    setPickupLocation("");
    setDestination("");
    setPatientNotes("");
    setUrgency("low");
    setSelectedDate(new Date());
    setSelectedHour("08");
    setSelectedMinute("00");
    setScheduledTime(new Date().toISOString());
    setEditingRequest(null);
  };

  const handleAiUrgency = async () => {
    if (!patientNotes || !destination) {
      toast({ title: "Incompleto", description: "Preencha destino e notas para a IA analisar.", variant: "destructive" });
      return;
    }
    setIsClassifying(true);
    try {
      const result = await classifyUrgency({ patientNotes, destination });
      setUrgency(result.suggestedUrgency);
      toast({ 
        title: "IA: Sugestão de Urgência", 
        description: `Classificado como ${result.suggestedUrgency.toUpperCase()} com base no protocolo municipal.` 
      });
    } catch (error) {
      console.error("Erro ao classificar urgência na UBS:", error);
      toast({ variant: "destructive", title: "IA Indisponível", description: "Não foi possível classificar automaticamente." });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSaveCalendarSelection = () => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(selectedHour), parseInt(selectedMinute));
      setScheduledTime(newDate.toISOString());
      setIsCalendarOpen(false);
      toast({ title: "Agendado para", description: format(newDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) });
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!patientId || !destination || !pickupLocation) {
      toast({ title: "Erro", description: "Paciente, Origem e Destino são obrigatórios.", variant: "destructive" });
      return;
    }

    const patient = patients.find(p => p.id === patientId);
    const requestData = {
      patientId,
      patientName: patient?.name || "Paciente",
      ubsId: "UBS-01",
      pickupLocation: pickupLocation,
      destinationLocation: destination,
      requestedTime: scheduledTime || new Date().toISOString(),
      urgencyLevel: urgency as TransportRequest["urgencyLevel"],
      status: editingRequest?.status || ("PENDING" as const),
      operatorId: "UBS_MGR",
      aiRecommendation: patientNotes, 
    };

    setIsSaving(true);
    try {
      if (editingRequest) {
        await requestService.updateRequest(editingRequest.id, requestData);
        setRequests(prev => prev.map(r => (r.id === editingRequest.id ? { ...r, ...requestData, updatedAt: new Date().toISOString() } : r)));
      } else {
        const newId = await requestService.addRequest(requestData as Omit<TransportRequest, "id">);
        const now = new Date().toISOString();
        setRequests(prev => [{ id: newId, ...requestData, createdAt: now, updatedAt: now }, ...prev]);
      }
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Solicitação Enviada", description: "O pedido foi encaminhado para a Secretaria de Saúde." });
    } catch (error) {
      console.error("Erro ao salvar solicitação na UBS:", error);
      toast({ title: "Erro", description: "Falha ao salvar solicitação.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await requestService.deleteRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: "Cancelado", description: "Solicitação removida." });
    } catch (error) {
      console.error("Erro ao cancelar solicitação na UBS:", error);
      toast({ title: "Erro", description: "Não foi possível cancelar.", variant: "destructive" });
    }
  };

  const filteredRequests = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(req => 
      req.patientName.toLowerCase().includes(q) ||
      req.destinationLocation.toLowerCase().includes(q) ||
      req.pickupLocation.toLowerCase().includes(q)
    );
  }, [requests, searchTerm]);

  const patientOptions = useMemo(() => (
    patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
  ), [patients]);

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'critical': return <Badge className="bg-destructive text-destructive-foreground animate-pulse">Crítico</Badge>;
      case 'high': return <Badge variant="destructive">Alta</Badge>;
      case 'medium': return <Badge className="bg-primary text-primary-foreground">Média</Badge>;
      default: return <Badge variant="secondary">Baixa</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 gap-1"><CheckCircle2 className="h-3 w-3" /> Aprovado</Badge>;
      case 'PENDING': return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>;
      case 'COMPLETED': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 gap-1">Concluído</Badge>;
      case 'DENIED': return <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 gap-1"><XCircle className="h-3 w-3" /> Negado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Nossas Solicitações</h2>
          <p className="text-sm text-muted-foreground">Pedidos originados exclusivamente por esta UBS.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isWithinWindow && (
            <Badge variant="destructive" className="h-10 px-4 flex gap-2">
              <AlertTriangle className="h-4 w-4" /> JANELA FECHADA
            </Badge>
          )}
          <Button 
            disabled={!isWithinWindow} 
            className={cn("gap-2 shadow-md h-11 px-6 rounded-xl", !isWithinWindow && "grayscale opacity-50")}
            onClick={() => {
              if (!isWithinWindow) {
                toast({ title: "Sistema Fechado", description: "Agendamentos permitidos apenas entre 08h e 13h.", variant: "destructive" });
                return;
              }
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Nova Solicitação
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setIsCalendarOpen(false);
              resetForm();
            }
          }}>
            <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-2xl overflow-y-auto max-h-[90vh]">
              {isDialogOpen && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      {editingRequest ? "Editar Pedido" : "Solicitar Transporte"}
                    </DialogTitle>
                    <DialogDescription>
                      Janela de agendamento ativa para a UBS Central.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="patient">Paciente</Label>
                      <Select value={patientId} onValueChange={setPatientId}>
                        <SelectTrigger id="patient" className="h-11 rounded-xl">
                          <SelectValue placeholder="Selecione um paciente cadastrado" />
                        </SelectTrigger>
                        <SelectContent>
                          {patientOptions}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="pickup">Local de Embarque (Origem)</Label>
                        <div className="relative">
                          <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="pickup"
                            placeholder="Ex: UBS Central..." 
                            className="pl-10 h-11 rounded-xl" 
                            value={pickupLocation} 
                            onChange={(e) => setPickupLocation(e.target.value)} 
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dest">Destino do Transporte</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="dest"
                            placeholder="Local de atendimento" 
                            className="pl-10 h-11 rounded-xl" 
                            value={destination} 
                            onChange={(e) => setDestination(e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notes">Notas Clínicas</Label>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] text-primary font-bold gap-1" 
                          onClick={handleAiUrgency} 
                          disabled={isClassifying}
                        >
                          {isClassifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3.5 w-3.5" />} 
                          SUGERIR URGÊNCIA (IA)
                        </Button>
                      </div>
                      <Textarea 
                        id="notes"
                        placeholder="Condição do paciente e necessidades especiais..." 
                        className="min-h-[100px] text-sm rounded-xl" 
                        value={patientNotes} 
                        onChange={(e) => setPatientNotes(e.target.value)} 
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Urgência</Label>
                        <Select value={urgency} onValueChange={setUrgency}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="critical">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Data/Hora</Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-11 justify-start text-left font-normal rounded-xl",
                                !scheduledTime && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {scheduledTime ? (
                                format(parseISO(scheduledTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                              ) : (
                                <span>Selecione data/hora</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 flex flex-col sm:flex-row rounded-2xl shadow-2xl" align="start">
                            {isCalendarOpen && (
                              <>
                                <div className="flex flex-col">
                                  <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    locale={ptBR}
                                    className="rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none border-b sm:border-b-0 sm:border-r"
                                  />
                                  <div className="flex items-center justify-between p-3 border-t bg-muted/20 sm:hidden">
                                     <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())} className="text-[10px] font-bold">HOJE</Button>
                                     <Button variant="ghost" size="sm" onClick={() => { setSelectedDate(undefined); setScheduledTime(""); }} className="text-[10px] font-bold text-rose-500">LIMPAR</Button>
                                     <Button size="sm" onClick={handleSaveCalendarSelection} className="text-[10px] font-black uppercase">SALVAR</Button>
                                  </div>
                                </div>
                                <div className="w-full sm:w-48 flex flex-col">
                                  <div className="p-3 border-b bg-muted/10">
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest text-center">Horário</p>
                                  </div>
                                  <div className="flex-1 flex gap-2 p-2">
                                    <ScrollArea className="h-64 w-1/2">
                                      <div className="flex flex-col gap-1 p-1">
                                        {Array.from({ length: 24 }).map((_, i) => {
                                          const hour = i.toString().padStart(2, '0');
                                          return (
                                            <Button 
                                              key={i} 
                                              variant={selectedHour === hour ? "default" : "ghost"} 
                                              size="sm"
                                              className="h-8 font-mono"
                                              onClick={() => setSelectedHour(hour)}
                                            >
                                              {hour}
                                            </Button>
                                          );
                                        })}
                                      </div>
                                    </ScrollArea>
                                    <ScrollArea className="h-64 w-1/2">
                                      <div className="flex flex-col gap-1 p-1">
                                        {['00', '15', '30', '45'].map((min) => (
                                          <Button 
                                            key={min} 
                                            variant={selectedMinute === min ? "default" : "ghost"} 
                                            size="sm"
                                            className="h-8 font-mono"
                                            onClick={() => setSelectedMinute(min)}
                                          >
                                            {min}
                                          </Button>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                  <div className="p-3 border-t bg-muted/20 hidden sm:flex items-center justify-between gap-2">
                                     <div className="flex gap-1">
                                       <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())} className="text-[10px] font-bold h-7 px-2">Hoje</Button>
                                       <Button variant="ghost" size="sm" onClick={() => { setSelectedDate(undefined); setScheduledTime(""); }} className="text-[10px] font-bold h-7 px-2 text-rose-500">Limpar</Button>
                                     </div>
                                     <Button size="sm" onClick={handleSaveCalendarSelection} className="text-[10px] font-black uppercase h-7 px-3 shadow-md">
                                       SALVAR
                                     </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0 flex flex-col sm:flex-row items-center w-full">
                    {!isWithinWindow && !editingRequest && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100 mb-2 sm:mb-0 sm:mr-auto">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Janela Fechada. Emergências: Contate o Secretário.</span>
                      </div>
                    )}
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving} className="rounded-xl">Cancelar</Button>
                      <Button 
                        onClick={handleSave} 
                        className="rounded-xl bg-primary shadow-lg shadow-primary/20"
                        disabled={isSaving || (!isWithinWindow && !editingRequest)}
                      >
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {editingRequest ? "Salvar" : "Confirmar Pedido"}
                      </Button>
                    </div>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-primary/5 border-none p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <History className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Protocolo</p>
            <p className="text-sm text-foreground/80">Novos pedidos levam cerca de 30 minutos para triagem na Secretaria.</p>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por paciente, origem ou destino..." 
            className="pl-10 h-11 bg-card border-none shadow-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Carregando Pedidos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="font-bold">Paciente</TableHead>
                  <TableHead className="font-bold">Trajeto / Horário</TableHead>
                  <TableHead className="font-bold">Urgência</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-muted/20 border-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{req.patientName}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{req.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Navigation className="h-3 w-3" /> {req.pickupLocation} → {req.destinationLocation}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" /> {isValid(parseISO(req.requestedTime)) ? format(parseISO(req.requestedTime), "HH:mm") : "00:00"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getUrgencyBadge(req.urgencyLevel)}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl shadow-xl">
                            <DropdownMenuItem onClick={() => {
                              openAfterDropdownClose(() => {
                                setEditingRequest(req);
                                setPatientId(req.patientId);
                                setPickupLocation(req.pickupLocation);
                                setDestination(req.destinationLocation);
                                setUrgency(req.urgencyLevel);
                                setScheduledTime(req.requestedTime);
                                const parsedDate = parseISO(req.requestedTime);
                                if (isValid(parsedDate)) {
                                  setSelectedDate(parsedDate);
                                  setSelectedHour(parsedDate.getHours().toString().padStart(2, '0'));
                                  setSelectedMinute(parsedDate.getMinutes().toString().padStart(2, '0'));
                                }
                                setPatientNotes(req.aiRecommendation || "");
                                setIsDialogOpen(true);
                              });
                            }}>
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(req.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                      Nenhum pedido registrado para sua unidade.
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
