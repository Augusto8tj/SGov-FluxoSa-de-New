"use client";

import * as React from "react";
import { Moon, Sun, Palette, Check, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Theme = "blue" | "green" | "purple";
type Mode = "light" | "dark";

export function ThemeSelector() {
  const [theme, setTheme] = React.useState<Theme>("blue");
  const [mode, setMode] = React.useState<Mode>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("app-theme") as Theme;
    const savedMode = localStorage.getItem("app-mode") as Mode;
    if (savedTheme) setTheme(savedTheme);
    if (savedMode) setMode(savedMode);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    
    // Clean classes
    root.classList.remove("theme-green", "theme-purple", "dark");
    
    // Apply theme
    if (theme === "green") root.classList.add("theme-green");
    if (theme === "purple") root.classList.add("theme-purple");
    
    // Apply mode
    if (mode === "dark") root.classList.add("dark");
    
    localStorage.setItem("app-theme", theme);
    localStorage.setItem("app-mode", mode);
  }, [theme, mode, mounted]);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 rounded-full border-primary/20 bg-background hover:bg-primary/5 transition-all"
        >
          {mode === 'light' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-400" />}
          <span className="sr-only">Personalizar Interface</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-2xl">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground pb-2">
          <Palette className="h-3.5 w-3.5" /> Estilo de Cor
        </DropdownMenuLabel>
        
        <div className="grid gap-1">
          <DropdownMenuItem 
            onClick={() => setTheme("blue")} 
            className={cn("justify-between rounded-lg cursor-pointer", theme === "blue" && "bg-primary/10 text-primary")}
          >
            <div className="flex items-center gap-2 font-medium">
              <div className="h-3 w-3 rounded-full bg-[#3b82f6]" />
              <span>Azul Municipal</span>
            </div>
            {theme === "blue" && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setTheme("green")} 
            className={cn("justify-between rounded-lg cursor-pointer", theme === "green" && "bg-primary/10 text-primary")}
          >
            <div className="flex items-center gap-2 font-medium">
              <div className="h-3 w-3 rounded-full bg-[#16a34a]" />
              <span>Verde Saúde</span>
            </div>
            {theme === "green" && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setTheme("purple")} 
            className={cn("justify-between rounded-lg cursor-pointer", theme === "purple" && "bg-primary/10 text-primary")}
          >
            <div className="flex items-center gap-2 font-medium">
              <div className="h-3 w-3 rounded-full bg-[#9333ea]" />
              <span>Roxo Inovação</span>
            </div>
            {theme === "purple" && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="my-2" />
        
        <DropdownMenuLabel className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground pb-2">
          <Layout className="h-3.5 w-3.5" /> Luminosidade
        </DropdownMenuLabel>
        
        <div className="grid gap-1">
          <DropdownMenuItem 
            onClick={() => setMode("light")} 
            className={cn("justify-between rounded-lg cursor-pointer", mode === "light" && "bg-primary/10 text-primary")}
          >
            <div className="flex items-center gap-2 font-medium">
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>Modo Dia</span>
            </div>
            {mode === "light" && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setMode("dark")} 
            className={cn("justify-between rounded-lg cursor-pointer", mode === "dark" && "bg-primary/10 text-primary")}
          >
            <div className="flex items-center gap-2 font-medium">
              <Moon className="h-3.5 w-3.5 text-blue-400" />
              <span>Modo Noite</span>
            </div>
            {mode === "dark" && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
