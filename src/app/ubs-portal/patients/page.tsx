"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  ShieldCheck,
  Edit,
  Trash2,
  FileText,
  Loader2,
  Activity,
  ShieldAlert,
  CalendarDays
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/lib/types";
import { patientService } from "@/services/patient-service";
import { Separator } from "@/components/ui/separator";
import { openAfterDropdownClose } from "@/lib/query-cache";

export default function UbsPatientsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  
  // Form State
  const [formName, setFormName] = useState("");
  const [formCns, setFormCns] = useState("");
  const [formNeedsCompanion, setFormNeedsCompanion] = useState(false);
  const [formNotes, setFormNotes] = useState("");

  const { toast } = useToast();

  const loadPatients = useCallback(async (forceRefresh: boolean = false) => {
    try {
      const data = await patientService.getPatients(forceRefresh);
      setPatients(data);
    } catch (error) {
      console.error("Erro ao carregar base de pacientes da UBS:", error);
      toast({ title: "Erro", description: "Falha ao carregar base de dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormName(patient.name);
      setFormCns(patient.medicalRecordNumber);
      setFormNeedsCompanion(patient.needsCompanion);
      setFormNotes(patient.notes || "");
    } else {
      setEditingPatient(null);
      setFormName("");
      setFormCns("");
      setFormNeedsCompanion(false);
      setFormNotes("");
    }
    setIsDialogOpen(true);
  };

  const handleOpenView = (patient: Patient) => {
    setViewingPatient(patient);
    setIsViewDialogOpen(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!formName || !formCns) {
      toast({ title: "Campos Requeridos", description: "Nome e CNS são obrigatórios.", variant: "destructive" });
      return;
    }
    
    const patientData = {
      name: formName,
      medicalRecordNumber: formCns,
      comorbidities: editingPatient?.comorbidities || ["Geral"],
      needsCompanion: formNeedsCompanion,
      notes: formNotes
    };

    setIsSaving(true);
    try {
      if (editingPatient) {
        await patientService.updatePatient(editingPatient.id, patientData);
        setPatients(prev => prev.map(p => (p.id === editingPatient.id ? { ...p, ...patientData } : p)));
      } else {
        const newId = await patientService.addPatient(patientData as Omit<Patient, "id">);
        setPatients(prev => [...prev, { id: newId, ...patientData }].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsDialogOpen(false);
      toast({ title: "Sincronizado", description: `Dados de ${formName} salvos com sucesso.` });
    } catch (error) {
      console.error("Erro ao salvar paciente na UBS:", error);
      toast({ title: "Erro", description: "Falha ao gravar no banco de dados.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePatient = async (patient: Patient) => {
    try {
      await patientService.deletePatient(patient.id);
      setPatients(prev => prev.filter(item => item.id !== patient.id));
      toast({ title: "Removido", description: `${patient.name} foi removido da base.` });
    } catch (error) {
      console.error("Erro ao remover paciente na UBS:", error);
      toast({ title: "Erro", description: "Falha ao remover registro.", variant: "destructive" });
    }
  };

  const filteredPatients = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.medicalRecordNumber.includes(searchTerm.trim())
    );
  }, [patients, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Meus Pacientes</h2>
          <p className="text-sm text-muted-foreground">Base de cidadãos cadastrados na UBS Central.</p>
        </div>
        
        <Button className="gap-2 shadow-md h-11 px-6 rounded-xl" onClick={() => handleOpenDialog()}>
          <UserPlus className="h-4 w-4" /> Novo Cidadão
        </Button>

        {/* Cadastro/Edição Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-2xl overflow-y-auto max-h-[90vh]">
            {isDialogOpen && (
              <>
                <DialogHeader>
                  <DialogTitle>{editingPatient ? "Editar Cadastro" : "Cadastrar Cidadão"}</DialogTitle>
                  <DialogDescription>Dados clínicos para transporte sanitário.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="p-name">Nome Completo</Label>
                    <Input id="p-name" className="h-11 rounded-xl" value={formName} onChange={(e) => setFormName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="p-cns">CNS / Prontuário</Label>
                      <Input id="p-cns" className="h-11 rounded-xl" value={formCns} onChange={(e) => setFormCns(e.target.value)} />
                    </div>
                    <div className="flex items-center space-x-2 pt-0 sm:pt-8">
                      <Checkbox id="p-comp" checked={formNeedsCompanion} onCheckedChange={(checked) => setFormNeedsCompanion(checked as boolean)} />
                      <Label htmlFor="p-comp" className="text-sm font-medium cursor-pointer">Requer Acompanhante</Label>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="p-notes">Observações e Necessidades</Label>
                    <Textarea id="p-notes" className="min-h-[100px] rounded-xl resize-none" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving} className="rounded-xl">Cancelar</Button>
                  <Button onClick={handleSave} disabled={isSaving} className="rounded-xl bg-primary shadow-lg">
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingPatient ? "Atualizar" : "Salvar Cidadão"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Visualização de Prontuário Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-3xl overflow-hidden p-0 border-none shadow-2xl">
            {viewingPatient && (
              <div className="flex flex-col h-full">
                <div className="bg-primary p-6 text-primary-foreground">
                  <DialogHeader className="space-y-0 text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 p-2.5 rounded-2xl">
                        <FileText className="h-7 w-7" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-black tracking-tight leading-none uppercase text-primary-foreground">
                          Prontuário Digital
                        </DialogTitle>
                        <DialogDescription className="text-[10px] uppercase font-bold opacity-80 mt-1 tracking-widest text-primary-foreground">
                          Secretaria de Saúde &bull; Rio Claro
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="space-y-1">
                    <p className="text-2xl font-black">{viewingPatient.name}</p>
                    <p className="text-xs font-bold opacity-90 flex items-center gap-1">
                      <Activity className="h-3 w-3" /> {viewingPatient.medicalRecordNumber}
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-6 bg-white overflow-y-auto max-h-[60vh] no-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 border-none bg-slate-50 flex flex-col gap-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Situação Cadastral</p>
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-slate-700 uppercase">Ativo no Sistema</span>
                      </div>
                    </Card>
                    <Card className="p-4 border-none bg-slate-50 flex flex-col gap-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Acompanhante</p>
                      <div className="flex items-center gap-2">
                        {viewingPatient.needsCompanion ? (
                          <>
                            <ShieldAlert className="size-4 text-amber-500" />
                            <span className="text-xs font-bold text-slate-700 uppercase">Obrigatório</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="size-4 text-emerald-500" />
                            <span className="text-xs font-bold text-slate-700 uppercase">Não Requer</span>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" /> Condições Clínicas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingPatient.comorbidities.map((c, i) => (
                        <Badge key={i} className="bg-primary/10 text-primary border-none text-[10px] px-3 py-1 font-bold uppercase rounded-lg">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Observações Médicas
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed">
                      {viewingPatient.notes || "Nenhuma observação clínica registrada para este paciente."}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" /> Histórico Recente
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold text-slate-700 uppercase">Último Transporte</span>
                        <span className="text-[10px] font-black text-slate-400">12/05/2024</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold text-slate-700 uppercase">Destino</span>
                        <span className="text-[10px] font-black text-slate-400">Hospital Municipal</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t flex gap-2">
                  <Button className="flex-1 rounded-2xl h-12 font-black uppercase text-xs tracking-widest" onClick={() => setIsViewDialogOpen(false)}>
                    Fechar Prontuário
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome ou CNS..." 
          className="pl-10 h-11 bg-card border-none shadow-sm rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground uppercase font-black">Sincronizando Base...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="font-bold">Nome Completo</TableHead>
                  <TableHead className="font-bold">CNS / Prontuário</TableHead>
                  <TableHead className="font-bold">Situação</TableHead>
                  <TableHead className="text-right font-bold">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((p) => (
                  <TableRow key={p.id} className="group hover:bg-muted/20">
                    <TableCell className="font-semibold text-sm">{p.name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{p.medicalRecordNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verificado
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                          <DropdownMenuItem onClick={() => openAfterDropdownClose(() => handleOpenDialog(p))} className="gap-2 cursor-pointer">
                            <Edit className="h-4 w-4" /> Editar Cadastro
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAfterDropdownClose(() => handleOpenView(p))} className="gap-2 cursor-pointer">
                            <FileText className="h-4 w-4" /> Ver Prontuário
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeletePatient(p)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4" /> Remover Registro
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
