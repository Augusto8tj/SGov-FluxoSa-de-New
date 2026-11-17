"use client";

import { ThemeSelector } from "@/components/theme-selector";
import { Ambulance, Heart, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Layout do Portal do Paciente.
 * Atualizado para Next.js 15: params é uma Promise.
 */

export default function PatientLayout(props: {
  children: React.ReactNode;
}) {
  const children = props.children;

  const router = useRouter();
  const pathname = usePathname();
  const isViewing = pathname.includes("/view");

  const handleLogout = () => {
    if (isViewing) {
      sessionStorage.removeItem("patient_access_code");
      router.push("/patient-portal");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body antialiased flex flex-col items-center">
      <header className="w-full max-w-md bg-white dark:bg-slate-900 border-b p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/patient-portal" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Ambulance className="size-5" />
          </div>
          <span className="font-black text-primary tracking-tight uppercase text-sm">Meu Transporte</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <ThemeSelector />
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-destructive h-9 w-9 rounded-full transition-colors"
            onClick={handleLogout}
            title={isViewing ? "Encerrar Consulta" : "Voltar ao Sistema"}
          >
            <LogOut className={`size-5 ${!isViewing ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-md p-4 pb-20">
        {children}
      </main>

      <footer className="w-full max-w-md p-6 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          <Heart className="size-3 text-rose-500 fill-rose-500" /> PMRC &bull; Rio Claro, RJ
        </div>
        <p className="text-[9px] text-muted-foreground/60">Este é um canal público. Suas informações clínicas são preservadas.</p>
      </footer>
    </div>
  );
}
