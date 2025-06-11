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

// Schema de validação para o formulário
const formSchema = z.object({
  produto: z.string().min(3, "O nome do produto deve ter pelo menos 3 caracteres"),
  sku: z.string().min(2, "O SKU deve ter pelo menos 2 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  quantidade: z.coerce.number().min(0, "A quantidade não pode ser negativa"),
  valorUnitario: z.coerce.number().min(0, "O valor unitário não pode ser negativo"),
  localizacao: z.string().min(1, "Informe a localização do produto"),
  descricao: z.string().optional(),
  fornecedor: z.string().optional(),
  codigoBarras: z.string().optional(),
  unidadeMedida: z.string().optional(),
  estoqueMinimo: z.coerce.number().min(0, "O estoque mínimo não pode ser negativo").optional(),
  dataCadastro: z.string().optional(),
  dataUltimaAtualizacao: z.string().optional(),
  imagemUrl: z.string().optional(),
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
  onSubmit: (data: any) => Promise<void>;
  itemData?: any;
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
  
  // Inicializar o formulário com os dados do item (se estiver no modo de edição)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      produto: itemData?.produto || "",
      sku: itemData?.sku || "",
      categoria: itemData?.categoria || "",
      quantidade: itemData?.quantidade || 0,
      valorUnitario: itemData?.valorUnitario || 0,
      localizacao: itemData?.localizacao || "",
      descricao: itemData?.descricao || "",
      fornecedor: itemData?.fornecedor || "",
      codigoBarras: itemData?.codigoBarras || "",
      unidadeMedida: itemData?.unidadeMedida || "Unidade",
      estoqueMinimo: itemData?.estoqueMinimo || 0,
      dataCadastro: itemData?.dataCadastro || new Date().toISOString().split('T')[0],
      dataUltimaAtualizacao: new Date().toISOString().split('T')[0],
      imagemUrl: itemData?.imagemUrl || "",
    },
  });
  
  // Atualizar os valores do formulário quando os dados do item mudam
  useEffect(() => {
    if (itemData && mode === "edit") {
      form.reset({
        produto: itemData.produto || "",
        sku: itemData.sku || "",
        categoria: itemData.categoria || "",
        quantidade: itemData.quantidade || 0,
        valorUnitario: itemData.valorUnitario || 0,
        localizacao: itemData.localizacao || "",
        descricao: itemData.descricao || "",
        fornecedor: itemData.fornecedor || "",
        codigoBarras: itemData.codigoBarras || "",
        unidadeMedida: itemData.unidadeMedida || "Unidade",
        estoqueMinimo: itemData.estoqueMinimo || 0,
        dataCadastro: itemData.dataCadastro || new Date().toISOString().split('T')[0],
        dataUltimaAtualizacao: new Date().toISOString().split('T')[0],
        imagemUrl: itemData.imagemUrl || "",
      });
      
      // Atualizar a pré-visualização da imagem se existir uma URL
      if (itemData.imagemUrl) {
        setImagePreview(itemData.imagemUrl);
      }
    }
  }, [itemData, form, mode]);
  
  // Função para lidar com o upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Verificar o tipo de arquivo
    if (!file.type.includes('image/')) {
      toast.error("O arquivo selecionado não é uma imagem válida");
      return;
    }
    
    // Verificar o tamanho do arquivo (limite de 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem é muito grande. O tamanho máximo é 5MB");
      return;
    }
    
    setSelectedImage(file);
    
    // Criar URL para pré-visualização
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // Simular upload para uma API/servidor
    setIsUploading(true);
    
    // Em uma implementação real, aqui você faria o upload do arquivo para o servidor
    setTimeout(() => {
      // Supondo que o servidor retorna uma URL após o upload
      const fakeServerUrl = previewUrl;
      
      // Atualizar o formulário com a URL da imagem
      form.setValue("imagemUrl", fakeServerUrl);
      
      setIsUploading(false);
      toast.success("Imagem carregada com sucesso");
    }, 1500);
  };
  
  // Função para remover a imagem selecionada
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    form.setValue("imagemUrl", "");
    
    // Se houver um input de arquivo, limpar seu valor
    const fileInput = document.getElementById('product-image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  // Função para lidar com o envio do formulário
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Calcular o status com base na quantidade e estoque mínimo
      let status = "Em Estoque";
      if (values.quantidade === 0) {
        status = "Sem Estoque";
      } else if (values.estoqueMinimo && values.quantidade <= values.estoqueMinimo) {
        status = "Baixo Estoque";
      }
      
      // Adicionar o status e a imagem ao objeto de valores
      const itemWithStatus = { 
        ...values, 
        status, 
        id: itemData?.id || `INV${Math.floor(Math.random() * 1000)}`,
        imagemUrl: values.imagemUrl || "" 
      };
      
      // Chamar a função onSubmit passada como prop
      await onSubmit(itemWithStatus);
      
      // Resetar o formulário e fechar o diálogo
      if (mode === "create") {
        form.reset();
        setSelectedImage(null);
        setImagePreview(null);
      }
      
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar o item. Tente novamente.");
      console.error("Erro ao salvar item:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Preencha os campos abaixo para cadastrar um novo item no inventário." 
              : "Edite os dados do item selecionado."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Coluna da Imagem */}
              <div className="w-full md:w-1/3">
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
                    onChange={handleImageUpload}
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
              
              {/* Coluna dos campos do formulário */}
              <div className="w-full md:w-2/3 space-y-4">
                {/* Informações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Produto */}
                  <FormField
                    control={form.control}
                    name="produto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do produto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* SKU */}
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU*</FormLabel>
                        <FormControl>
                          <Input placeholder="Código SKU único" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Categoria */}
                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                  
                  {/* Valor Unitário */}
                  <FormField
                    control={form.control}
                    name="valorUnitario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Unitário (R$)*</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quantidade */}
                  <FormField
                    control={form.control}
                    name="quantidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade*</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Estoque Mínimo */}
                  <FormField
                    control={form.control}
                    name="estoqueMinimo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque Mínimo</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Localização */}
                  <FormField
                    control={form.control}
                    name="localizacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Prateleira A1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Unidade de Medida */}
                  <FormField
                    control={form.control}
                    name="unidadeMedida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade de Medida</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a unidade" />
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Código de Barras */}
                  <FormField
                    control={form.control}
                    name="codigoBarras"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Barras</FormLabel>
                        <FormControl>
                          <Input placeholder="Código de barras (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Fornecedor */}
                  <FormField
                    control={form.control}
                    name="fornecedor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fornecedor</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do fornecedor (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Descrição */}
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Descrição do produto (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <ActionButton 
                type="submit" 
                isLoading={isLoading}
                loadingText={mode === "create" ? "Cadastrando..." : "Salvando..."}
              >
                {mode === "create" ? "Cadastrar" : "Salvar"}
              </ActionButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 