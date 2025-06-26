import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ActionButton } from "@/components/ActionButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";

export function EstoqueMinimoConfig() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [configEstoque, setConfigEstoque] = useState({
    estoqueMinimoPadrao: 10,
    alertaEstoqueBaixo: true,
    alertaEstoqueCritico: true,
    percentualCritico: 5,
    diasAntecedenciaAlerta: 7
  });
  
  const handleChange = (field: string, value: string | number | boolean) => {
    setConfigEstoque(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveConfig = () => {
    setIsLoading(true);
    
    // Validações
    if (configEstoque.estoqueMinimoPadrao < 0) {
      toast({
        title: "Erro na configuração",
        description: "O estoque mínimo não pode ser negativo.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    if (configEstoque.percentualCritico < 1 || configEstoque.percentualCritico > 100) {
      toast({
        title: "Erro na configuração",
        description: "O percentual crítico deve estar entre 1% e 100%.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    if (configEstoque.diasAntecedenciaAlerta < 1) {
      toast({
        title: "Erro na configuração",
        description: "Os dias de antecedência devem ser pelo menos 1.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Simulação de salvamento
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "As configurações de estoque foram atualizadas com sucesso."
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Estoque Mínimo Padrão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Estoque Mínimo Padrão
          </CardTitle>
          <CardDescription>
            Quantidade mínima padrão para novos produtos no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="estoque-minimo">Quantidade Mínima</Label>
              <p className="text-sm text-muted-foreground">
                Quando o estoque atingir este valor, será considerado baixo
              </p>
            </div>
            <Input
              id="estoque-minimo"
              type="number"
              value={configEstoque.estoqueMinimoPadrao}
              onChange={(e) => handleChange("estoqueMinimoPadrao", parseInt(e.target.value) || 0)}
              className="w-24 text-right"
              min="0"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Alertas de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas de Estoque
          </CardTitle>
          <CardDescription>
            Configure quando e como receber alertas sobre o estoque
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Alerta de Estoque Baixo */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alerta-estoque-baixo">Alerta de Estoque Baixo</Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando o estoque estiver abaixo do mínimo configurado
              </p>
            </div>
            <Switch
              id="alerta-estoque-baixo"
              checked={configEstoque.alertaEstoqueBaixo}
              onCheckedChange={(checked) => handleChange("alertaEstoqueBaixo", checked)}
            />
          </div>
          
          {/* Alerta de Estoque Crítico */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alerta-estoque-critico">Alerta de Estoque Crítico</Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando o estoque estiver em nível crítico (percentual do mínimo)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="percentual-critico"
                type="number"
                value={configEstoque.percentualCritico}
                onChange={(e) => handleChange("percentualCritico", parseInt(e.target.value) || 1)}
                className="w-16 text-right"
                min="1"
                max="100"
                disabled={!configEstoque.alertaEstoqueCritico}
              />
              <span className="text-sm">%</span>
              <Switch
                id="alerta-estoque-critico"
                checked={configEstoque.alertaEstoqueCritico}
                onCheckedChange={(checked) => handleChange("alertaEstoqueCritico", checked)}
              />
            </div>
          </div>
          
          {/* Dias de Antecedência */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dias-antecedencia">Dias de Antecedência</Label>
              <p className="text-sm text-muted-foreground">
                Quantos dias antes de atingir o mínimo para começar a alertar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="dias-antecedencia"
                type="number"
                value={configEstoque.diasAntecedenciaAlerta}
                onChange={(e) => handleChange("diasAntecedenciaAlerta", parseInt(e.target.value) || 1)}
                className="w-16 text-right"
                min="1"
              />
              <span className="text-sm">dias</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resumo das Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Resumo das Configurações
          </CardTitle>
          <CardDescription>
            Como os alertas funcionarão com base nas suas configurações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>Estoque Mínimo:</span>
              <span className="font-medium">{configEstoque.estoqueMinimoPadrao} unidades</span>
            </div>
            
            {configEstoque.alertaEstoqueBaixo && (
              <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <span>Alerta de Estoque Baixo:</span>
                <span className="font-medium text-yellow-700 dark:text-yellow-300">
                  Quando estoque ≤ {configEstoque.estoqueMinimoPadrao} unidades
                </span>
              </div>
            )}
            
            {configEstoque.alertaEstoqueCritico && (
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <span>Alerta de Estoque Crítico:</span>
                <span className="font-medium text-red-700 dark:text-red-300">
                  Quando estoque ≤ {Math.round(configEstoque.estoqueMinimoPadrao * configEstoque.percentualCritico / 100)} unidades ({configEstoque.percentualCritico}% do mínimo)
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span>Antecedência:</span>
              <span className="font-medium text-blue-700 dark:text-blue-300">
                {configEstoque.diasAntecedenciaAlerta} dias antes de atingir o mínimo
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Botão Salvar */}
      <div className="pt-4 flex justify-end">
        <ActionButton 
          onClick={handleSaveConfig} 
          isLoading={isLoading}
        >
          Salvar Configurações
        </ActionButton>
      </div>
    </div>
  );
}
