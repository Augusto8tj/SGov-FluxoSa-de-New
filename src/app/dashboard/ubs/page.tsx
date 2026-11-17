"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Building, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Loader2, 
  ArrowUpRight 
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
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { UBS } from "@/lib/types";
import { ubsService } from "@/services/ubs-service";
import { openAfterDropdownClose } from "@/lib/query-cache";

export default function UBSPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [units, setUnits] = useState<UBS[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUnit, setNewUnit] = useState<Partial<UBS>>({ 
    name: "", 
    address: "", 
    managerName: "", 
    phone: "", 
    email: "", 
    operatingHours: "07:00 - 17:00",
    type: "UBS"
  });
  const { toast } = useToast();

  const loadUnits = useCallback(async (forceRefresh: boolean = false) => {
    try {
      const data = await ubsService.getUnits(forceRefresh);
      setUnits(data);
    } catch (error) {
      console.error("Erro ao sincronizar unidades de saúde:", error);
      toast({ title: "Erro", description: "Falha ao sincronizar unidades reais.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const filteredUBS = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return units;
    return units.filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.address.toLowerCase().includes(q) ||
      u.managerName?.toLowerCase().includes(q)
    );
  }, [units, searchTerm]);

  const handleSaveUnit = async () => {
    if (isSaving) return;
    if (!newUnit.name || !newUnit.address) {
      toast({ title: "Atenção", description: "Preencha o nome e o endereço da UBS.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (newUnit.id) {
        await ubsService.updateUnit(newUnit.id, newUnit);
        setUnits(prev => prev.map(u => (u.id === newUnit.id ? { ...u, ...newUnit } as UBS : u)));
        toast({ title: "Unidade Atualizada", description: `Os dados da ${newUnit.name} foram salvos no Firestore.` });
      } else {
        const unitPayload: Omit<UBS, "id"> = {
          name: newUnit.name || "",
          address: newUnit.address || "",
          managerName: newUnit.managerName,
          phone: newUnit.phone,
          email: newUnit.email,
          operatingHours: newUnit.operatingHours,
          type: newUnit.type as UBS["type"],
          status: 'active',
          location: { lat: -22.72, lng: -44.13 }
        };
        const newId = await ubsService.addUnit(unitPayload);
        setUnits(prev => [...prev, { id: newId, ...unitPayload }].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: "Unidade Cadastrada", description: `A ${newUnit.name} foi adicionada à rede municipal.` });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar unidade de saúde:", error);
      toast({ title: "Erro de Gravação", description: "Falha ao salvar no banco de dados.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenMaps = (ubs: UBS) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${ubs.location?.lat || -22.72},${ubs.location?.lng || -44.13}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Postos de Saúde (UBS)</h2>
          <p className="text-muted-foreground">Monitoramento da rede municipal real via Firestore.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setNewUnit({ name: "", address: "", managerName: "", phone: "", email: "", operatingHours: "07:00 - 17:00", type: "UBS" });
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md h-11 px-6 rounded-xl">
              <Plus className="h-4 w-4" /> Nova Unidade Real
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-2xl overflow-y-auto max-h-[90vh]">
            {isDialogOpen && (
              <>
                <DialogHeader>
                  <DialogTitle>{newUnit.id ? "Editar Unidade" : "Cadastrar Nova Unidade"}</DialogTitle>
                  <DialogDescription>Dados oficiais para o Teste Beta em Rio Claro - RJ.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nome da Unidade</Label>
                        <Input id="name" className="h-11 rounded-xl" value={newUnit.name} onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Tipo de Unidade</Label>
                        <Select value={newUnit.type} onValueChange={(val) => setNewUnit(prev => ({ ...prev, type: val as UBS["type"] }))}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UBS">UBS</SelectItem>
                            <SelectItem value="HOSPITAL">Hospital</SelectItem>
                            <SelectItem value="PRONTO_ATENDIMENTO">Pronto Atendimento</SelectItem>
                            <SelectItem value="ESPECIALIZADA">Clínica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Endereço Completo</Label>
                      <Input id="address" className="h-11 rounded-xl" value={newUnit.address} onChange={(e) => setNewUnit(prev => ({ ...prev, address: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-4 pt-2 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Responsável / Gerente</Label>
                        <Input className="h-11 rounded-xl" value={newUnit.managerName} onChange={(e) => setNewUnit(prev => ({ ...prev, managerName: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Telefone</Label>
                        <Input className="h-11 rounded-xl" value={newUnit.phone} onChange={(e) => setNewUnit(prev => ({ ...prev, phone: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving} className="rounded-xl">Cancelar</Button>
                  <Button onClick={handleSaveUnit} disabled={isSaving} className="h-11 rounded-xl shadow-lg bg-primary">
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Salvar no Firestore
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar unidade real por nome..." 
          className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card rounded-2xl">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-xs uppercase font-black text-muted-foreground">Sincronizando com Rio Claro...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="font-bold">Unidade</TableHead>
                  <TableHead className="font-bold">Responsável</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUBS.length > 0 ? filteredUBS.map((ubs) => (
                  <TableRow key={ubs.id} className="hover:bg-muted/10 group transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Building className="h-5 w-5" /></div>
                        <div>
                          <p className="font-black text-sm text-slate-800">{ubs.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{ubs.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold">{ubs.managerName || "A definir"}</TableCell>
                    <TableCell><Badge className="bg-emerald-50 text-emerald-700 border-none text-[9px] uppercase h-5 px-2">Real</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => handleOpenMaps(ubs)}><ArrowUpRight className="h-4 w-4" /></Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl shadow-xl w-48">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openAfterDropdownClose(() => { setNewUnit(ubs); setIsDialogOpen(true); })}><Edit className="h-4 w-4" /> Editar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={async () => {
                              try {
                                await ubsService.deleteUnit(ubs.id);
                                setUnits(prev => prev.filter(item => item.id !== ubs.id));
                                toast({ title: "Removido", description: "Unidade apagada do Firestore." });
                              } catch (error) {
                                console.error("Erro ao remover unidade de saúde:", error);
                                toast({ title: "Erro", description: "Falha ao remover unidade.", variant: "destructive" });
                              }
                            }}><Trash2 className="h-4 w-4" /> Excluir Real</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">Nenhuma UBS real cadastrada no Firestore ainda.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}