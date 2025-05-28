
import { useState } from "react";
import { Palette, Layers, Users, Settings as SettingsIcon, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ActionButton } from "@/components/ActionButton";
import { ColorPicker } from "@/components/configuracoes/ColorPicker";
import { PermissoesUsuario } from "@/components/configuracoes/PermissoesUsuario";
import { EstoqueMinimoConfig } from "@/components/configuracoes/EstoqueMinimoConfig";

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState("visual");
  const [isLoading, setIsLoading] = useState(false);
  const [corPrimaria, setCorPrimaria] = useState("#0f172a");
  const [corSecundaria, setCorSecundaria] = useState("#64748b");
  const [corDestaque, setCorDestaque] = useState("#3b82f6");
  const [modoOffline, setModoOffline] = useState(false);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <ActionButton 
          startIcon={<Save />} 
          isLoading={isLoading}
          onClick={handleSaveConfig}
        >
          Salvar Configurações
        </ActionButton>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="visual">
            <Palette className="w-4 h-4 mr-2" />
            Identidade Visual
          </TabsTrigger>
          <TabsTrigger value="estoque">
            <Layers className="w-4 h-4 mr-2" />
            Regras de Estoque
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            <Users className="w-4 h-4 mr-2" />
            Usuários e Permissões
          </TabsTrigger>
          <TabsTrigger value="sistema">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
              <CardDescription>
                Personalize as cores e aparência do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ColorPicker 
                  label="Cor Primária"
                  value={corPrimaria}
                  onChange={setCorPrimaria}
                />
                
                <ColorPicker 
                  label="Cor Secundária"
                  value={corSecundaria}
                  onChange={setCorSecundaria}
                />

                <ColorPicker 
                  label="Cor de Destaque"
                  value={corDestaque}
                  onChange={setCorDestaque}
                />
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-4">Pré-visualização</h3>
                <div className="flex flex-wrap gap-4">
                  <div 
                    className="p-4 rounded-md text-white flex items-center justify-center" 
                    style={{ backgroundColor: corPrimaria }}
                  >
                    Cor Primária
                  </div>
                  <div 
                    className="p-4 rounded-md text-white flex items-center justify-center" 
                    style={{ backgroundColor: corSecundaria }}
                  >
                    Cor Secundária
                  </div>
                  <div 
                    className="p-4 rounded-md text-white flex items-center justify-center" 
                    style={{ backgroundColor: corDestaque }}
                  >
                    Cor de Destaque
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Estoque</CardTitle>
              <CardDescription>
                Configure as regras de estoque mínimo e alertas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EstoqueMinimoConfig />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários e Permissões</CardTitle>
              <CardDescription>
                Gerencie usuários e suas permissões de acesso no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissoesUsuario />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Ajuste as configurações gerais do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="offline-mode">Modo Offline</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que o sistema funcione sem conexão com a internet.
                  </p>
                </div>
                <Switch 
                  id="offline-mode" 
                  checked={modoOffline} 
                  onCheckedChange={setModoOffline} 
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Backup e Restauração</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ActionButton onClick={() => toast({
                    title: "Backup iniciado", 
                    description: "O backup de dados foi iniciado e será concluído em breve."
                  })}>
                    Fazer Backup Agora
                  </ActionButton>
                  <ActionButton variant="outline" onClick={() => toast({
                    title: "Escolha um arquivo", 
                    description: "Selecione um arquivo de backup para restaurar os dados."
                  })}>
                    Restaurar Dados
                  </ActionButton>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Informações do Sistema</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Versão:</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Última atualização:</span>
                    <span>13/05/2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Banco de dados:</span>
                    <span>Atualizado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
