"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Edit, 
  Trash2,
  Filter,
  Loader2
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
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { patientService } from "@/services/patient-service";
import { openAfterDropdownClose } from "@/lib/query-cache";

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const [formName, setFormName] = useState("");
  const [formCns, setFormCns] = useState("");

  const { toast } = useToast();

  const loadPatients = useCallback(async (forceRefresh: boolean = false) => {
    try {
      const data = await patientService.getPatients(forceRefresh);
      setPatients(data);
    } catch (error) {
      console.error("Erro ao sincronizar cidadãos:", error);
      toast({ title: "Erro", description: "Falha ao sincronizar cidadãos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleSave = async () => {
    if (isSaving) return;
    if (!formName || !formCns) {
      toast({ title: "Campos Requeridos", description: "Nome e CNS são necessários.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const patientData = {
        name: formName,
        medicalRecordNumber: formCns,
        comorbidities: editingPatient?.comorbidities || ["Geral"],
        needsCompanion: editingPatient?.needsCompanion || false,
      };

      if (editingPatient) {
        await patientService.updatePatient(editingPatient.id, patientData);
        setPatients(prev => prev.map(p => (p.id === editingPatient.id ? { ...p, ...patientData } : p)));
      } else {
        const newId = await patientService.addPatient(patientData as Omit<Patient, "id">);
        setPatients(prev => [...prev, { id: newId, ...patientData }].sort((a, b) => a.name.localeCompare(b.name)));
      }

      setIsDialogOpen(false);
      toast({ title: "Sucesso", description: "Dados sincronizados com o Firestore." });
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      toast({ title: "Erro", description: "Falha ao salvar paciente.", variant: "destructive" });
    } finally {
      setIsSaving(false);
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
          <h2 className="text-3xl font-bold tracking-tight text-primary">Cidadãos</h2>
          <p className="text-sm text-muted-foreground">Registro central de pacientes de Rio Claro.</p>
        </div>
        
        <Button onClick={() => { setEditingPatient(null); setFormName(""); setFormCns(""); setIsDialogOpen(true); }} className="gap-2 w-full sm:w-auto shadow-md">
          <UserPlus className="h-4 w-4" /> Novo Paciente
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-xl">
            {isDialogOpen && (
              <>
                <DialogHeader>
                  <DialogTitle>{editingPatient ? "Editar Cadastro" : "Cadastrar Cidadão"}</DialogTitle>
                  <DialogDescription>Dados clínicos para transporte sanitário.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label>Nome Completo</Label>
                    <Input className="h-11" value={formName} onChange={(e) => setFormName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>CNS / Prontuário</Label>
                      <Input className="h-11" value={formCns} onChange={(e) => setFormCns(e.target.value)} />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving} className="w-full sm:w-auto">Cancelar</Button>
                  <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Salvar Cidadão
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CNS..." className="pl-10 h-11 bg-card border-none shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 shrink-0"><Filter className="h-4 w-4" /></Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-card rounded-xl">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-xs uppercase font-black text-muted-foreground">Sincronizando Cidadãos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="min-w-[150px]">Nome</TableHead>
                  <TableHead>CNS</TableHead>
                  <TableHead>Necessidades</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? filteredPatients.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/10">
                    <TableCell className="font-semibold text-sm">{p.name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{p.medicalRecordNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.comorbidities?.map((c, i) => (
                          <Badge key={i} className="bg-primary/10 text-primary border-none text-[9px] uppercase">{c}</Badge>
                        ))}
                        {p.needsCompanion && <Badge className="bg-accent/20 text-accent-foreground border-none text-[9px] uppercase">Acomp.</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            openAfterDropdownClose(() => {
                              setEditingPatient(p);
                              setFormName(p.name);
                              setFormCns(p.medicalRecordNumber);
                              setIsDialogOpen(true);
                            });
                          }}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={async () => {
                            try {
                              await patientService.deletePatient(p.id);
                              setPatients(prev => prev.filter(item => item.id !== p.id));
                              toast({ title: "Removido", description: "Cidadão apagado do Firestore." });
                            } catch (error) {
                              console.error("Erro ao remover paciente:", error);
                              toast({ title: "Erro", description: "Falha ao remover cidadão.", variant: "destructive" });
                            }
                          }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">
                      Nenhum cidadão real cadastrado no Firestore.
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
