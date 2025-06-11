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
import { ActionButton } from "@/components/ActionButton";
import { toast } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, MinusCircle, RotateCcw, Package } from "lucide-react";

const formSchema = z.object({
  tipoAjuste: z.enum(["entrada", "saida", "ajuste", "inventario"]),
  quantidade: z.coerce.number().positive("A quantidade deve ser maior que zero"),
  motivo: z.string().min(3, "O motivo deve ter pelo menos 3 caracteres"),
  observacao: z.string().optional(),
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
      observacao: "",
      documento: "",
    },
  });
  
  // Monitorar o tipo de ajuste selecionado
  const tipoAjuste = form.watch("tipoAjuste");
  
  // Função para lidar com o envio do formulário
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Calcular nova quantidade com base no tipo de ajuste
      let novaQuantidade = item.quantidade;
      
      switch (values.tipoAjuste) {
        case "entrada":
          novaQuantidade = item.quantidade + values.quantidade;
          break;
        case "saida":
          novaQuantidade = Math.max(0, item.quantidade - values.quantidade);
          break;
        case "ajuste":
        case "inventario":
          novaQuantidade = values.quantidade;
          break;
      }
      
      // Calcular o status com base na nova quantidade e estoque mínimo
      let novoStatus = "Em Estoque";
      if (novaQuantidade === 0) {
        novoStatus = "Sem Estoque";
      } else if (item.estoqueMinimo && novaQuantidade <= item.estoqueMinimo) {
        novoStatus = "Baixo Estoque";
      }
      
      // Preparar dados para o envio
      const dadosAjuste = {
        ...values,
        id: item.id,
        quantidadeAnterior: item.quantidade,
        novaQuantidade,
        novoStatus,
        dataAjuste: new Date().toISOString(),
        usuario: "Usuário Atual", // Idealmente virá do contexto de autenticação
      };
      
      // Chamar a função onSubmit passada como prop
      await onSubmit(dadosAjuste);
      
      // Resetar o formulário e fechar o diálogo
      form.reset();
      onClose();
    } catch (error) {
      toast.error("Erro ao ajustar o estoque. Tente novamente.");
      console.error("Erro ao ajustar estoque:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajuste de Estoque</DialogTitle>
          <DialogDescription>
            Realize ajustes no estoque do produto: <strong>{item?.produto}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <div className="flex items-center justify-between mb-4 bg-muted p-3 rounded-md">
            <div>
              <h4 className="font-medium">Estoque Atual</h4>
              <p className="text-2xl font-bold">{item?.quantidade}</p>
            </div>
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Tipo de Ajuste */}
            <FormField
              control={form.control}
              name="tipoAjuste"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Ajuste</FormLabel>
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
                      <SelectItem value="ajuste">
                        <div className="flex items-center">
                          <RotateCcw className="mr-2 h-4 w-4 text-amber-600" />
                          <span>Ajuste Manual</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inventario">
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4 text-blue-600" />
                          <span>Contagem de Inventário</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {tipoAjuste === "entrada" && "Adiciona quantidade ao estoque atual"}
                    {tipoAjuste === "saida" && "Remove quantidade do estoque atual"}
                    {tipoAjuste === "ajuste" && "Define um valor específico para o estoque"}
                    {tipoAjuste === "inventario" && "Define o estoque com base na contagem física"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Quantidade */}
            <FormField
              control={form.control}
              name="quantidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" step="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    {tipoAjuste === "entrada" && `Estoque após ajuste: ${item?.quantidade + Number(field.value)}`}
                    {tipoAjuste === "saida" && `Estoque após ajuste: ${Math.max(0, item?.quantidade - Number(field.value))}`}
                    {(tipoAjuste === "ajuste" || tipoAjuste === "inventario") && "Quantidade total após o ajuste"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Motivo */}
            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o motivo do ajuste" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tipoAjuste === "entrada" && (
                        <>
                          <SelectItem value="compra">Compra</SelectItem>
                          <SelectItem value="devolucao">Devolução</SelectItem>
                          <SelectItem value="transferencia">Transferência</SelectItem>
                          <SelectItem value="producao">Produção</SelectItem>
                          <SelectItem value="outro_entrada">Outro</SelectItem>
                        </>
                      )}
                      
                      {tipoAjuste === "saida" && (
                        <>
                          <SelectItem value="venda">Venda</SelectItem>
                          <SelectItem value="consumo">Consumo Interno</SelectItem>
                          <SelectItem value="perda">Perda/Avaria</SelectItem>
                          <SelectItem value="transferencia_saida">Transferência</SelectItem>
                          <SelectItem value="outro_saida">Outro</SelectItem>
                        </>
                      )}
                      
                      {(tipoAjuste === "ajuste" || tipoAjuste === "inventario") && (
                        <>
                          <SelectItem value="contagem">Contagem Física</SelectItem>
                          <SelectItem value="correcao">Correção</SelectItem>
                          <SelectItem value="ajuste_sistema">Ajuste de Sistema</SelectItem>
                          <SelectItem value="outro_ajuste">Outro</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Documento */}
            <FormField
              control={form.control}
              name="documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nota fiscal, ordem, etc." {...field} />
                  </FormControl>
                  <FormDescription>
                    Número do documento relacionado a este ajuste
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Observação */}
            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre o ajuste" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <ActionButton 
                type="submit" 
                isLoading={isLoading}
                loadingText="Processando..."
              >
                Confirmar Ajuste
              </ActionButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 