"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  BrainCircuit, 
  Loader2, 
  Edit, 
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Check,
  X,
  User,
  Ambulance,
  Navigation,
  Activity,
  ShieldCheck,
  ClipboardList,
  ChevronUp
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
import { useToast } from "@/hooks/use-toast";
import { TransportRequest, Patient, TransportStatus } from "@/lib/types";
import { classifyUrgency } from "@/ai/flows/classify-urgency-flow";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { requestService } from "@/services/request-service";
import { patientService } from "@/services/patient-service";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { openAfterDropdownClose } from "@/lib/query-cache";

export default function RequestsPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  
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
  
  const [editingRequest, setEditingRequest] = useState<TransportRequest | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWithinWindow, setIsWithinWindow] = useState(true);
  
  const { toast } = useToast();

  const loadData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      const [fetchedRequests, fetchedPatients] = await Promise.all([
        requestService.getRequests(forceRefresh),
        patientService.getPatients(forceRefresh)
      ]);
      setRequests(fetchedRequests);
      setPatients(fetchedPatients);
    } catch (error) {
      console.error("Erro ao sincronizar agendamentos:", error);
      toast({ title: "Aviso", description: "Falha na sincronização. Verifique a conexão.", variant: "destructive" });
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
        title: "IA: Análise Concluída", 
        description: `Urgência sugerida: ${result.suggestedUrgency.toUpperCase()}.` 
      });
    } catch (error) {
      console.error("Erro ao classificar urgência com IA:", error);
      toast({ variant: "destructive", title: "IA Indisponível", description: "Não foi possível conectar ao motor Genkit." });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: TransportStatus) => {
    try {
      const updateData: Partial<TransportRequest> = { status };
      if (status === 'APPROVED') {
        updateData.driverId = "Carlos Silva (D1)";
        updateData.vehicleId = "Ambulância (V1)";
        updateData.assignedAt = new Date().toISOString();
        updateData.manifestId = `MAN-${id.split('-').pop()}`;
      }

      await requestService.updateRequest(id, updateData);
      setRequests(prev => prev.map(req => (req.id === id ? { ...req, ...updateData } : req)));
      toast({ title: "Status Atualizado", description: `Pedido definido como ${status}.` });
    } catch (error) {
      console.error("Erro ao atualizar status da solicitação:", error);
      toast({ title: "Erro", description: "Falha ao mudar status.", variant: "destructive" });
    }
  };

  const handleSaveCalendarSelection = () => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(selectedHour), parseInt(selectedMinute));
      setScheduledTime(newDate.toISOString());
      setIsCalendarOpen(false);
      toast({ title: "Data Atualizada", description: format(newDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) });
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
      ubsId: editingRequest?.ubsId || "UBS-01",
      pickupLocation: pickupLocation,
      destinationLocation: destination,
      requestedTime: scheduledTime || new Date().toISOString(),
      urgencyLevel: urgency as TransportRequest["urgencyLevel"],
      status: editingRequest?.status || ("PENDING" as TransportStatus),
      operatorId: "ADMIN",
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
      toast({ title: "Sucesso", description: "Solicitação processada com sucesso." });
    } catch (error) {
      console.error("Erro ao gravar solicitação:", error);
      toast({ title: "Erro", description: "Falha ao gravar solicitação.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await requestService.deleteRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      toast({ title: "Removido", description: "Solicitação cancelada." });
    } catch (error) {
      console.error("Erro ao remover solicitação:", error);
      toast({ title: "Erro", description: "Não foi possível remover.", variant: "destructive" });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
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
      case 'APPROVED': return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 gap-1 font-black text-[9px] uppercase"><CheckCircle2 className="h-3 w-3" /> Aprovado</Badge>;
      case 'PENDING': return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1 font-black text-[9px] uppercase"><Clock className="h-3 w-3" /> Pendente</Badge>;
      case 'COMPLETED': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 gap-1 font-black text-[9px] uppercase">Concluído</Badge>;
      case 'DENIED': return <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 gap-1 font-black text-[9px] uppercase"><XCircle className="h-3 w-3" /> Negado</Badge>;
      case 'CANCELLED': return <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 bg-muted/10 gap-1 font-black text-[9px] uppercase">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Agendamentos</h2>
          <p className="text-sm text-muted-foreground">Logística e autorização de transporte municipal.</p>
        </div>
        
        <Button onClick={() => { 
          resetForm();
          setIsDialogOpen(true); 
        }} className="gap-2 shadow-md w-full sm:w-auto h-11">
          <Plus className="h-4 w-4" /> Novo Pedido
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setIsCalendarOpen(false);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-xl overflow-y-auto max-h-[90vh]">
            {isDialogOpen && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    {editingRequest ? "Editar Pedido" : "Solicitar Transporte Sanitário"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do paciente e o destino para análise da secretaria.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="patient">Cidadão / Paciente</Label>
                    <Select value={patientId} onValueChange={setPatientId}>
                      <SelectTrigger id="patient" className="h-11">
                        <SelectValue placeholder="Selecione o paciente cadastrado" />
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
                          className="pl-10 h-11" 
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
                          placeholder="Ex: Hospital Municipal..." 
                          className="pl-10 h-11" 
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
                        CLASSIFICAR IA
                      </Button>
                    </div>
                    <Textarea 
                      id="notes"
                      placeholder="Condição do paciente..." 
                      className="min-h-[100px] text-sm" 
                      value={patientNotes} 
                      onChange={(e) => setPatientNotes(e.target.value)} 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="urgency">Urgência</Label>
                      <Select value={urgency} onValueChange={setUrgency}>
                        <SelectTrigger id="urgency" className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Data e Hora</Label>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-11 justify-start text-left font-normal",
                              !scheduledTime && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduledTime ? (
                              format(parseISO(scheduledTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                            ) : (
                              <span>Selecione data e hora</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 flex flex-col sm:flex-row rounded-xl shadow-2xl" align="start">
                          {isCalendarOpen && (
                            <>
                              <div className="flex flex-col">
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={setSelectedDate}
                                  locale={ptBR}
                                  className="rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none border-b sm:border-b-0 sm:border-r"
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
                <DialogFooter className="gap-2 sm:gap-0 mt-2 flex flex-col sm:flex-row items-center w-full">
                  {!isWithinWindow && !editingRequest && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase bg-rose-50 px-3 py-2 rounded-lg border border-rose-100 mb-2 sm:mb-0 sm:mr-auto animate-pulse">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Autorização de Emergência (Fora de Horário)</span>
                    </div>
                  )}
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-primary shadow-lg shadow-primary/20">
                      {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingRequest ? "Salvar" : "Confirmar"}
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por paciente, origem ou destino..." 
          className="pl-10 h-12 bg-card border-none shadow-sm" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card rounded-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Sincronizando agendamentos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="min-w-[180px] font-bold">Paciente</TableHead>
                  <TableHead className="min-w-[150px] font-bold">Trajeto / Horário</TableHead>
                  <TableHead className="font-bold">Prioridade</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Painel / Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <React.Fragment key={req.id}>
                    <TableRow 
                      className={cn(
                        "transition-colors",
                        expandedRequestId === req.id ? "bg-primary/5 hover:bg-primary/10 border-b-0" : "hover:bg-muted/20"
                      )}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{req.patientName}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{req.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                            <Navigation className="h-3 w-3 text-primary/60 shrink-0" />
                            <span className="truncate max-w-[140px]">{req.pickupLocation} → {req.destinationLocation}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(req.requestedTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getUrgencyBadge(req.urgencyLevel)}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost"
                            size="icon" 
                            className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                            asChild
                            title="Análise Estratégica (Secretário)"
                          >
                            <Link href="/dashboard/admin">
                              <ShieldCheck className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant={expandedRequestId === req.id ? "default" : "ghost"}
                            size="icon" 
                            className={cn(
                              "h-8 w-8 rounded-full transition-all",
                              expandedRequestId === req.id ? "bg-primary shadow-lg" : "text-primary hover:bg-primary/10"
                            )}
                            onClick={() => toggleExpand(req.id)}
                            title="Ver Painel Técnico"
                          >
                            {expandedRequestId === req.id ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 transition-colors">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
                              <DropdownMenuItem onClick={() => toggleExpand(req.id)} className="gap-2 cursor-pointer">
                                <Activity className="h-4 w-4" /> Abrir Ficha Técnica
                              </DropdownMenuItem>
                              
                              {req.status === 'PENDING' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(req.id, 'APPROVED')} className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-600">
                                    <Check className="h-4 w-4" /> Aprovar Pedido
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(req.id, 'DENIED')} className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600">
                                    <X className="h-4 w-4" /> Negar Pedido
                                  </DropdownMenuItem>
                                </>
                              )}

                              <DropdownMenuSeparator />
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
                              }} className="gap-2 cursor-pointer">
                                <Edit className="h-4 w-4" /> Editar Dados
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem className="text-destructive focus:text-destructive gap-2 cursor-pointer" onClick={() => handleDelete(req.id)}>
                                <Trash2 className="h-4 w-4" /> Excluir Registro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedRequestId === req.id && (
                      <TableRow className="bg-primary/[0.02] border-b-2 border-primary/10">
                        <TableCell colSpan={5} className="p-0">
                          <div className="p-4 sm:p-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-primary/5">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                  <Navigation className="h-4 w-4" /> Roteirização do Trajeto
                                </h4>
                                <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                                  <div className="flex items-start gap-4 relative">
                                    <div className="mt-1 size-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-10 shrink-0">
                                      <div className="size-2 rounded-full bg-primary" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="text-[9px] font-black text-primary uppercase tracking-tighter leading-none">Origem (Embarque)</p>
                                      <p className="text-sm font-bold text-slate-700">{req.pickupLocation}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-4 relative">
                                    <div className="mt-1 size-6 rounded-full bg-rose-50 border-2 border-rose-500 flex items-center justify-center z-10 shrink-0">
                                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-tighter leading-none">Destino (Desembarque)</p>
                                      <p className="text-sm font-bold text-slate-700">{req.destinationLocation}</p>
                                    </div>
                                  </div>
                                </div>
                                <Separator className="bg-slate-50" />
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground font-medium uppercase tracking-tighter">UBS Solicitante:</span>
                                  <Badge variant="outline" className="font-bold border-primary/20 text-primary">{req.ubsId}</Badge>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 px-1">
                                  <ShieldCheck className="h-4 w-4" /> Logística do Manifesto
                                </h4>
                                
                                {req.status === 'APPROVED' || req.status === 'COMPLETED' ? (
                                  <div className="bg-emerald-600 rounded-3xl p-5 space-y-5 shadow-xl shadow-emerald-100/50 text-white">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="bg-white/20 p-2.5 rounded-2xl">
                                          <Ambulance className="h-6 w-6" />
                                        </div>
                                        <div>
                                          <p className="text-[9px] font-black text-emerald-100 uppercase tracking-tighter leading-none">Viatura Atribuída</p>
                                          <p className="text-base font-black">{req.vehicleId || "Viatura Local"}</p>
                                        </div>
                                      </div>
                                      <Badge className="bg-white text-emerald-600 border-none font-black text-[10px] h-6 px-3">{req.manifestId}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                                      <div className="bg-white/20 p-2.5 rounded-2xl">
                                        <User className="h-6 w-6" />
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-black text-emerald-100 uppercase tracking-tighter leading-none">Condutor Responsável</p>
                                        <p className="text-base font-black">{req.driverId || "Plantão Logística"}</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : req.status === 'PENDING' ? (
                                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-2 h-full flex flex-col items-center justify-center">
                                    <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                                      <Activity className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">Aguardando Atribuição<br/>de Manifesto</p>
                                    <Button 
                                      className="mt-4 bg-emerald-600 hover:bg-emerald-700 h-9 font-black text-[10px] uppercase tracking-widest"
                                      onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                    >
                                      Aprovar e Atribuir
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="bg-slate-100 border rounded-3xl p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                                    <XCircle className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase">Solicitação Inativa</p>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/50">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <ClipboardList className="h-4 w-4" /> Observações Clínicas
                                </h4>
                                <div className="space-y-3">
                                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed italic">
                                    &quot;{req.aiRecommendation || "Nenhuma nota clínica adicional fornecida para esta solicitação."}&quot;
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white p-2 rounded-lg border text-center">
                                      <p className="text-[8px] font-black text-slate-400 uppercase">Prioridade</p>
                                      <p className="text-[10px] font-bold text-slate-700">{req.urgencyLevel.toUpperCase()}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border text-center">
                                      <p className="text-[8px] font-black text-slate-400 uppercase">Análise IA</p>
                                      <p className="text-[10px] font-bold text-primary">SIGILO ATIVO</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Button variant="outline" className="w-full h-10 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest border-primary/20 text-primary" asChild>
                                      <Link href="/dashboard/admin">
                                        <ShieldCheck className="h-4 w-4" /> Abrir Painel de Comando
                                      </Link>
                                    </Button>
                                    <Button variant="ghost" className="w-full h-10 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest" onClick={() => toggleExpand(req.id)}>
                                      Recolher Ficha
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-none bg-primary/5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-primary">Aguardando Triagem</p>
            <p className="text-xl font-black">{requests.filter(r => r.status === 'PENDING').length}</p>
          </div>
        </Card>
        <Card className="p-4 border-none bg-emerald-50 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-emerald-600">Em Rota / Aprovados</p>
            <p className="text-xl font-black">{requests.filter(r => r.status === 'APPROVED').length}</p>
          </div>
        </Card>
        <Card className="p-4 border-none bg-rose-50 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-rose-600">Cancelados</p>
            <p className="text-xl font-black">{requests.filter(r => r.status === 'DENIED' || r.status === 'CANCELLED').length}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
