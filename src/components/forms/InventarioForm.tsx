import { useState, useEffect } from "react";
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
import { Loader2, Upload, X, Image } from "lucide-react";
import { ItemEstoque } from "@/services/inventarioService";

// Schema de validação para o formulário
const formSchema = z.object({
  nome_produto: z.string().min(3, "O nome do produto deve ter pelo menos 3 caracteres"),
  sku: z.string().min(2, "O SKU deve ter pelo menos 2 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  quantidade: z.coerce.number().min(0, "A quantidade não pode ser negativa"),
  preco_unitario: z.coerce.number().min(0, "O valor unitário não pode ser negativo"),
  localizacao: z.string().min(1, "Informe a localização do produto"),
  observacoes: z.string().optional(),
  fornecedor: z.string().optional(),
  codigo_barras: z.string().optional(),
  unidade: z.string().optional(),
  estoque_minimo: z.coerce.number().min(0, "O estoque mínimo não pode ser negativo").optional(),
  status: z.enum(["ativo", "inativo", "baixo"]).default("ativo"),
  imagem_url: z.string().optional(),
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

// Unidades de medida
const unidadesMedida = [
  "Unidade",
  "Caixa",
  "Pacote",
  "Kg",
  "L",
  "m",
  "Peça",
  "Par",
  "Conjunto"
];

interface InventarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ItemEstoque>) => Promise<void>;
  itemData?: ItemEstoque;
  title?: string;
  mode?: "create" | "edit";
}

export function InventarioForm({
  isOpen,
  onClose,
  onSubmit,
  itemData,
  title = "Cadastrar Item",
  mode = "create",
}: InventarioFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_produto: itemData?.nome_produto || "",
      sku: itemData?.sku || "",
      quantidade: itemData?.quantidade || 0,
      unidade: itemData?.unidade || "Unidade",
      categoria: itemData?.categoria || "",
      localizacao: itemData?.localizacao || "",
      preco_unitario: itemData?.preco_unitario || 0,
      codigo_barras: itemData?.codigo_barras || "",
      fornecedor: itemData?.fornecedor || "",
      observacoes: itemData?.observacoes || "",
      status: itemData?.status || "ativo",
      estoque_minimo: itemData?.estoque_minimo || 0,
      imagem_url: itemData?.imagem_url || "",
    },
  });
  
  // Atualizar os valores do formulário quando os dados do item mudam
  useEffect(() => {
    if (itemData && mode === "edit") {
      form.reset({
        nome_produto: itemData.nome_produto || "",
        sku: itemData.sku || "",
        categoria: itemData.categoria || "",
        quantidade: itemData.quantidade || 0,
        preco_unitario: itemData.preco_unitario || 0,
        localizacao: itemData.localizacao || "",
        observacoes: itemData.observacoes || "",
        fornecedor: itemData.fornecedor || "",
        codigo_barras: itemData.codigo_barras || "",
        unidade: itemData.unidade || "Unidade",
        estoque_minimo: itemData.estoque_minimo || 0,
        status: itemData.status || "ativo",
      });
      
      // Atualizar a pré-visualização da imagem se existir uma URL
      if (itemData.imagem_url) {
        setImagePreview(itemData.imagem_url);
      }
    }
  }, [itemData, mode, form]);
  
  // Função para lidar com o upload de imagem
  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Simular upload para um servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
      const fakeServerUrl = URL.createObjectURL(file);
      
      // Atualizar o formulário com a URL da imagem
      form.reset({ ...form.getValues(), imagem_url: fakeServerUrl });
      
      setIsUploading(false);
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error("Erro ao fazer upload da imagem");
      setIsUploading(false);
    }
  };
  
  // Função para remover a imagem
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    form.reset({ ...form.getValues(), imagem_url: "" });
    
    // Se houver um input de arquivo, limpar seu valor
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };
  
  // Função para lidar com o envio do formulário
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      toast.error("Erro ao salvar item");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title || (mode === "create" ? "Novo Item" : "Editar Item")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Imagem do Produto</FormLabel>
                <div className="mt-2 flex flex-col items-center">
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img 
                        src={imagePreview} 
                        alt="Prévia da imagem" 
                        className="w-full h-auto object-contain rounded-md border border-input aspect-square" 
                      />
                      <button 
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        aria-label="Remover imagem"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-4 hover:bg-gray-50 cursor-pointer" onClick={() => document.getElementById('product-image')?.click()}>
                      <Image className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center">Clique para adicionar uma imagem</p>
                      <p className="text-xs text-gray-400 mt-1 text-center">PNG, JPG ou JPEG (máx. 5MB)</p>
                    </div>
                  )}
                  
                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    className="hidden"
                    disabled={isUploading}
                  />
                  
                  {!imagePreview && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-4" 
                      onClick={() => document.getElementById('product-image')?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Selecionar Imagem
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="nome_produto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preco_unitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Unitário</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="localizacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Medida</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unidadesMedida.map((unidade) => (
                          <SelectItem key={unidade} value={unidade}>
                            {unidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estoque_minimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativo">Em Estoque</SelectItem>
                        <SelectItem value="baixo">Baixo Estoque</SelectItem>
                        <SelectItem value="inativo">Sem Estoque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Observações</FormLabel>
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Fornecedor</FormLabel>
              <FormField
                control={form.control}
                name="fornecedor"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Código de Barras</FormLabel>
              <FormField
                control={form.control}
                name="codigo_barras"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 