
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  KeyRound, 
  Search, 
  HelpCircle, 
  ShieldCheck,
  Ambulance,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { requestService } from "@/services/request-service";

export default function PatientPortalLogin() {
  const [code, setCode] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast({ title: "Código Inválido", description: "O código deve ter 6 dígitos.", variant: "destructive" });
      return;
    }

    try {
      // Busca instantânea priorizando dados mock no serviço
      const request = await requestService.getByAccessCode(code);
      if (request) {
        sessionStorage.setItem("patient_access_code", code);
        router.push("/patient-portal/view");
      } else {
        toast({ title: "Não Encontrado", description: "Verifique o código com sua Unidade de Saúde.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro ao consultar código de acesso do cidadão:", error);
      toast({ title: "Erro no Sistema", description: "Tente novamente em instantes.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pt-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Portal do Cidadão</h2>
        <p className="text-sm text-slate-500 max-w-[280px] mx-auto">
          Consulte o status do seu transporte sanitário de forma rápida e segura.
        </p>
      </div>

      <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground text-center pb-8 pt-8">
          <CardTitle className="text-lg uppercase tracking-widest font-black">Acesso Seguro</CardTitle>
          <CardDescription className="text-primary-foreground/70 text-xs">Informe o código fornecido pela UBS.</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2 text-center">
              <Label htmlFor="code" className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Código de 6 Dígitos</Label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                <Input 
                  id="code"
                  type="text" 
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000" 
                  className="h-20 text-4xl text-center font-black tracking-[0.5em] pl-12 rounded-2xl bg-slate-50 focus-visible:ring-primary/20 border-none shadow-inner"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest shadow-lg shadow-primary/20"
              disabled={code.length < 6}
            >
              <Search className="h-5 w-5 mr-2" />
              Consultar Viagem
            </Button>
          </form>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-900">Onde encontro o código?</p>
              <p className="text-[10px] text-amber-700 leading-relaxed">
                O código de acesso é único para cada agendamento e deve ser solicitado na recepção da sua Unidade de Saúde (UBS).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Horários Precisos</p>
            <p className="text-[10px] text-slate-500 uppercase font-medium">Sincronizado com a Central</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
            <Ambulance className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Identificação de Viatura</p>
            <p className="text-[10px] text-slate-500 uppercase font-medium">Segurança no embarque</p>
          </div>
        </div>
      </div>
    </div>
  );
}
