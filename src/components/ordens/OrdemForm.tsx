
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ActionButton } from "@/components/ActionButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash } from "lucide-react";

interface OrdemFormProps {
  ordem?: any;
  tipo: "vendas" | "compras";
  isOpen: boolean;
  onClose: () => void;
}

export function OrdemForm({ ordem, tipo, isOpen, onClose }: OrdemFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const statusOptions = tipo === "vendas" 
    ? ["Em aberto", "Pago", "Entregue", "Cancelado"] 
    : ["Em aberto", "Recebido", "Cancelado"];
  
  const [formData, setFormData] = useState({
    codigo: ordem?.codigo || "",
    data: ordem?.data || new Date().toISOString().split('T')[0],
    status: ordem?.status || statusOptions[0],
    valor: ordem?.valor || "",
    [tipo === "vendas" ? "cliente" : "fornecedor"]: ordem?.[tipo === "vendas" ? "cliente" : "fornecedor"] || "",
    items: ordem?.items || (tipo === "vendas" ? [] : []),
    previsaoEntrega: ordem?.previsaoEntrega || ""
  });
  
  const [produtos, setProdutos] = useState([
    { id: "1", nome: "Produto 1", preco: 120.50, quantidade: 2, subtotal: 241.00 },
    { id: "2", nome: "Produto 2", preco: 75.25, quantidade: 3, subtotal: 225.75 },
    { id: "3", nome: "Produto 3", preco: 199.90, quantidade: 1, subtotal: 199.90 }
  ]);
  
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    preco: "",
    quantidade: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação da API
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: ordem ? "Ordem atualizada" : "Ordem criada",
        description: `A ordem ${formData.codigo || "nova"} foi ${ordem ? "atualizada" : "criada"} com sucesso.`
      });
      onClose();
    }, 1000);
  };

  const handleDelete = () => {
    setIsLoading(true);
    
    // Simulação da API
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Ordem excluída",
        description: `A ordem ${ordem.codigo} foi excluída com sucesso.`,
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      onClose();
    }, 1000);
  };
  
  const handleAddProduto = () => {
    if (!novoProduto.nome || !novoProduto.preco) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e preço do produto são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const subtotal = parseFloat(novoProduto.preco) * novoProduto.quantidade;
    
    setProdutos([...produtos, {
      id: Date.now().toString(),
      nome: novoProduto.nome,
      preco: parseFloat(novoProduto.preco),
      quantidade: novoProduto.quantidade,
      subtotal: subtotal
    }]);
    
    setNovoProduto({
      nome: "",
      preco: "",
      quantidade: 1
    });
  };
  
  const handleRemoveProduto = (id: string) => {
    setProdutos(produtos.filter(p => p.id !== id));
  };
  
  const calcularTotal = () => {
    return produtos.reduce((total, produto) => total + produto.subtotal, 0);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full md:max-w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {ordem ? `Editar Ordem de ${tipo === "vendas" ? "Venda" : "Compra"}` : `Nova Ordem de ${tipo === "vendas" ? "Venda" : "Compra"}`}
            </SheetTitle>
            <SheetDescription>
              {ordem
                ? `Atualize os dados da ordem de ${tipo === "vendas" ? "venda" : "compra"}.`
                : `Preencha os dados da nova ordem de ${tipo === "vendas" ? "venda" : "compra"}.`}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  name="codigo"
                  placeholder="Código da ordem"
                  value={formData.codigo}
                  onChange={handleChange}
                  disabled={!!ordem}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  value={formData.data}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={tipo === "vendas" ? "cliente" : "fornecedor"}>
                  {tipo === "vendas" ? "Cliente" : "Fornecedor"}
                </Label>
                <Input
                  id={tipo === "vendas" ? "cliente" : "fornecedor"}
                  name={tipo === "vendas" ? "cliente" : "fornecedor"}
                  placeholder={tipo === "vendas" ? "Nome do cliente" : "Nome do fornecedor"}
                  value={formData[tipo === "vendas" ? "cliente" : "fornecedor"]}
                  onChange={handleChange}
                />
              </div>
              
              {tipo === "compras" && (
                <div className="space-y-2">
                  <Label htmlFor="previsaoEntrega">Previsão de Entrega</Label>
                  <Input
                    id="previsaoEntrega"
                    name="previsaoEntrega"
                    type="date"
                    value={formData.previsaoEntrega}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium">Produtos</h3>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell>{produto.nome}</TableCell>
                        <TableCell className="text-right">
                          {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell className="text-center">{produto.quantidade}</TableCell>
                        <TableCell className="text-right">
                          {produto.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveProduto(produto.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    <TableRow>
                      <TableCell>
                        <Input
                          placeholder="Nome do produto"
                          value={novoProduto.nome}
                          onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Preço"
                          value={novoProduto.preco}
                          onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
                          className="text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={novoProduto.quantidade}
                          onChange={(e) => setNovoProduto({ ...novoProduto, quantidade: parseInt(e.target.value) })}
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleAddProduto}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <SheetFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-4">
              <div className="order-2 sm:order-1">
                {ordem && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Excluir
                  </Button>
                )}
              </div>
              <div className="order-1 sm:order-2 flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <ActionButton type="submit" isLoading={isLoading}>
                  {ordem ? "Atualizar" : "Salvar"}
                </ActionButton>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={`Excluir Ordem de ${tipo === "vendas" ? "Venda" : "Compra"}`}
        description={`Tem certeza que deseja excluir a ordem ${ordem?.codigo}? Esta ação não poderá ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
}
