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
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, MinusCircle, RotateCcw, Package } from "lucide-react";

const formSchema = z.object({
  tipoAjuste: z.enum(["entrada", "saida"]),
  quantidade: z.coerce.number().positive("A quantidade deve ser maior que zero"),
  motivo: z.string().optional(),
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
      console.log("Iniciando ajuste de estoque...", values);
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
        quantidadeAnterior: item.quantidade,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajuste de Estoque</DialogTitle>
          <DialogDescription>
            Realize ajustes no estoque do produto: <strong>{item?.nome_produto}</strong>
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
          <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
            console.log("Erros de validação:", errors);
          })} className="space-y-4">
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
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Processando..." : "Confirmar Ajuste"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 