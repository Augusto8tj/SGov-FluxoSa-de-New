"use client";

import { useState, useEffect } from "react";
import { Download, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

/**
 * @fileOverview Gerenciador de Instalação PWA e Notificações.
 * Utiliza agora os ícones oficiais enviados para a identidade visual.
 */
export function PwaHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallNudge, setShowInstallNudge] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");
  const { toast } = useToast();

  useEffect(() => {
    // 1. Lógica de Instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostra o nudge após 5 segundos para não ser intrusivo
      setTimeout(() => setShowInstallNudge(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Lógica de Notificações
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallNudge(false);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Erro ao instalar PWA:", error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({ title: "Não suportado", description: "Seu navegador não suporta notificações.", variant: "destructive" });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        new Notification("SGov FluxoSaúde", {
          body: "Notificações ativadas com sucesso! Você receberá alertas de rotas e missões.",
          icon: "/icons/icon-192x192.png" // Utilizando o ícone real enviado
        });
        toast({ title: "Notificações Ativas", description: "Você agora receberá alertas em tempo real." });
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificação:", error);
    }
  };

  if (!showInstallNudge && notificationPermission === 'granted') return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] pointer-events-none md:max-w-sm md:left-auto md:right-6 md:bottom-6">
      <div className="space-y-3">
        {/* Nudge de Instalação */}
        {showInstallNudge && (
          <Card className="pointer-events-auto p-4 border-none bg-primary text-white shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <Download className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">Instalar Aplicativo</p>
                <p className="text-[10px] opacity-80 mt-1">Acesse o FluxoSaúde diretamente da sua tela inicial.</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="secondary" className="h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg" onClick={handleInstall}>
                    Instalar Agora
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white" onClick={() => setShowInstallNudge(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Nudge de Notificações */}
        {notificationPermission === 'default' && (
          <Card className="pointer-events-auto p-4 border-none bg-emerald-600 text-white shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bell className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">Alertas em Tempo Real</p>
                <p className="text-[10px] opacity-80 mt-1">Ative as notificações para receber atualizações de escala e emergências.</p>
                <Button 
                  size="sm" 
                  className="mt-3 h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg bg-white text-emerald-700 hover:bg-white/90"
                  onClick={requestNotificationPermission}
                >
                  Ativar Alertas
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
