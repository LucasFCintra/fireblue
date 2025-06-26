import { useState } from "react";
import { Layers, Settings as SettingsIcon, Save, Database, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ActionButton } from "@/components/ActionButton";
import { EstoqueMinimoConfig } from "@/components/configuracoes/EstoqueMinimoConfig";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState("estoque");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveConfig = () => {
    setIsLoading(true);
    
    // Simulação de salvamento
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-lg">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Configurações</h1>
              <p className="text-blue-100 mt-2 text-lg">
                Personalize o comportamento do sistema conforme suas necessidades
              </p>
            </div>
            <ActionButton 
              startIcon={<Save className="w-5 h-5" />} 
              isLoading={isLoading}
              onClick={handleSaveConfig}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              Salvar Configurações
            </ActionButton>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Tabs com design melhorado */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full h-16 bg-muted/50 backdrop-blur-sm border border-border/50">
          <TabsTrigger 
            value="estoque" 
            className="data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-foreground transition-all duration-200"
          >
            <Layers className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Regras de Estoque</div>
              <div className="text-xs text-muted-foreground">Alertas e controles</div>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="sistema" 
            className="data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-foreground transition-all duration-200"
          >
            <SettingsIcon className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Sistema</div>
              <div className="text-xs text-muted-foreground">Configurações gerais</div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="pt-4">
          <EstoqueMinimoConfig />
        </TabsContent>

        <TabsContent value="sistema" className="pt-4">
          <div className="space-y-6">
            {/* Alerta de Desenvolvimento */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950/30 dark:border-yellow-800/50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <SettingsIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Funcionalidade em Desenvolvimento
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Esta seção está sendo desenvolvida. As funcionalidades de backup, restauração e configurações avançadas do sistema estarão disponíveis em breve.
                  </p>
                </div>
              </div>
            </div>

            {/* Backup e Restauração */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Backup e Restauração
                </CardTitle>
                <CardDescription>
                  Gerencie backups dos dados do sistema e restaure quando necessário.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                      <HardDrive className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Fazer Backup</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Crie um backup completo dos dados do sistema
                    </p>
                    <ActionButton 
                      onClick={() => toast({
                        title: "Funcionalidade em desenvolvimento", 
                        description: "Esta funcionalidade estará disponível em breve.",
                        variant: "destructive"
                      })}
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Em Desenvolvimento
                    </ActionButton>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Database className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Restaurar Dados</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Restaure dados de um backup anterior
                    </p>
                    <ActionButton 
                      variant="outline" 
                      onClick={() => toast({
                        title: "Funcionalidade em desenvolvimento", 
                        description: "Esta funcionalidade estará disponível em breve.",
                        variant: "destructive"
                      })}
                      className="w-full"
                      disabled
                    >
                      Em Desenvolvimento
                    </ActionButton>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Informações do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Informações do Sistema
                </CardTitle>
                <CardDescription>
                  Detalhes sobre a versão e status do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Versão do Sistema:</span>
                      <Badge variant="secondary">1.0.0</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Última Atualização:</span>
                      <span className="font-medium">13/05/2025</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Status do Banco:</span>
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Atualizado
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Status do Sistema:</span>
                      <Badge variant="secondary">
                        Online
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
