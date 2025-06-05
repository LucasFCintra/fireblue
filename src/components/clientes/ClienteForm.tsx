
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ActionButton } from "@/components/ActionButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ClienteFormProps {
  cliente?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ClienteForm({ cliente, isOpen, onClose }: ClienteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome: cliente?.nome || "",
    documento: cliente?.documento || "",
    telefone: cliente?.telefone || "",
    email: cliente?.email || "",
    cep: cliente?.cep || "",
    endereco: cliente?.endereco || "",
    numero: cliente?.numero || "",
    complemento: cliente?.complemento || "",
    bairro: cliente?.bairro || "",
    cidade: cliente?.cidade || "",
    estado: cliente?.estado || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação da API
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: cliente ? "Cliente atualizado" : "Cliente cadastrado",
        description: `O cliente ${formData.nome} foi ${cliente ? "atualizado" : "cadastrado"} com sucesso.`
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
        title: "Cliente excluído",
        description: `O cliente ${cliente.nome} foi excluído com sucesso.`,
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
      onClose();
    }, 1000);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full md:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{cliente ? "Editar Cliente" : "Novo Cliente"}</SheetTitle>
            <SheetDescription>
              {cliente
                ? "Atualize os dados do cliente no formulário abaixo."
                : "Preencha os dados do novo cliente."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Nome do cliente"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documento">CPF/CNPJ</Label>
                <Input
                  id="documento"
                  name="documento"
                  placeholder="CPF ou CNPJ"
                  value={formData.documento}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="Telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  name="cep"
                  placeholder="CEP"
                  value={formData.cep}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  placeholder="Endereço"
                  value={formData.endereco}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  name="numero"
                  placeholder="Número"
                  value={formData.numero}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  name="complemento"
                  placeholder="Complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  name="bairro"
                  placeholder="Bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  placeholder="Cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  name="estado"
                  placeholder="Estado"
                  value={formData.estado}
                  onChange={handleChange}
                />
              </div>
            </div>

            <SheetFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-4">
              <div className="order-2 sm:order-1">
                {cliente && (
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
                  {cliente ? "Atualizar" : "Salvar"}
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
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente ${cliente?.nome}? Esta ação não poderá ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
}
