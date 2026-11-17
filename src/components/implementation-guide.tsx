"use client";

import React, { useState, useEffect } from "react";
import { 
  Lightbulb, 
  Check, 
  Building, 
  Ambulance, 
  UserCheck, 
  ChevronRight, 
  ChevronLeft,
  Users,
  ClipboardPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ubsService } from "@/services/ubs-service";
import { vehicleService } from "@/services/vehicle-service";
import { patientService } from "@/services/patient-service";
import { requestService } from "@/services/request-service";
import Link from "next/link";

/**
 * @fileOverview Componente unificado de dicas de implantação.
 * Centraliza o fluxo de "Wizard" para o Teste Beta real.
 */

export function ImplementationGuide() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(1);
  const [unitCount, setUnitCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;

    const loadProgress = async () => {
      try {
        if (user.role === 'ADMIN' || user.role === 'SECRETARY') {
          const [units, vehicles] = await Promise.all([
            ubsService.getUnits(),
            vehicleService.getVehicles()
          ]);
          if (cancelled) return;
          setUnitCount(units.length);
          setVehicleCount(vehicles.length);
          if (units.length > 0 && vehicles.length === 0) setGuideStep(2);
          else if (units.length > 0 && vehicles.length > 0) setGuideStep(3);
        } else if (user.role === 'UBS' || user.role === 'UBS_MANAGER') {
          const [pats, reqs] = await Promise.all([
            patientService.getPatients(),
            requestService.getRequests()
          ]);
          if (cancelled) return;
          const ubsId = user.unitId || "UBS-01";
          const myReqs = reqs.filter(r => r.ubsId === ubsId || r.operatorId === "UBS_MGR");
          setPatientCount(pats.length);
          setRequestsCount(myReqs.length);
          if (pats.length > 0 && myReqs.length === 0) setGuideStep(2);
        }
      } catch (e) {
        console.error("Error loading guide progress", e);
      }
    };

    loadProgress();
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN' || user.role === 'SECRETARY';
  const isUbs = user.role === 'UBS' || user.role === 'UBS_MANAGER';

  if (!isAdmin && !isUbs) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 rounded-full border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-600 shadow-sm transition-all"
          title="Dicas de Implantação"
        >
          <Lightbulb className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        {open && (
          <>
            <div className="bg-amber-500 p-6 text-white">
              <DialogHeader className="text-left space-y-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2.5 rounded-2xl">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black uppercase tracking-tighter">
                      {isAdmin ? "Roteiro de Implantação" : "Roteiro da Unidade"}
                    </DialogTitle>
                    <DialogDescription className="text-amber-100 text-[10px] uppercase font-bold tracking-widest">
                      Passo {guideStep} de {isAdmin ? "3" : "2"} &bull; {isAdmin ? "Gabinete" : "UBS Central"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>
            <div className="p-8 space-y-8 bg-white min-h-[350px] flex flex-col">
              
              {isAdmin && (
                <>
                  {guideStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-150">
                      <div className="space-y-2">
                        <Badge className="bg-amber-100 text-amber-700 border-none px-3 h-6 mb-2">ETAPA 1: AS BASES</Badge>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight">Cadastrar Unidades Oficiais</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Para que as solicitações funcionem, você precisa definir os postos de saúde (UBS) e hospitais no sistema.
                        </p>
                      </div>
                      <div className={cn("p-4 rounded-2xl border flex items-center gap-4 transition-all", unitCount > 0 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50")}>
                        <div className={cn("p-3 rounded-xl shrink-0", unitCount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary")}>
                          {unitCount > 0 ? <Check className="h-5 w-5" /> : <Building className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-700">{unitCount} Unidades registradas</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{unitCount > 0 ? "Passo Concluído" : "Ação Necessária"}</p>
                        </div>
                        {unitCount === 0 && (
                          <Button size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase" asChild onClick={() => setOpen(false)}>
                            <Link href="/dashboard/ubs">Ir agora</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {guideStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-150">
                      <div className="space-y-2">
                        <Badge className="bg-amber-100 text-amber-700 border-none px-3 h-6 mb-2">ETAPA 2: A FROTA</Badge>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight">Carga da Frota Municipal</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Registre as viaturas, ambulâncias e vans. Informe o <b>odômetro inicial</b> para monitoramento via IA.
                        </p>
                      </div>
                      <div className={cn("p-4 rounded-2xl border flex items-center gap-4 transition-all", vehicleCount > 0 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50")}>
                        <div className={cn("p-3 rounded-xl shrink-0", vehicleCount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary")}>
                          {vehicleCount > 0 ? <Check className="h-5 w-5" /> : <Ambulance className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-700">{vehicleCount} Veículos na base</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{vehicleCount > 0 ? "Passo Concluído" : "Ação Necessária"}</p>
                        </div>
                        {vehicleCount === 0 && (
                          <Button size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase" asChild onClick={() => setOpen(false)}>
                            <Link href="/dashboard/fleet">Configurar</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {guideStep === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-150">
                      <div className="space-y-2">
                        <Badge className="bg-amber-100 text-amber-700 border-none px-3 h-6 mb-2">ETAPA 3: EQUIPE</Badge>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight">Credenciar Condutores</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Adicione os motoristas oficiais para que o Otimizador possa atribuir missões reais.
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl border bg-slate-50 flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-xl shrink-0">
                          <UserCheck className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-700">Controle de Condutores</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Menu: Motoristas</p>
                        </div>
                        <Button size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase" asChild onClick={() => setOpen(false)}>
                          <Link href="/dashboard/drivers">Acessar</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {isUbs && (
                <>
                  {guideStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-150">
                      <div className="space-y-2">
                        <Badge className="bg-amber-100 text-amber-700 border-none px-3 h-6 mb-2">ETAPA 1: CADASTRO</Badge>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight">Alimentar Base de Cidadãos</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Antes de pedir transporte, cadastre os moradores da sua unidade com o número do <b>CNS oficial</b>.
                        </p>
                      </div>
                      <div className={cn("p-4 rounded-2xl border flex items-center gap-4 transition-all", patientCount > 0 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50")}>
                        <div className={cn("p-3 rounded-xl shrink-0", patientCount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary")}>
                          {patientCount > 0 ? <Check className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-700">{patientCount} Cidadãos na sua base</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{patientCount > 0 ? "Pronto para Agendar" : "Ação Necessária"}</p>
                        </div>
                        {patientCount === 0 && (
                          <Button size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase" asChild onClick={() => setOpen(false)}>
                            <Link href="/ubs-portal/patients">Ir para base</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {guideStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-150">
                      <div className="space-y-2">
                        <Badge className="bg-amber-100 text-amber-700 border-none px-3 h-6 mb-2">ETAPA 2: AGENDAMENTO</Badge>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight">Primeiros Pedidos Reais</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Realize as solicitações entre <b>08h e 13h</b> para que o Gabinete planeje a rota do dia seguinte.
                        </p>
                      </div>
                      <div className={cn("p-4 rounded-2xl border flex items-center gap-4 transition-all", requestsCount > 0 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50")}>
                        <div className={cn("p-3 rounded-xl shrink-0", requestsCount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary")}>
                          {requestsCount > 0 ? <Check className="h-5 w-5" /> : <ClipboardPlus className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-700">{requestsCount} Pedidos enviados</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{requestsCount > 0 ? "Ótimo Trabalho" : "Aguardando Janela"}</p>
                        </div>
                        {requestsCount === 0 && (
                          <Button size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase" asChild onClick={() => setOpen(false)}>
                            <Link href="/ubs-portal/requests">Criar Pedido</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="mt-auto flex items-center justify-between pt-6 border-t">
                <div className="flex gap-1">
                  {[1, 2, isAdmin ? 3 : null].filter(Boolean).map(step => (
                    <div 
                      key={step} 
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        step === guideStep ? "bg-amber-500 w-8" : "bg-slate-200 w-1.5"
                      )} 
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  {guideStep > 1 && (
                    <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl gap-2 font-bold text-slate-400" onClick={() => setGuideStep(prev => prev - 1)}>
                      <ChevronLeft className="h-4 w-4" /> Voltar
                    </Button>
                  )}
                  {guideStep < (isAdmin ? 3 : 2) ? (
                    <Button size="sm" className="h-9 px-4 rounded-xl gap-2 font-bold bg-amber-500 hover:bg-amber-600" onClick={() => setGuideStep(prev => prev + 1)}>
                      Próximo <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <DialogClose asChild>
                      <Button size="sm" className="h-9 px-4 rounded-xl gap-2 font-bold bg-emerald-600 hover:bg-emerald-700">
                        Entendido!
                      </Button>
                    </DialogClose>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
