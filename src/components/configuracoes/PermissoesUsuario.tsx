
import { useState } from "react";
import { PlusCircle, Trash, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ActionButton } from "@/components/ActionButton";

export function PermissoesUsuario() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Dados de exemplo de usuários
  const [usuarios, setUsuarios] = useState([
    { 
      id: 1, 
      nome: "Administrador", 
      email: "admin@sistema.com", 
      permissoes: {
        dashboard: true,
        produtos: true,
        vendas: true,
        compras: true,
        clientes: true,
        fornecedores: true,
        relatorios: true,
        configuracoes: true
      }
    },
    { 
      id: 2, 
      nome: "João Silva", 
      email: "joao@sistema.com", 
      permissoes: {
        dashboard: true,
        produtos: true,
        vendas: true,
        compras: false,
        clientes: true,
        fornecedores: false,
        relatorios: false,
        configuracoes: false
      }
    },
    { 
      id: 3, 
      nome: "Maria Santos", 
      email: "maria@sistema.com", 
      permissoes: {
        dashboard: true,
        produtos: true,
        vendas: false,
        compras: true,
        clientes: false,
        fornecedores: true,
        relatorios: true,
        configuracoes: false
      }
    }
  ]);
  
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: ""
  });
  
  const handlePermissaoChange = (userId: number, permissao: string, valor: boolean) => {
    setUsuarios(prevUsuarios => 
      prevUsuarios.map(usuario => 
        usuario.id === userId 
          ? { 
              ...usuario, 
              permissoes: { 
                ...usuario.permissoes, 
                [permissao]: valor 
              } 
            } 
          : usuario
      )
    );
    
    toast({
      title: "Permissão alterada",
      description: `Permissão atualizada com sucesso.`
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovoUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddUsuario = () => {
    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar um usuário.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulação de adição de usuário
    setTimeout(() => {
      const newId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
      
      setUsuarios([
        ...usuarios,
        {
          id: newId,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          permissoes: {
            dashboard: true,
            produtos: false,
            vendas: false,
            compras: false,
            clientes: false,
            fornecedores: false,
            relatorios: false,
            configuracoes: false
          }
        }
      ]);
      
      setNovoUsuario({
        nome: "",
        email: "",
        senha: ""
      });
      
      setIsLoading(false);
      
      toast({
        title: "Usuário adicionado",
        description: "O novo usuário foi adicionado com sucesso."
      });
    }, 1000);
  };
  
  const handleRemoveUsuario = (userId: number) => {
    setUsuarios(prevUsuarios => prevUsuarios.filter(usuario => usuario.id !== userId));
    
    toast({
      title: "Usuário removido",
      description: "O usuário foi removido com sucesso.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Adicionar Novo Usuário</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Nome do usuário"
                value={novoUsuario.nome}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email do usuário"
                value={novoUsuario.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                placeholder="Senha"
                value={novoUsuario.senha}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <ActionButton
              startIcon={<PlusCircle />}
              onClick={handleAddUsuario}
              isLoading={isLoading}
            >
              Adicionar Usuário
            </ActionButton>
          </div>
        </CardContent>
      </Card>
      
      <h3 className="text-lg font-medium mt-6">Lista de Usuários e Permissões</h3>
      
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Dashboard</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Vendas</TableHead>
              <TableHead>Compras</TableHead>
              <TableHead>Clientes</TableHead>
              <TableHead>Fornecedores</TableHead>
              <TableHead>Relatórios</TableHead>
              <TableHead>Configurações</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={usuario.permissoes.dashboard}
                    onCheckedChange={(checked) => handlePermissaoChange(usuario.id, "dashboard", checked)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={usuario.permissoes.produtos}
                    onCheckedChange={(checked) => handlePermissaoChange(usuario.id, "produtos", checked)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={usuario.permissoes.vendas}
                    onCheckedChange={(checked) => handlePermissaoChange(usuario.id, "vendas", checked)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={usuario.permissoes.compras}
                    onCheckedChange={(checked) => handlePermissaoChange(usuario.id, "compras", checked)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={usuario.permissoes.clientes}
                    onCheckedChange={(checked) => handlePermissaoChange(usuario.id, "clientes", checked)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={usuario.permissoes.fornecedores}
                    onCheckedChange={(checked) => handlePermissaoChange(usuario.id, "fornecedores", checked)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={usuario.permissoes.relatorios}
                    onCheckedChange={(checked) => handlePermissaoChange(usuario.id, "relatorios", checked)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={usuario.permissoes.configuracoes}
                    onCheckedChange={(checked) => handlePermissaoChange(usuario.id, "configuracoes", checked)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveUsuario(usuario.id)}
                    disabled={usuario.nome === "Administrador"} // Não permite remover o administrador
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
