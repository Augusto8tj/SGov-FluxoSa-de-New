"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Route, 
  Search, 
  MapPin, 
  Clock, 
  Loader2, 
  Ambulance, 
  User, 
  ShieldCheck,
  Filter,
  Navigation,
  ExternalLink,
  Users,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Activity
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TransportRequest } from "@/lib/types";
import { requestService } from "@/services/request-service";
import { Separator } from "@/components/ui/separator";

export default function GlobalManifestsPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [expandedManifestId, setExpandedManifestId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setLoading(true);
    try {
      const allRequests = await requestService.getRequests(forceRefresh);
      setRequests(allRequests.filter(r => r.manifestId));
    } catch (error) {
      console.error("Erro ao carregar manifestos globais:", error);
      toast({ title: "Erro de Sincronização", description: "Falha ao carregar dados reais da malha viária.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const groupedManifests = useMemo(() => {
    const groups: Record<string, TransportRequest[]> = {};
    requests.forEach(req => {
      const mId = req.manifestId || "SEM-ID";
      if (!groups[mId]) groups[mId] = [];
      groups[mId].push(req);
    });
    return groups;
  }, [requests]);

  const manifestsList = useMemo(() => {
    return Object.entries(groupedManifests).filter(([id, items]) => {
      if (!searchTerm) return true;
      const lowerSearch = searchTerm.toLowerCase();
      return id.toLowerCase().includes(lowerSearch) || 
             items.some(p => p.patientName.toLowerCase().includes(lowerSearch)) ||
             items.some(p => p.vehicleId?.toLowerCase().includes(lowerSearch)) ||
             items.some(p => p.driverId?.toLowerCase().includes(lowerSearch));
    });
  }, [groupedManifests, searchTerm]);

  const toggleExpand = (id: string) => {
    setExpandedManifestId(expandedManifestId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Navigation className="h-8 w-8" /> Gestão de Manifestos
          </h2>
          <p className="text-muted-foreground text-sm">Supervisão global da malha viária e missões consolidadas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 h-11 px-6 rounded-xl" onClick={() => loadData(true)}>
            <Clock className="h-4 w-4" /> Atualizar Frota
          </Button>
          <Button className="gap-2 h-11 px-6 rounded-xl shadow-lg" asChild>
            <a href="/dashboard/routes">
              <Route className="h-4 w-4" /> Novo Planejamento
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-none shadow-sm bg-blue-50 border-l-4 border-l-blue-500">
          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Missões Ativas</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-black text-blue-700">{manifestsList.length}</p>
            <Ambulance className="h-4 w-4 mb-2 text-blue-400" />
          </div>
        </Card>
        <Card className="p-4 border-none shadow-sm bg-emerald-50 border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Total Pacientes</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-black text-emerald-700">{requests.length}</p>
            <Users className="h-4 w-4 mb-2 text-emerald-400" />
          </div>
        </Card>
        <Card className="p-4 border-none shadow-sm bg-indigo-50 border-l-4 border-l-indigo-500">
          <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Frota em Campo</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-black text-indigo-700">{Array.from(new Set(requests.map(m => m.vehicleId))).length}</p>
            <ShieldCheck className="h-4 w-4 mb-2 text-indigo-400" />
          </div>
        </Card>
        <Card className="p-4 border-none shadow-sm bg-slate-50 border-l-4 border-l-slate-500">
          <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Ocupação Média</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-3xl font-black text-slate-700">{(requests.length / (manifestsList.length || 1)).toFixed(1)}</p>
            <Activity className="h-4 w-4 mb-2 text-slate-400" />
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por manifesto, viatura, condutor ou nome de paciente..." 
            className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Sincronizando Malha Viária...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="font-bold">Manifesto / Viatura</TableHead>
                  <TableHead className="font-bold">Condutor Responsável</TableHead>
                  <TableHead className="font-bold">Capacidade / Ocupação</TableHead>
                  <TableHead className="font-bold">Horário de Saída</TableHead>
                  <TableHead className="text-right font-bold">Painel / Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manifestsList.length > 0 ? (
                  manifestsList.map(([mId, patients]) => {
                    const firstItem = patients[0];
                    return (
                      <React.Fragment key={mId}>
                        <TableRow 
                          className={cn(
                            "hover:bg-muted/10 group transition-colors",
                            expandedManifestId === mId && "bg-primary/[0.02]"
                          )}
                        >
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className="bg-primary text-primary-foreground border-none font-black text-[10px] h-6 px-3 w-fit shadow-sm">
                                {mId}
                              </Badge>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                <Ambulance className="h-3 w-3" /> {firstItem.vehicleId || "Viatura Local"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                <User className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{firstItem.driverId || "Plantão Logística"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 font-black text-[10px] px-2 h-6">
                                {patients.length} {patients.length === 1 ? 'Paciente' : 'Pacientes'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              {new Date(firstItem.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant={expandedManifestId === mId ? "default" : "ghost"}
                                size="icon"
                                className={cn(
                                  "h-8 w-8 rounded-full transition-all",
                                  expandedManifestId === mId ? "bg-primary shadow-lg" : "text-primary hover:bg-primary/10"
                                )}
                                onClick={() => toggleExpand(mId)}
                                title="Ver Itinerário Completo"
                              >
                                {expandedManifestId === mId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {expandedManifestId === mId && (
                          <TableRow className="bg-primary/[0.02] border-b-2 border-primary/10">
                            <TableCell colSpan={5} className="p-0">
                              <div className="p-6 animate-in slide-in-from-top-2 duration-300">
                                <div className="bg-white rounded-[2rem] border border-primary/10 shadow-xl overflow-hidden">
                                  <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-b">
                                    <div className="flex items-center gap-2">
                                      <ClipboardList className="h-5 w-5 text-primary" />
                                      <div>
                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Relação de Passageiros & Itinerário</h4>
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase">Missão: {mId} &bull; {firstItem.vehicleId}</p>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-black border-emerald-200 text-emerald-700 bg-emerald-50 px-3 h-7 uppercase">
                                      {patients.length} Paradas Planejadas
                                    </Badge>
                                  </div>
                                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {patients.map((p, idx) => (
                                      <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all hover:bg-white hover:shadow-md">
                                        <div className="bg-white p-2.5 rounded-xl shadow-sm group-hover:text-primary transition-colors">
                                          <User className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-1 flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-slate-700 uppercase leading-none truncate">{p.patientName}</p>
                                            <Badge className="bg-indigo-50 text-indigo-600 border-none text-[8px] h-4 font-black">CÓD: {p.patientAccessCode}</Badge>
                                          </div>
                                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                                            <MapPin className="h-3 w-3 text-rose-500" /> {p.destinationLocation}
                                          </div>
                                          <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                              <Clock className="h-3 w-3 text-primary" /> {new Date(p.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h
                                            </div>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase text-primary border-primary/20">
                                              {p.urgencyLevel.toUpperCase()}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="bg-slate-50 px-6 py-3 flex items-center gap-4 border-t">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                                      <Activity className="h-3.5 w-3.5" /> Logística Municipal Rio Claro
                                    </div>
                                    <Separator orientation="vertical" className="h-3" />
                                    <span className="text-[9px] font-medium text-slate-500 italic">Manifesto sincronizado em tempo real com o App do Condutor</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-medium">
                      Nenhum manifesto registrado no sistema para os critérios informados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="p-6 bg-slate-100 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 rounded-[2rem] bg-white shadow-lg flex items-center justify-center shrink-0">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-lg text-slate-800 uppercase tracking-tighter">Missões Consolidadas</h4>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
            Nesta visão, cada linha representa uma **Viatura em Missão**. O sistema agrupa automaticamente os pacientes que compartilham a mesma rota e veículo, permitindo uma gestão de frota muito mais eficiente e menos burocrática.
          </p>
        </div>
        <ExternalLink className="h-6 w-6 text-slate-400 hidden md:block" />
      </div>
    </div>
  );
}
