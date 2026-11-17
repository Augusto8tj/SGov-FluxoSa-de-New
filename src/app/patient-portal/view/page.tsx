"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Ambulance, 
  User, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Info,
  PhoneCall,
  ShieldCheck,
  Navigation,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requestService } from "@/services/request-service";
import { TransportRequest } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function PatientManifestView() {
  const [request, setRequest] = useState<TransportRequest | null>(null);
  const router = useRouter();

  useEffect(() => {
    const code = sessionStorage.getItem("patient_access_code");
    if (!code) {
      router.push("/patient-portal");
      return;
    }

    const loadData = async () => {
      try {
        const data = await requestService.getByAccessCode(code);
        if (data) {
          setRequest(data);
        } else {
          router.push("/patient-portal");
        }
      } catch (error) {
        console.error("Erro ao carregar manifesto do cidadão:", error);
        router.push("/patient-portal");
      }
    };

    loadData();
  }, [router]);

  const maskName = (name: string) => {
    const parts = name.split(" ");
    return parts.map((p) => {
      if (p.length <= 2) return p;
      return p[0] + "*".repeat(p.length - 1);
    }).join(" ");
  };

  if (!request) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-2 text-muted-foreground hover:text-primary pl-0"
        onClick={() => router.push("/patient-portal")}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{maskName(request.patientName)}</h2>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px] font-black uppercase tracking-tighter">Dados Protegidos</Badge>
            <span className="text-[10px] text-muted-foreground font-bold">CÓD: {request.patientAccessCode}</span>
          </div>
        </div>
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg",
          request.status === 'APPROVED' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
        )}>
          {request.status === 'APPROVED' ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className={cn(
          "p-6 pb-8 text-white relative",
          request.status === 'APPROVED' ? "bg-emerald-600" : "bg-amber-600"
        )}>
          <div className="absolute top-0 right-0 p-4 opacity-10"><Ambulance className="h-20 w-20" /></div>
          <div className="relative space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Status do Transporte</p>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">
              {request.status === 'APPROVED' ? 'Confirmado' : 'Em Análise'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Navigation className="h-4 w-4 text-primary" /> Roteiro da Viagem
            </h4>
            <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              <div className="flex items-start gap-4 relative">
                <div className="mt-1 size-10 rounded-2xl bg-primary/10 flex items-center justify-center z-10 shrink-0 border border-primary/20 shadow-sm">
                  <Navigation className="size-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-primary uppercase tracking-tighter leading-none">Local de Embarque</p>
                  <p className="text-base font-black text-slate-700 leading-tight">{request.pickupLocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 relative">
                <div className="mt-1 size-10 rounded-2xl bg-rose-50 flex items-center justify-center z-10 shrink-0 border border-rose-100 shadow-sm">
                  <MapPin className="size-5 text-rose-500" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-tighter leading-none">Destino Final</p>
                  <p className="text-base font-black text-slate-700 leading-tight">{request.destinationLocation}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-50" />

          {request.status === 'APPROVED' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Ambulance className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase">Viatura</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-black text-slate-700">{request.vehicleId || "Designada"}</p>
                    {request.vehiclePlate && (
                      <Badge variant="outline" className="w-fit mt-1 font-mono text-xs border-primary/20 text-primary bg-white px-2.5 h-6">
                        PLACA: {request.vehiclePlate}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-primary">
                    <User className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase">Condutor</span>
                  </div>
                  <p className="text-sm font-black text-slate-700">{request.driverId || "Plantão"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Horário Previsto de Saída</p>
                    <p className="text-lg font-black text-slate-700">
                      {new Date(request.requestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="bg-amber-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-inner">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700 leading-tight">Aguardando Triagem Logística</p>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                  A Secretaria de Saúde está definindo o melhor veículo e condutor para o seu embarque em <span className="font-bold text-slate-700">{request.pickupLocation}</span>.
                </p>
              </div>
            </div>
          )}

          <Separator className="bg-slate-50" />

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <PhoneCall className="h-4 w-4 text-primary" /> Central de Atendimento
            </h4>
            <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10 flex items-center justify-between group hover:bg-primary/10 transition-colors">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-primary uppercase">Regulação Municipal</p>
                <p className="text-sm font-black text-slate-700">(19) 3526-0000</p>
              </div>
              <Button size="icon" className="rounded-full h-10 w-10 shadow-lg" asChild>
                <a href="tel:1935260000"><PhoneCall className="h-4 w-4" /></a>
              </Button>
            </div>
            <p className="text-[9px] text-muted-foreground px-2 italic text-center">
              Para sua segurança e do condutor, não expomos contatos pessoais. Use a Central para dúvidas sobre atrasos ou cancelamentos.
            </p>
          </div>

          <Separator className="bg-slate-50" />

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" /> Orientações de Segurança
            </h4>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-[11px] font-medium text-slate-600">Esteja no local de embarque (<span className="font-bold">{request.pickupLocation}</span>) com 15 minutos de antecedência.</p>
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-[11px] font-medium text-slate-600">Tenha em mãos o documento de identidade com foto.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 opacity-30 pt-2">
            <ShieldCheck className="h-3 w-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">Protocolo de Privacidade Rio Claro</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
