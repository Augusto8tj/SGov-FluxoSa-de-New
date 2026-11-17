"use client";

import { UbsSidebar } from "@/components/ubs/ubs-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeSelector } from "@/components/theme-selector";
import { ImplementationGuide } from "@/components/implementation-guide";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview Layout do Portal UBS.
 * Atualizado para Next.js 15: params é uma Promise.
 */

export default function UbsLayout(props: {
  children: React.ReactNode;
}) {
  const children = props.children;

  const { user, loading } = useAuth();
  const router = useRouter();
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">Acessando Unidade...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <UbsSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-3 sm:px-4 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1 overflow-hidden">
            <h1 className="text-[10px] sm:text-xs font-bold text-primary truncate uppercase tracking-widest leading-none">
              Portal Unidade de Saúde <span className="hidden xs:inline">&bull; Gestão Local</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <ImplementationGuide />
            <ThemeSelector />
            <div className="flex flex-col items-end text-right">
              <p className="text-[10px] sm:text-xs font-bold leading-none">{user.email?.split('@')[0]}</p>
              <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase font-black tracking-tighter">UBS Central</p>
            </div>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-[10px] sm:text-xs shrink-0 uppercase shadow-inner">
              {user.email?.[0] || 'U'}
            </div>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
