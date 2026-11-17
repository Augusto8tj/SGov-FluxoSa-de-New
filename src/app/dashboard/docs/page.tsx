"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Printer, 
  FileText, 
  Search, 
  Download, 
  ShieldCheck,
  Clock,
  Filter,
  FileCheck,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { documentService } from "@/services/document-service";
import { format } from "date-fns";

export default function DocumentManagementPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const router = useRouter();

  const loadDocuments = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setLoading(true);
    try {
      const data = await documentService.getDocuments(forceRefresh);
      setDocuments(data);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handlePrint = (doc: any) => {
    const type = doc.type === 'DIÁRIA' ? 'daily' : 'fuel';
    const params = new URLSearchParams({
      type,
      id: doc.id,
      driver: doc.driverName,
      value: doc.value,
      date: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
    });

    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'PRINTED' } : d));
    documentService.markAsPrinted(doc.id).catch((error) => {
      console.error("Erro ao marcar documento como impresso:", error);
    });

    router.push(`/dashboard/print?${params.toString()}`);
  };

  const filteredDocs = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return documents.filter(d => 
      (d.name || "").toLowerCase().includes(query) || 
      (d.driverName || "").toLowerCase().includes(query)
    );
  }, [documents, searchTerm]);

  const readyCount = useMemo(() => documents.filter(d => d.status === 'READY').length, [documents]);
  const printedCount = useMemo(() => documents.filter(d => d.status === 'PRINTED').length, [documents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Printer className="h-8 w-8" /> Central de Documentos
          </h2>
          <p className="text-muted-foreground text-sm">Geração de documentos oficiais reais a partir de missões aprovadas.</p>
        </div>
        <Button variant="outline" className="h-11 rounded-xl gap-2 shadow-sm" onClick={() => loadDocuments(true)}>
          <Clock className={cn("h-4 w-4", loading && "animate-spin")} /> Atualizar Base
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-indigo-50 border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-4 w-4" /> Prontos para Imprimir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-indigo-700">{readyCount}</p>
            <p className="text-[10px] text-indigo-600/70 mt-1 uppercase font-bold">Documentos homologados</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50 border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
              <FileCheck className="h-4 w-4" /> Já Impressos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-emerald-700">{printedCount}</p>
            <p className="text-[10px] text-emerald-600/70 mt-1 uppercase font-bold">Histórico de emissão</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-100 border-l-4 border-l-slate-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Integridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-black text-slate-700 uppercase">Auditado</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Assinatura Digital Ativa</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por documento ou motorista..." 
            className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card rounded-2xl">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Sincronizando com a nuvem...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="font-bold">Documento / Tipo</TableHead>
                  <TableHead className="font-bold">Motorista Beneficiário</TableHead>
                  <TableHead className="font-bold">Data de Emissão</TableHead>
                  <TableHead className="font-bold">Valor</TableHead>
                  <TableHead className="text-right font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm",
                          doc.type === 'DIÁRIA' ? "bg-indigo-100 text-indigo-600" : "bg-amber-100 text-amber-600"
                        )}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-700">{doc.name}</span>
                          <span className="text-[9px] text-muted-foreground uppercase font-black">{doc.id.slice(-8)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-600">{doc.driverName}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {doc.createdAt ? format(new Date(doc.createdAt), "dd/MM/yyyy") : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-black text-primary">{doc.value}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground"><Download className="h-4 w-4" /></Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="h-9 px-4 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg"
                          onClick={() => handlePrint(doc)}
                        >
                          <Printer className="h-3.5 w-3.5" /> Imprimir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic text-sm">
                      Nenhuma guia oficial gerada no Firestore até agora.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="p-8 bg-slate-100 rounded-[3rem] border border-dashed border-slate-300 flex flex-col md:flex-row items-center gap-8 mx-1">
        <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center shrink-0">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h4 className="font-black text-xl text-slate-800 uppercase tracking-tighter">Workflow de Auditoria Digital</h4>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl font-medium">
            Todos os documentos reais gerados nesta tela são vinculados a uma ID de missão e possuem registro de integridade no banco de dados, protegendo o município contra duplicidade de guias.
          </p>
        </div>
        <Printer className="h-8 w-8 text-slate-300 hidden md:block" />
      </div>
    </div>
  );
}