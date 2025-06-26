import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { PlusCircle, MinusCircle, Package, AlertTriangle } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";

const formSchema = z.object({
  tipoAjuste: z.enum(["entrada", "saida"]),
  quantidade: z.coerce.number().positive("A quantidade deve ser maior que zero"),
  motivo: z.string().optional(),
  documento: z.string().optional(),
});

interface AjusteEstoqueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  item: any;
}

export function AjusteEstoqueForm({
  isOpen,
  onClose,
  onSubmit,
  item,
}: AjusteEstoqueFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Inicializar o formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoAjuste: "entrada",
      quantidade: 1,
      motivo: "",
      documento: "",
    },
  });
  
  // Monitorar o tipo de ajuste selecionado
  const tipoAjuste = form.watch("tipoAjuste");
  
  // Função para lidar com o envio do formulário
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Iniciando ajuste de estoque...", values);
      setIsLoading(true);
      
      // Calcular nova quantidade com base no tipo de ajuste
      const estoqueAtual = Number(item.quantidade) || 0;
      const quantidadeAjuste = Number(values.quantidade) || 0;
      let novaQuantidade = estoqueAtual;
      
      switch (values.tipoAjuste) {
        case "entrada":
          novaQuantidade = estoqueAtual + quantidadeAjuste;
          break;
        case "saida":
          novaQuantidade = Math.max(0, estoqueAtual - quantidadeAjuste);
          break;
      }
      
      console.log("Nova quantidade calculada:", novaQuantidade);
      
      // Calcular o status com base na nova quantidade e estoque mínimo
      let novoStatus = "Em Estoque";
      if (novaQuantidade === 0) {
        novoStatus = "Sem Estoque";
      } else if (item.estoque_minimo && novaQuantidade <= item.estoque_minimo) {
        novoStatus = "Baixo Estoque";
      }
      
      // Preparar dados para o envio
      const dadosAjuste = {
        ...values,
        id: item.id,
        quantidadeAnterior: estoqueAtual,
        novaQuantidade,
        novoStatus,
        dataAjuste: new Date().toISOString(),
        usuario: "Usuário Atual", // Idealmente virá do contexto de autenticação
      };
      
      console.log("Dados do ajuste:", dadosAjuste);
      
      // Chamar a função onSubmit passada como prop
      await onSubmit(dadosAjuste);
      
      console.log("Ajuste realizado com sucesso!");
      
      // Resetar o formulário e fechar o diálogo
      form.reset();
      onClose();
    } catch (error) {
      console.error("Erro detalhado:", error);
      toast.error("Erro ao ajustar o estoque. Tente novamente.");
      console.error("Erro ao ajustar estoque:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Ajuste de Estoque
          </DialogTitle>
          <DialogDescription>
            Realize ajustes no estoque do produto: <strong>{item?.nome_produto}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do Produto */}
          <div className="bg-muted/30 p-4 rounded-lg border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-muted-foreground">Produto</h4>
                <p className="font-semibold text-lg">{item?.nome_produto}</p>
                <p className="text-sm text-muted-foreground">SKU: {item?.sku}</p>
              </div>
              <div className="text-center">
                <h4 className="font-medium text-sm text-muted-foreground">Estoque Atual</h4>
                <p className="text-2xl font-bold">{item?.quantidade}</p>
                <p className="text-xs text-muted-foreground">{item?.unidade || "un"}</p>
              </div>
            </div>
            
            {/* Alerta de estoque baixo */}
            {item?.estoque_minimo && item?.quantidade <= item?.estoque_minimo && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Estoque Baixo</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Estoque atual ({item.quantidade}) está abaixo do mínimo ({item.estoque_minimo})
                </p>
              </div>
            )}
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Tipo de Ajuste */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="tipoAjuste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium mb-1">Tipo de Ajuste *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de ajuste" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entrada">
                            <div className="flex items-center">
                              <PlusCircle className="mr-2 h-4 w-4 text-green-600" />
                              <span>Entrada de Estoque</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="saida">
                            <div className="flex items-center">
                              <MinusCircle className="mr-2 h-4 w-4 text-red-600" />
                              <span>Saída de Estoque</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {tipoAjuste === "entrada" && "Adiciona quantidade ao estoque atual"}
                        {tipoAjuste === "saida" && "Remove quantidade do estoque atual"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Quantidade e Motivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium mb-1">Quantidade *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          min="1"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Quantidade para {tipoAjuste === "entrada" ? "adicionar" : "remover"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="motivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium mb-1">Motivo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Motivo do ajuste" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium mb-1">Número do Documento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Número da nota fiscal, ordem, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Número do documento que justifica o ajuste
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Resumo do Ajuste */}
              <div className="bg-muted/30 p-4 rounded-lg border">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">Resumo do Ajuste</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Estoque Atual:</span>
                    <span className="font-medium ml-2">{Number(item?.quantidade) || 0} {item?.unidade || "un"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantidade do Ajuste:</span>
                    <span className={`font-medium ml-2 ${tipoAjuste === "entrada" ? "text-green-600" : "text-red-600"}`}>
                      {tipoAjuste === "entrada" ? "+" : "-"}{Number(form.watch("quantidade")) || 0} {item?.unidade || "un"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Estoque Final:</span>
                    <span className="font-medium ml-2">
                      {(() => {
                        const estoqueAtual = Number(item?.quantidade) || 0;
                        const quantidadeAjuste = Number(form.watch("quantidade")) || 0;
                        
                        if (tipoAjuste === "entrada") {
                          return estoqueAtual + quantidadeAjuste;
                        } else {
                          return Math.max(0, estoqueAtual - quantidadeAjuste);
                        }
                      })()} {item?.unidade || "un"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Botões de ação */}
              <DialogFooter className="pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <ActionButton
                  type="submit"
                  isLoading={isLoading}
                >
                  Confirmar Ajuste
                </ActionButton>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 