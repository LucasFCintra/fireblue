
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ActionButton } from "@/components/ActionButton";

export function EstoqueMinimoConfig() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [configEstoque, setConfigEstoque] = useState({
    estoqueMinimoPadrao: 10,
    alertaEstoqueBaixo: true,
    alertaEstoqueCritico: true,
    percentualCritico: 5,
    alertaValidade: true,
    diasAlertaValidade: 30,
    compraAutomatica: false
  });
  
  const handleChange = (field: string, value: string | number | boolean) => {
    setConfigEstoque(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveConfig = () => {
    setIsLoading(true);
    
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
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="estoque-minimo">Estoque Mínimo Padrão</Label>
          <p className="text-sm text-muted-foreground">
            Quantidade mínima padrão para novos produtos
          </p>
        </div>
        <Input
          id="estoque-minimo"
          type="number"
          value={configEstoque.estoqueMinimoPadrao}
          onChange={(e) => handleChange("estoqueMinimoPadrao", parseInt(e.target.value))}
          className="w-24 text-right"
          min="0"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="alerta-estoque-baixo">Alerta de Estoque Baixo</Label>
          <p className="text-sm text-muted-foreground">
            Notificar quando o estoque estiver abaixo do mínimo
          </p>
        </div>
        <Switch
          id="alerta-estoque-baixo"
          checked={configEstoque.alertaEstoqueBaixo}
          onCheckedChange={(checked) => handleChange("alertaEstoqueBaixo", checked)}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="alerta-estoque-critico">Alerta de Estoque Crítico</Label>
          <p className="text-sm text-muted-foreground">
            Notificar quando o estoque estiver em nível crítico
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="percentual-critico"
            type="number"
            value={configEstoque.percentualCritico}
            onChange={(e) => handleChange("percentualCritico", parseInt(e.target.value))}
            className="w-16 text-right"
            min="1"
            max="100"
          />
          <span className="text-sm">%</span>
          <Switch
            id="alerta-estoque-critico"
            checked={configEstoque.alertaEstoqueCritico}
            onCheckedChange={(checked) => handleChange("alertaEstoqueCritico", checked)}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="alerta-validade">Alerta de Validade</Label>
          <p className="text-sm text-muted-foreground">
            Notificar quando produtos estiverem próximos do vencimento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="dias-alerta-validade"
            type="number"
            value={configEstoque.diasAlertaValidade}
            onChange={(e) => handleChange("diasAlertaValidade", parseInt(e.target.value))}
            className="w-16 text-right"
            min="1"
          />
          <span className="text-sm">dias</span>
          <Switch
            id="alerta-validade"
            checked={configEstoque.alertaValidade}
            onCheckedChange={(checked) => handleChange("alertaValidade", checked)}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="compra-automatica">Compra Automática</Label>
          <p className="text-sm text-muted-foreground">
            Gerar ordem de compra quando o estoque estiver baixo
          </p>
        </div>
        <Switch
          id="compra-automatica"
          checked={configEstoque.compraAutomatica}
          onCheckedChange={(checked) => handleChange("compraAutomatica", checked)}
        />
      </div>
      
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
