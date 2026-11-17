"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  HelpCircle,
  PhoneCall,
  Clock,
  MapPin,
  ExternalLink,
  Route,
  BookOpen
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  { title: "Início UBS", icon: LayoutDashboard, url: "/ubs-portal" },
  { title: "Novas Solicitações", icon: ClipboardList, url: "/ubs-portal/requests" },
  { title: "Manifestos de Viagem", icon: Route, url: "/ubs-portal/manifests" },
  { title: "Meus Pacientes", icon: Users, url: "/ubs-portal/patients" },
];

export function UbsSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 w-full">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
            U
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none text-primary">Portal UBS</span>
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
              <Link href="/ubs-portal/help" className="flex items-center gap-3 text-primary font-semibold">
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
            {state !== "collapsed" && "v1.0.0 STABLE"}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <SidebarMenuButton tooltip="Suporte Técnico">
                  <HelpCircle className="size-5" />
                  <span>Suporte Logística</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                    <HelpCircle className="h-5 w-5 text-primary" /> Central de Suporte
                  </DialogTitle>
                  <DialogDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                    Logística & Transporte Sanitário
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 transition-colors hover:bg-primary/10">
                      <div className="bg-primary/20 p-2.5 rounded-xl text-primary">
                        <PhoneCall className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-primary tracking-tighter">Emergências de Rota</p>
                        <p className="text-lg font-black text-slate-800">(19) 3526-0000</p>
                        <p className="text-[9px] font-medium text-muted-foreground">Disponível 24h para urgências</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="bg-slate-200 p-2.5 rounded-xl text-slate-600">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Atendimento Administrativo</p>
                        <p className="text-sm font-bold text-slate-700">Segunda a Sexta, 07h às 17h</p>
                        <p className="text-[9px] font-medium text-muted-foreground">Dúvidas sobre agendamentos e cadastros</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="bg-slate-200 p-2.5 rounded-xl text-slate-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Localização</p>
                        <p className="text-sm font-bold text-slate-700">Central de Regulação Municipal</p>
                        <p className="text-[9px] font-medium text-muted-foreground">Av. Principal, s/n - Rio Claro, RJ</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Aviso Importante</p>
                    <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                      Para cancelamentos de última hora ou pacientes críticos, utilize sempre o contato telefônico direto para garantir a agilidade na rota.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 rounded-xl h-11 text-xs font-bold gap-2" asChild>
                    <a href="tel:1935260000">
                      <PhoneCall className="h-3.5 w-3.5" /> Ligar Agora
                    </a>
                  </Button>
                  <Button className="flex-1 rounded-xl h-11 text-xs font-bold gap-2 shadow-lg shadow-primary/20">
                    Abrir Chamado <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sair" 
              className="text-destructive hover:text-destructive" 
              onClick={logout}
            >
              <LogOut className="size-5" />
              <span>Sair do Portal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
