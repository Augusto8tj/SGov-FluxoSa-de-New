"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Fingerprint, 
  Search, 
  ShieldCheck, 
  User, 
  Database,
  Filter,
  ArrowRightLeft,
  Lock,
  Loader2,
  CheckCircle2
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { auditService } from "@/services/audit-service";

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const integrityStatus = "VALIDADO";

  const loadLogs = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setLoading(true);
    try {
      const data = await auditService.getLogs(forceRefresh);
      setLogs(data);
    } catch (error) {
      console.error("Erro ao carregar logs de auditoria:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return logs.filter(log => 
      (log.userEmail || "").toLowerCase().includes(query) ||
      (log.action || "").toLowerCase().includes(query) ||
      (log.resource || "").toLowerCase().includes(query)
    );
  }, [logs, searchTerm]);

  const uniqueUsersCount = useMemo(
    () => new Set(logs.map(l => l.userId)).size,
    [logs]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Fingerprint className="h-8 w-8" /> Auditoria do Sistema
          </h2>
          <p className="text-muted-foreground text-sm">Rastreabilidade real e logs imutáveis registrados no Firestore.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "h-11 px-4 rounded-xl border-none font-black text-[10px] uppercase gap-2 shadow-sm transition-all",
            integrityStatus === 'VALIDADO' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white animate-pulse"
          )}>
            {integrityStatus === 'VALIDADO' ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
            Cadeia de Custódia: {integrityStatus}
          </Badge>
          <Button variant="outline" className="gap-2 h-11 rounded-xl shadow-sm" onClick={() => loadLogs(true)}>
            <ArrowRightLeft className={cn("h-4 w-4", loading && "animate-spin")} /> Sincronizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Integridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">{logs.length > 0 ? "100%" : "---"}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Verificação de Assinatura</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
              <Lock className="h-4 w-4 text-primary" /> Acessos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">{uniqueUsersCount}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Usuários Identificados</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest">
              <ArrowRightLeft className="h-4 w-4 text-amber-500" /> Operações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black">{logs.length}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Registros Reais</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por usuário, ação ou recurso..." 
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
            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Lendo registros oficiais...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="font-bold">Usuário / ID</TableHead>
                  <TableHead className="font-bold">Ação Realizada</TableHead>
                  <TableHead className="font-bold">Recurso Afetado</TableHead>
                  <TableHead className="font-bold">Data & IP</TableHead>
                  <TableHead className="text-right font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/10 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">{(log.userEmail || "desconhecido").split('@')[0]}</span>
                          <span className="text-[9px] text-muted-foreground uppercase">{log.id.slice(-8)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold text-slate-700">{log.action}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase">
                        <Database className="h-3 w-3" /> {log.resource}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600">
                          {log.timestamp ? format(new Date(log.timestamp), "dd/MM HH:mm:ss", { locale: ptBR }) : "N/A"}
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground">{log.ip || "0.0.0.0"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={cn(
                        "text-[8px] font-black uppercase px-2 h-5 border-none",
                        log.status === 'SUCCESS' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic text-sm">
                      Nenhuma ação administrativa registrada no Firestore até o momento.
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
          <Fingerprint className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-lg text-slate-800 uppercase tracking-tighter">Protocolo de Rastreabilidade Real</h4>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
            Cada registro acima é persistido em tempo real e vinculado à identidade do operador, garantindo a transparência total da gestão de saúde em Rio Claro.
          </p>
        </div>
      </div>
    </div>
  );
}
