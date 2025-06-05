import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  Warehouse,
  ClipboardList,
  BarChart3,
  Settings,
  Store,
  Users,
  Truck,
  FileText,
  Flame,
  Radio,
  Building,
  User,
  Group,
  CalendarCheck,
  Cylinder,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  end?: boolean;
  open?: boolean;
}

const NavItem = ({ to, icon: Icon, label, end, open }: NavItemProps) => {
  const navLink = (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon 
            className={cn(
              "flex-shrink-0 h-5 w-5", 
              !open && "mx-auto",
              !open && isActive && "text-white"
            )} 
          />
          {open && <span className="transition-opacity duration-200 whitespace-nowrap sidebar-item-text">{label}</span>}
        </>
      )}
    </NavLink>
  );

  // Retorna com tooltip se não estiver aberto
  if (!open) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{navLink}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  // Retorna sem tooltip se estiver aberto
  return navLink;
};

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const toggleSidebar = () => setOpen(!open);

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-10 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex flex-col w-64 bg-sidebar border-r border-gray-200 h-screen transition-all duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16"
        )}
      >
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {/* Logo */}
            {!open ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="flex items-center justify-center w-full"
                    onClick={toggleSidebar}
                  >
                    <Flame className="h-8 w-8 text-white cursor-pointer" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Expandir menu</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <div className="flex items-center">
                  <Flame className="h-8 w-8 text-white" />
                  <span className="ml-2 text-xl font-bold text-sidebar-foreground">FireBlue</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-sidebar-foreground"
                      onClick={toggleSidebar}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      <span className="sr-only">Fechar menu</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Minimizar menu
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
        
        <TooltipProvider>
          <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
            <NavItem to="/" icon={BarChart3} label="Dashboard" end open={open} />
            <NavItem to="/inventario" icon={Warehouse} label="Inventário" open={open} />
            <NavItem to="/materia-prima" icon={Cylinder} label="Materia Prima" open={open} />
            <NavItem to="/produtos" icon={Package} label="Produtos" open={open} />
            <NavItem to="/vendas" icon={ShoppingCart} label="Vendas" open={open} />
            <NavItem to="/compras" icon={Truck} label="Compras" open={open} />
            <NavItem to="/clientes" icon={Users} label="Clientes" open={open} />
            <NavItem to="/terceiros" icon={Building} label="Terceiros" open={open} />
            <NavItem to="/fichas" icon={ArrowUpDown} label="Fichas" open={open} />
            <NavItem to="/relatorios" icon={FileText} label="Relatórios" open={open} />
            <NavItem to="/ordens" icon={ClipboardList} label="Ordens" open={open} />
            <NavItem to="/fechamento-semanal" icon={CalendarCheck} label="Fechamento Semanal" open={open} />
            <NavItem to="/configuracoes" icon={Settings} label="Configurações" open={open} />
            
            <div className="py-2">
              <div className="h-[1px] bg-sidebar-border/50 w-full"></div>
            </div>
            
            <NavItem to="/socket-test" icon={Radio} label="Teste Socket" open={open} />
          </nav>
        </TooltipProvider>
      </aside>
    </>
  );
}
