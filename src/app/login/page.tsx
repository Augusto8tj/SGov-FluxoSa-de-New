"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, BrainCircuit, User, Key, Hospital, BadgeCheck, Heart, Ambulance } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const lowerEmail = email.toLowerCase();
    const demoUsers = [
      { email: 'secretario@rioclaro.rj.gov.br', pass: 'admin123', role: 'admin' },
      { email: 'gerente.ubs@rioclaro.rj.gov.br', pass: 'admin123', role: 'ubs' },
      { email: 'motorista@rioclaro.rj.gov.br', pass: 'admin123', role: 'driver' }
    ];

    const foundUser = demoUsers.find(u => u.email === lowerEmail && u.pass === password);

    if (foundUser) {
      const mockUser = {
        email: foundUser.email,
        uid: `demo-${foundUser.role}`,
        role: foundUser.role.toUpperCase(),
        isDemo: true
      };
      
      sessionStorage.setItem("sgov_demo_user", JSON.stringify(mockUser));
      
      toast({
        title: "Acesso de Demonstração Autorizado",
        description: `Bem-vindo ao sistema, ${foundUser.email.split('@')[0]}.`,
      });

      if (foundUser.role === 'driver') {
        router.push("/driver");
      } else if (foundUser.role === 'ubs') {
        router.push("/ubs-portal");
      } else {
        router.push("/dashboard");
      }
      return;
    }

    toast({
      title: "Falha na Autenticação",
      description: "Utilize as credenciais de demonstração abaixo.",
      variant: "destructive"
    });
  };

  const fillCredentials = (type: 'admin' | 'ubs' | 'driver') => {
    const creds = {
      admin: { email: 'secretario@rioclaro.rj.gov.br', pass: 'admin123' },
      ubs: { email: 'gerente.ubs@rioclaro.rj.gov.br', pass: 'admin123' },
      driver: { email: 'motorista@rioclaro.rj.gov.br', pass: 'admin123' }
    };
    setEmail(creds[type].email);
    setPassword(creds[type].pass);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 overflow-x-hidden">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-8 py-10">
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl ring-4 ring-primary/10 transition-transform hover:scale-105 overflow-hidden">
            <Image 
              src="/icons/maskable-icon-512x512.png" 
              alt="Logo FluxoSaúde" 
              width={64} 
              height={64} 
              className="object-contain"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-primary">SGov FluxoSaúde</h1>
            <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">Prefeitura de Rio Claro - RJ</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden w-full">
          <CardHeader className="bg-primary/5 pb-6 text-center border-b border-primary/5">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              Acesso Identificado <BadgeCheck className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription className="text-xs">Versão de Lançamento Municipal 2024.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase text-muted-foreground ml-1">E-mail Institucional</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="usuario@rioclaro.rj.gov.br" 
                    className="pl-10 h-12 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Senha de Acesso</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 h-12 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase font-black">
                    <span className="bg-white dark:bg-slate-900 px-3 text-muted-foreground tracking-widest">Atalhos de Perfil</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="justify-start gap-3 h-12 font-bold border-primary/20 hover:bg-primary/5 rounded-xl group transition-all"
                    onClick={() => fillCredentials('admin')}
                  >
                    <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20"><ShieldCheck className="h-4 w-4 text-primary" /></div>
                    <div className="text-left leading-none">
                      <p className="text-xs">Secretário de Ordem Pública</p>
                      <p className="text-[9px] font-medium text-muted-foreground">Visão Estratégica & IA</p>
                    </div>
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="justify-start gap-3 h-12 font-bold border-emerald-500/20 hover:bg-emerald-500/5 rounded-xl group transition-all"
                    onClick={() => fillCredentials('ubs')}
                  >
                    <div className="bg-emerald-500/10 p-1.5 rounded-lg group-hover:bg-emerald-500/20"><Hospital className="h-4 w-4 text-emerald-600" /></div>
                    <div className="text-left leading-none">
                      <p className="text-xs">Gerente de UBS</p>
                      <p className="text-[9px] font-medium text-muted-foreground">Portal da Unidade Local</p>
                    </div>
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="justify-start gap-3 h-12 font-bold border-amber-500/20 hover:bg-amber-500/5 rounded-xl group transition-all"
                    onClick={() => fillCredentials('driver')}
                  >
                    <div className="bg-amber-500/10 p-1.5 rounded-lg group-hover:bg-amber-500/20"><Ambulance className="h-4 w-4 text-amber-600" /></div>
                    <div className="text-left leading-none">
                      <p className="text-xs">Condutor Sanitário</p>
                      <p className="text-[9px] font-medium text-muted-foreground">App de Campo & Rotas</p>
                    </div>
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="justify-start gap-3 h-12 font-bold border-rose-500/20 hover:bg-rose-500/5 rounded-xl group transition-all"
                    onClick={() => router.push('/patient-portal')}
                  >
                    <div className="bg-rose-500/10 p-1.5 rounded-lg group-hover:bg-rose-500/20"><Heart className="h-4 w-4 text-rose-600" /></div>
                    <div className="text-left leading-none">
                      <p className="text-xs">Portal do Cidadão</p>
                      <p className="text-[9px] font-black text-rose-600 uppercase">Cód. Demo: 102030</p>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button type="submit" className="w-full h-12 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 rounded-xl">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Entrar no Sistema
              </Button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-40">
                <BrainCircuit className="h-3.5 w-3.5 text-primary" /> IA & Sigilo Rio Claro
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <footer className="w-full py-8 flex flex-col items-center gap-4 mt-auto">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> PMRC &bull; Secretaria de Ordem Pública
          </div>
          <p className="text-[9px] text-muted-foreground/40 font-medium italic">Sistema Municipal de Gestão de Transporte Sanitário</p>
        </div>
      </footer>
    </div>
  );
}
