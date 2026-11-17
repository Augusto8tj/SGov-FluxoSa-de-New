
"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Ambulance,
  Hospital,
  MapPin,
  ClipboardList,
  ShieldCheck,
  LogOut,
  Settings,
  MessageSquare,
  BookOpen,
  Fingerprint,
  Route,
  UserRoundCheck,
  Printer
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

/**
 * Menu organizado por ordem natural de atividade:
 * 1. Monitoramento (Dashboard)
 * 2. Triagem (Painel de Comando)
 * 3. Gestão de Pedidos (Agendamentos)
 * 4. Planejamento IA (Otimizador)
 * 5. Supervisão em Tempo Real (Manifestos)
 * 6. Gestão de Condutores (Motoristas)
 * 7. Feedback de Campo (Relatórios)
 * 8. Base de Dados (Pacientes, Veículos, UBS)
 * 9. Documentos (Impressão)
 * 10. Segurança (Auditoria)
 */
const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Painel de Comando", icon: ShieldCheck, url: "/dashboard/admin" },
  { title: "Agendamentos", icon: ClipboardList, url: "/dashboard/requests" },
  { title: "Otimizador de Rotas", icon: MapPin, url: "/dashboard/routes" },
  { title: "Manifestos de Viagem", icon: Route, url: "/dashboard/manifests" },
  { title: "Motoristas", icon: UserRoundCheck, url: "/dashboard/drivers" },
  { title: "Relatórios de Campo", icon: MessageSquare, url: "/dashboard/reports" },
  { title: "Pacientes", icon: Users, url: "/dashboard/patients" },
  { title: "Veículos", icon: Ambulance, url: "/dashboard/fleet" },
  { title: "Postos (UBS)", icon: Hospital, url: "/dashboard/ubs" },
  { title: "Documentos", icon: Printer, url: "/dashboard/docs" },
  { title: "Auditoria", icon: Fingerprint, url: "/dashboard/audit" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 w-full">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            S
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none">FluxoSaúde</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Rio Claro - RJ</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu className="px-2 py-4">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild>
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="size-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Ajuda/Manual" asChild>
              <Link href="/dashboard/help" className="flex items-center gap-3 text-primary font-semibold">
                <BookOpen className="size-5" />
                <span>Ajuda/Manual</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="px-3 pb-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
            {state !== "collapsed" && "Versão 1.2.0 Stable"}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Configurações" asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-3">
                <Settings className="size-5" />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sair" 
              className="text-destructive hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="size-5" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
