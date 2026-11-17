
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LayoutDashboard, ShieldAlert, LogOut } from "lucide-react";
import { ThemeSelector } from "@/components/theme-selector";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Layout do Aplicativo do Condutor.
 * Corrigido erro de hidratação através do controle de montagem (isMounted).
 */

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router, isMounted]);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">Sincronizando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body antialiased pb-20 max-w-md mx-auto border-x shadow-xl">
      <header className="bg-primary p-4 text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white text-primary font-bold p-1 rounded">RC</div>
            <h1 className="font-bold tracking-tight">SGov Motorista - RJ</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 h-9 w-9 rounded-full transition-colors"
              onClick={logout}
              title="Sair do Sistema"
            >
              <LogOut className="size-5" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold uppercase shadow-inner">
              {user.email?.[0] || 'M'}
            </div>
          </div>
        </div>
      </header>
      <main className="p-4">
        {children}
      </main>
      <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 z-50">
        <Link 
          href="/driver" 
          className={cn(
            "flex flex-col items-center p-2",
            pathname === "/driver" ? "text-primary" : "text-slate-400"
          )}
        >
          <LayoutDashboard className="size-6" />
          <span className="text-[10px] font-bold mt-1">Início</span>
        </Link>
        <Link 
          href="/driver/guidelines" 
          className={cn(
            "flex flex-col items-center p-2",
            pathname === "/driver/guidelines" ? "text-primary" : "text-slate-400"
          )}
        >
          <ShieldAlert className="size-6" />
          <span className="text-[10px] font-bold mt-1">Protocolos</span>
        </Link>
      </nav>
    </div>
  );
}
