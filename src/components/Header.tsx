import { Menu, Bell, BellOff, Search, Settings, LogOut, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationSettings } from "./NotificationSettings";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useNotifications();
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fechar popover quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationSettingsOpen(false);
      }
    }

    if (notificationSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationSettingsOpen]);

  // Função para gerar as iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm dark:shadow-lg dark:shadow-black/20">
      <div className="flex items-center gap-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-accent/50 dark:hover:bg-accent/30"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>
      
      <div className="flex items-center gap-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="hover:bg-accent/50 dark:hover:bg-accent/30 transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Alternar tema</span>
        </Button>
        
        <div className="relative" ref={notificationRef}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setNotificationSettingsOpen(!notificationSettingsOpen)}
            className={`hover:bg-accent/50 dark:hover:bg-accent/30 transition-colors relative ${
              !settings.enabled ? 'text-muted-foreground' : 'text-foreground'
            }`}
          >
            {settings.enabled ? (
          <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
            <span className="sr-only">Configurações de Notificação</span>
        </Button>
        
          {/* Indicador visual de status */}
          {!settings.enabled && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></div>
          )}
          
          <NotificationSettings 
            isOpen={notificationSettingsOpen}
            onClose={() => setNotificationSettingsOpen(false)}
          />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/configuracoes')}
          className="hover:bg-accent/50 dark:hover:bg-accent/30 transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Configurações</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-9 w-9 rounded-full hover:bg-accent/50 dark:hover:bg-accent/30 transition-colors"
            >
              <Avatar className="h-9 w-9 ring-2 ring-border/50 dark:ring-border/30">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {profile ? getInitials(profile.nome) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-semibold">
              {profile ? profile.nome : "Minha Conta"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => navigate('/configuracoes')}
              className="cursor-pointer hover:bg-accent/50 dark:hover:bg-accent/30"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="cursor-pointer hover:bg-destructive/10 dark:hover:bg-destructive/20 text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
