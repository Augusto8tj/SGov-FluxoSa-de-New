"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  Clock, 
  Loader2, 
  Ambulance, 
  User, 
  ArrowRight,
  Filter,
  KeyRound,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ClipboardList
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

export default function UbsManifestsPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [manifests, setManifests] = useState<TransportRequest[]>([]);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadManifests = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setLoading(true);
    try {
      const allRequests = await requestService.getRequests(forceRefresh);
      const ubsManifests = allRequests.filter(r => 
        (r.ubsId === "UBS-01" || r.operatorId === "UBS_MGR") && 
        (r.status === 'APPROVED' || r.status === 'COMPLETED') &&
        r.manifestId
      );
      setManifests(ubsManifests);
    } catch (error) {
      console.error("Erro ao carregar manifestos da UBS:", error);
      toast({ title: "Erro", description: "Falha ao carregar manifestos da unidade.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadManifests();
  }, [loadManifests]);

  const toggleExpand = (id: string) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const filteredManifests = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return manifests.filter(m => 
      m.patientName.toLowerCase().includes(query) ||
      m.manifestId?.toLowerCase().includes(query)
    );
  }, [manifests, searchTerm]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copiado!", description: `Código ${code} pronto para enviar.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Manifestos de Viagem</h2>
          <p className="text-sm text-muted-foreground">Acompanhe os veículos e forneça o acesso aos pacientes.</p>
        </div>
        <Button variant="outline" className="gap-2 h-11 px-6 rounded-xl" onClick={() => loadManifests(true)}>
          <Clock className="h-4 w-4" /> Atualizar Escala
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-none bg-blue-50 border-l-4 border-l-blue-500">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Ambulance className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Viagens Hoje</p>
                <p className="text-xl font-black">{manifests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por paciente ou código do manifesto..." 
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
            <p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Sincronizando Escala Logística...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="font-bold">Manifesto / Acesso</TableHead>
                  <TableHead className="font-bold">Paciente & Destino</TableHead>
                  <TableHead className="font-bold">Logística</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredManifests.length > 0 ? (
                  filteredManifests.map((item) => (
                    <React.Fragment key={item.id}>
                      <TableRow className={cn(
                        "hover:bg-muted/10 group transition-colors",
                        expandedRequestId === item.id && "bg-primary/[0.02]"
                      )}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] h-6 px-3 w-fit">
                              {item.manifestId}
                            </Badge>
                            <div 
                              className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded cursor-pointer hover:bg-indigo-100 w-fit"
                              onClick={() => handleCopyCode(item.patientAccessCode || "000000")}
                            >
                              <KeyRound className="h-3 w-3" /> {item.patientAccessCode}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-black text-sm text-slate-800">{item.patientName}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                              <MapPin className="h-3 w-3" /> {item.destinationLocation}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                              <Ambulance className="h-3.5 w-3.5 text-primary" /> {item.vehicleId || "Viatura Local"}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase">
                              <User className="h-3 w-3" /> {item.driverId || "Plantão Logística"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.status === 'APPROVED' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-black uppercase h-5 px-2">Confirmado</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-700 border-none text-[9px] font-black uppercase h-5 px-2">Concluído</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant={expandedRequestId === item.id ? "default" : "ghost"} 
                              size="icon" 
                              className="h-8 w-8 rounded-full text-primary"
                              onClick={() => toggleExpand(item.id)}
                            >
                              {expandedRequestId === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2 text-indigo-600 font-bold text-[10px] uppercase h-8"
                              onClick={() => window.open(`/patient-portal`, '_blank')}
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> Portal
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {expandedRequestId === item.id && (
                        <TableRow className="bg-primary/[0.02] border-b-2 border-primary/10">
                          <TableCell colSpan={5} className="p-0">
                            <div className="p-6 animate-in slide-in-from-top-2 duration-300">
                              <div className="bg-white rounded-3xl border border-primary/10 shadow-sm overflow-hidden">
                                <div className="bg-indigo-50 px-6 py-3 flex items-center justify-between border-b border-indigo-100">
                                  <div className="flex items-center gap-2 text-indigo-700">
                                    <ClipboardList className="h-4 w-4" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Plano de Viagem: {item.manifestId}</h4>
                                  </div>
                                </div>
                                <div className="p-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {manifests
                                      .filter(m => m.manifestId === item.manifestId)
                                      .map((p, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                                          <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary">Parada #{idx + 1}</Badge>
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(p.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h</span>
                                          </div>
                                          <p className="text-xs font-black text-slate-700 uppercase">{p.patientName}</p>
                                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                            <MapPin className="h-3 w-3 text-rose-500" /> {p.destinationLocation}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-medium">
                      Nenhum manifesto pronto para seus pacientes no momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="p-6 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 rounded-[2rem] bg-white shadow-lg flex items-center justify-center shrink-0">
          <KeyRound className="h-8 w-8 text-indigo-600" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-lg text-indigo-700 uppercase tracking-tighter">Acesso do Cidadão</h4>
          <p className="text-sm text-indigo-600 leading-relaxed max-w-2xl mt-1">
            Cada viagem possui um <b>Código de Acesso</b> exclusivo.
          </p>
        </div>
        <ArrowRight className="h-6 w-6 text-indigo-300 hidden md:block" />
      </div>
    </div>
  );
}
