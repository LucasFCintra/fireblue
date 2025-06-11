import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Schema de validação para os filtros
const filterSchema = z.object({
  categorias: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  valorMinimo: z.coerce.number().min(0).optional(),
  valorMaximo: z.coerce.number().min(0).optional(),
  estoqueMinimo: z.coerce.number().min(0).optional(),
  estoqueMaximo: z.coerce.number().min(0).optional(),
  localizacoes: z.array(z.string()).optional(),
  fornecedores: z.array(z.string()).optional(),
  ordenacao: z.string().optional(),
  agrupar: z.boolean().optional(),
  exibirSemEstoque: z.boolean().optional(),
});

// Categorias de produtos (pode ser expandido ou carregado de uma API)
const categorias = [
  "Eletrônicos",
  "Periféricos",
  "Áudio",
  "Acessórios",
  "Fotografia",
  "Informática",
  "Componentes",
  "Outros"
];

// Status possíveis
const statusOptions = [
  "Em Estoque",
  "Baixo Estoque",
  "Sem Estoque"
];

// Localizações (estas podem vir de uma API ou banco de dados)
const localizacoes = [
  "Prateleira A1",
  "Prateleira B3",
  "Prateleira C2",
  "Prateleira C4",
  "Prateleira D1",
  "Prateleira E2",
  "Prateleira F1"
];

// Fornecedores (estes podem vir de uma API)
const fornecedores = [
  "Dell",
  "Samsung",
  "Logitech",
  "Microsoft",
  "Sony",
  "Canon",
  "Outros"
];

// Opções de ordenação
const opcoesOrdenacao = [
  { value: "produto_asc", label: "Nome (A-Z)" },
  { value: "produto_desc", label: "Nome (Z-A)" },
  { value: "valor_asc", label: "Valor (menor-maior)" },
  { value: "valor_desc", label: "Valor (maior-menor)" },
  { value: "estoque_asc", label: "Estoque (menor-maior)" },
  { value: "estoque_desc", label: "Estoque (maior-menor)" },
  { value: "categoria", label: "Categoria" },
  { value: "status", label: "Status" }
];

interface InventarioFiltrosProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  initialFilters?: any;
  itemsCount?: number;
}

