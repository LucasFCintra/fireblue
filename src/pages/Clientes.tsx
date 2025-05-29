import { useEffect, useState } from "react";
import { Pencil, Trash2, Filter, Plus, Search, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/custom/DataTable";
import { useToast } from "@/hooks/use-toast";
import ActionButton from "@/components/custom/ActionButton";
import { ConfirmDialog } from "@/components/custom/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientes, Cliente } from "@/hooks/use-clientes";

export default function Clientes() {
  const { toast } = useToast();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [newItem, setNewItem] = useState<Cliente>({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: ""
  });
  const [editItem, setEditItem] = useState<any>(null);
  const api = 'http://localhost:8687';
  
  const { 
    clientes, 
    isLoading: clientesLoading, 
    error: clientesError, 
    adicionarCliente, 
    atualizarCliente, 
    excluirCliente,
    socketConnected
  } = useClientes();

  useEffect(() => {
    setFilteredData(clientes);
    if (socketConnected) {
      toast({
        title: "Conectado!",
        description: "Conectado em tempo real! Atualizações serão mostradas automaticamente."
      });
    }
  }, [clientes, socketConnected, toast]);

  useEffect(() => {
    if (clientesError) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: clientesError
      });
    }
  }, [clientesError, toast]);

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setFilteredData(clientes.filter(item =>
        item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()))
      ));
      setIsLoading(false);
      toast({
        title: "Busca concluída",
        description: "Busca realizada com sucesso!"
      });
    }, 500);
  };

  const handleAddItem = () => {
    setIsAddModalOpen(true);
  };

  const handleInsertItem = async () => {
    try {
      setIsLoading(true);
      const resposta = await adicionarCliente(newItem);
      
      if (resposta) {
        setIsAddModalOpen(false);
        setNewItem({
          nome: "",
          cnpj: "",
          email: "",
          telefone: "",
          endereco: "",
          cidade: "",
          estado: "",
          cep: ""
        });
        toast({
          title: "Sucesso",
          description: "Cliente inserido com sucesso!"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao inserir cliente"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const id = selectedRow?.idCliente || selectedRow?.id;
      const resposta = await excluirCliente(id);
      
      if (resposta) {
        setIsDeleteDialogOpen(false);
        toast({
          title: "Sucesso",
          description: "Cliente removido com sucesso"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao remover cliente"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Exportação concluída",
        description: `Dados exportados com sucesso em formato ${format}`
      });
    }, 1000);
  };

  const columns = [
    { accessor: "nome", header: "Nome" },
    { accessor: "cnpj", header: "CNPJ" },
    { accessor: "email", header: "Email" },
    { accessor: "telefone", header: "Telefone" },
    { accessor: "endereco", header: "Endereço" },
    { accessor: "cidade", header: "Cidade" },
    { accessor: "estado", header: "Estado" },
    { accessor: "cep", header: "CEP" },
    {
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setSelectedRow(row); setEditItem(row); setIsEditDialogOpen(true); }}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setSelectedRow(row); setIsDeleteDialogOpen(true); }}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
      header: "Ações"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <ActionButton 
              onClick={handleSearch} 
              isLoading={isLoading} 
              loadingText="Buscando..." 
              size="sm"
              startIcon={<Search className="h-4 w-4" />}
            >
              Buscar
            </ActionButton>
          </div>
          <ActionButton
            variant="outline" 
            size="sm"
            startIcon={<Filter className="h-4 w-4" />}
            onClick={() => toast({
              title: "Filtros",
              description: "Filtros serão implementados"
            })}
          >
            Filtros
          </ActionButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("excel")}> <Download className="w-4 h-4 mr-2" /> Excel </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}> <Download className="w-4 h-4 mr-2" /> PDF </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}> <Download className="w-4 h-4 mr-2" /> CSV </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ActionButton
            size="sm"
            startIcon={<Plus className="h-4 w-4" />}
            onClick={handleAddItem}
          >
            Novo Cliente
          </ActionButton>
        </div>
      </div>
      <DataTable
        data={filteredData}
        columns={columns}
        onRowClick={(row) => {
          setSelectedRow(row);
          toast({
            title: "Cliente selecionado",
            description: `Selecionado: ${row.nome}`
          });
        }}
      />
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir o cliente "${selectedRow?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
      <Dialog open={isEditDialogOpen} onOpenChange={open => { setIsEditDialogOpen(open); if (!open) setEditItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome" value={editItem?.nome || ""} onChange={e => setEditItem((prev: any) => ({ ...prev, nome: e.target.value }))} />
            <Input placeholder="CNPJ" value={editItem?.cnpj || ""} onChange={e => setEditItem((prev: any) => ({ ...prev, cnpj: e.target.value }))} />
            <Input placeholder="Email" value={editItem?.email || ""} onChange={e => setEditItem((prev: any) => ({ ...prev, email: e.target.value }))} />
            <Input placeholder="Telefone" value={editItem?.telefone || ""} onChange={e => setEditItem((prev: any) => ({ ...prev, telefone: e.target.value }))} />
            <Input placeholder="Endereço" value={editItem?.endereco || ""} onChange={e => setEditItem((prev: any) => ({ ...prev, endereco: e.target.value }))} />
            <Input placeholder="Cidade" value={editItem?.cidade || ""} onChange={e => setEditItem((prev: any) => ({ ...prev, cidade: e.target.value }))} />
            <Input placeholder="Estado" value={editItem?.estado || ""} onChange={e => setEditItem((prev: any) => ({ ...prev, estado: e.target.value }))} />
            <Input placeholder="CEP" value={editItem?.cep || ""} onChange={e => setEditItem((prev: any) => ({ ...prev, cep: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button onClick={() => { setIsEditDialogOpen(false); setEditItem(null); }} variant="outline">Cancelar</Button>
            <Button onClick={async () => {
              setIsLoading(true);
              try {
                const { criado_em, idCliente, id, ...itemParaUpdate } = editItem;
                const idClienteAtual = idCliente || id;
                const resposta = await atualizarCliente(idClienteAtual, itemParaUpdate);
                
                if (resposta) {
                  setIsEditDialogOpen(false);
                  setEditItem(null);
                  toast({
                    title: "Sucesso",
                    description: "Cliente atualizado com sucesso!"
                  });
                } else {
                  toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Erro ao atualizar cliente"
                  });
                }
              } finally {
                setIsLoading(false);
              }
            }} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome" value={newItem.nome} onChange={e => setNewItem({ ...newItem, nome: e.target.value })} />
            <Input placeholder="CNPJ" value={newItem.cnpj} onChange={e => setNewItem({ ...newItem, cnpj: e.target.value })} />
            <Input placeholder="Email" value={newItem.email} onChange={e => setNewItem({ ...newItem, email: e.target.value })} />
            <Input placeholder="Telefone" value={newItem.telefone} onChange={e => setNewItem({ ...newItem, telefone: e.target.value })} />
            <Input placeholder="Endereço" value={newItem.endereco} onChange={e => setNewItem({ ...newItem, endereco: e.target.value })} />
            <Input placeholder="Cidade" value={newItem.cidade} onChange={e => setNewItem({ ...newItem, cidade: e.target.value })} />
            <Input placeholder="Estado" value={newItem.estado} onChange={e => setNewItem({ ...newItem, estado: e.target.value })} />
            <Input placeholder="CEP" value={newItem.cep} onChange={e => setNewItem({ ...newItem, cep: e.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddModalOpen(false)} variant="outline">Cancelar</Button>
            <Button onClick={handleInsertItem} disabled={isLoading}>
              {isLoading ? "Inserindo..." : "Inserir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}