export function InventarioFiltros({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters,
  itemsCount = 0
}: InventarioFiltrosProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Valores máximos para os sliders (podem ser obtidos dos dados reais)
  const [maxValorProduto, setMaxValorProduto] = useState(10000);
  const [maxQuantidadeProduto, setMaxQuantidadeProduto] = useState(100);
  
  // Inicializar o formulário com os filtros iniciais ou valores padrão
  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      categorias: initialFilters?.categorias || [],
      status: initialFilters?.status || [],
      valorMinimo: initialFilters?.valorMinimo || 0,
      valorMaximo: initialFilters?.valorMaximo || maxValorProduto,
      estoqueMinimo: initialFilters?.estoqueMinimo || 0,
      estoqueMaximo: initialFilters?.estoqueMaximo || maxQuantidadeProduto,
      localizacoes: initialFilters?.localizacoes || [],
      fornecedores: initialFilters?.fornecedores || [],
      ordenacao: initialFilters?.ordenacao || "produto_asc",
      agrupar: initialFilters?.agrupar || false,
      exibirSemEstoque: initialFilters?.exibirSemEstoque || true,
    },
  });
  
  // Valores para os sliders
  const valorMinimo = form.watch("valorMinimo") || 0;
  const valorMaximo = form.watch("valorMaximo") || maxValorProduto;
  const estoqueMinimo = form.watch("estoqueMinimo") || 0;
  const estoqueMaximo = form.watch("estoqueMaximo") || maxQuantidadeProduto;

  // Atualizar valores do formulário quando os filtros iniciais mudam
  useEffect(() => {
    if (initialFilters) {
      form.reset({
        categorias: initialFilters.categorias || [],
        status: initialFilters.status || [],
        valorMinimo: initialFilters.valorMinimo || 0,
        valorMaximo: initialFilters.valorMaximo || maxValorProduto,
        estoqueMinimo: initialFilters.estoqueMinimo || 0,
        estoqueMaximo: initialFilters.estoqueMaximo || maxQuantidadeProduto,
        localizacoes: initialFilters.localizacoes || [],
        fornecedores: initialFilters.fornecedores || [],
        ordenacao: initialFilters.ordenacao || "produto_asc",
        agrupar: initialFilters.agrupar || false,
        exibirSemEstoque: initialFilters.exibirSemEstoque || true,
      });
    }
  }, [initialFilters, form, maxValorProduto, maxQuantidadeProduto]);
  
  // Função para limpar todos os filtros
  const handleClearFilters = () => {
    form.reset({
      categorias: [],
      status: [],
      valorMinimo: 0,
      valorMaximo: maxValorProduto,
      estoqueMinimo: 0,
      estoqueMaximo: maxQuantidadeProduto,
      localizacoes: [],
      fornecedores: [],
      ordenacao: "produto_asc",
      agrupar: false,
      exibirSemEstoque: true,
    });
  };
  
  // Função para aplicar os filtros
  const handleSubmit = async (values: z.infer<typeof filterSchema>) => {
    try {
      setIsLoading(true);
      
      // Aqui você pode fazer validações adicionais, se necessário
      
      // Chamar a função para aplicar os filtros
      onApplyFilters(values);
      
      // Fechar o painel de filtros
      onClose();
    } catch (error) {
      console.error("Erro ao aplicar filtros:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função auxiliar para alternar a seleção em arrays de valores
  const toggleArrayValue = (array: string[] = [], value: string) => {
    return array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros do Inventário</SheetTitle>
          <SheetDescription>
            Aplique filtros para refinar os resultados.
            {itemsCount > 0 && (
              <span className="font-medium block mt-1">
                {itemsCount} produtos encontrados
              </span>
            )}
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            {/* Seção de Ordenação */}
            <FormField
              control={form.control}
              name="ordenacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordenar por</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma ordenação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {opcoesOrdenacao.map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Acordeão de filtros */}
            <Accordion type="multiple" className="w-full">
              {/* Categorias */}
              <AccordionItem value="categorias">
                <AccordionTrigger>Categorias</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {categorias.map((categoria) => (
                      <div key={categoria} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`categoria-${categoria}`}
                          checked={(form.watch("categorias") || []).includes(categoria)}
                          onCheckedChange={() => {
                            const current = form.watch("categorias") || [];
                            form.setValue("categorias", toggleArrayValue(current, categoria));
                          }}
                        />
                        <label
                          htmlFor={`categoria-${categoria}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {categoria}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Status */}
              <AccordionItem value="status">
                <AccordionTrigger>Status</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {statusOptions.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`status-${status}`}
                          checked={(form.watch("status") || []).includes(status)}
                          onCheckedChange={() => {
                            const current = form.watch("status") || [];
                            form.setValue("status", toggleArrayValue(current, status));
                          }}
                        />
                        <label
                          htmlFor={`status-${status}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Faixa de Valor */}
              <AccordionItem value="valor">
                <AccordionTrigger>Faixa de Valor (R$)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>R$ {valorMinimo.toFixed(2)}</span>
                      <span>R$ {valorMaximo.toFixed(2)}</span>
                    </div>
                    <FormField
                      control={form.control}
                      name="valorMinimo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Mínimo</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max={maxValorProduto} 
                              step="1" 
                              {...field} 
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value <= valorMaximo) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="valorMaximo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Máximo</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={valorMinimo} 
                              max={maxValorProduto} 
                              step="1" 
                              {...field} 
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= valorMinimo) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Faixa de Estoque */}
              <AccordionItem value="estoque">
                <AccordionTrigger>Quantidade em Estoque</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>{estoqueMinimo}</span>
                      <span>{estoqueMaximo}</span>
                    </div>
                    <FormField
                      control={form.control}
                      name="estoqueMinimo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque Mínimo</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max={maxQuantidadeProduto} 
                              step="1" 
                              {...field} 
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value <= estoqueMaximo) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estoqueMaximo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque Máximo</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={estoqueMinimo} 
                              max={maxQuantidadeProduto} 
                              step="1" 
                              {...field} 
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= estoqueMinimo) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Localizações */}
              <AccordionItem value="localizacoes">
                <AccordionTrigger>Localização</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {localizacoes.map((localizacao) => (
                      <div key={localizacao} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`localizacao-${localizacao}`}
                          checked={(form.watch("localizacoes") || []).includes(localizacao)}
                          onCheckedChange={() => {
                            const current = form.watch("localizacoes") || [];
                            form.setValue("localizacoes", toggleArrayValue(current, localizacao));
                          }}
                        />
                        <label
                          htmlFor={`localizacao-${localizacao}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {localizacao}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Fornecedores */}
              <AccordionItem value="fornecedores">
                <AccordionTrigger>Fornecedor</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {fornecedores.map((fornecedor) => (
                      <div key={fornecedor} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`fornecedor-${fornecedor}`}
                          checked={(form.watch("fornecedores") || []).includes(fornecedor)}
                          onCheckedChange={() => {
                            const current = form.watch("fornecedores") || [];
                            form.setValue("fornecedores", toggleArrayValue(current, fornecedor));
                          }}
                        />
                        <label
                          htmlFor={`fornecedor-${fornecedor}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {fornecedor}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Opções adicionais */}
              <AccordionItem value="opcoes">
                <AccordionTrigger>Opções Adicionais</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="exibirSemEstoque"
                        checked={form.watch("exibirSemEstoque")}
                        onCheckedChange={(checked) => {
                          form.setValue("exibirSemEstoque", checked === true);
                        }}
                      />
                      <label
                        htmlFor="exibirSemEstoque"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Exibir produtos sem estoque
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="agrupar"
                        checked={form.watch("agrupar")}
                        onCheckedChange={(checked) => {
                          form.setValue("agrupar", checked === true);
                        }}
                      />
                      <label
                        htmlFor="agrupar"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Agrupar por categoria
                      </label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <SheetFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClearFilters}
                className="w-full sm:w-auto"
              >
                Limpar Filtros
              </Button>
              <ActionButton
                type="submit"
                isLoading={isLoading}
                loadingText="Aplicando..."
                className="w-full sm:w-auto"
              >
                Aplicar Filtros
              </ActionButton>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
} 