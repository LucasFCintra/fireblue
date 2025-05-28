import { useState, useEffect } from "react";
import { FileText, Download, Filter, Trash2, Plus, Search, Pencil, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import DataTable from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { ActionButton } from "@/components/ActionButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTerceiros, Terceiro } from "@/hooks/use-terceiros";

export default function Terceiros() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRow, setSelectedRow] = useState<Terceiro | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<Terceiro[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");
  const [newItem, setNewItem] = useState<Terceiro>({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    tipo: "fornecedor"
  });
  const [editItem, setEditItem] = useState<Terceiro | null>(null);
  
  const { 
    terceiros, 
    isLoading, 
    fetchTerceiros, 
    fetchTerceirosByTipo,
    addTerceiro,
    updateTerceiro,
    deleteTerceiro
  } = useTerceiros();

  useEffect(() => {
    setFilteredData(terceiros);
  }, [terceiros]);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = terceiros.filter(item =>
      item.nome.toLowerCase().includes(query) ||
      (item.cnpj && item.cnpj.toLowerCase().includes(query))
    );
    
    setFilteredData(filtered);
    toast.success(`Busca realizada!`);
  };

  const handleAddItem = () => {
    setIsAddModalOpen(true);
  };

  const handleInsertItem = async () => {
    const success = await addTerceiro(newItem);
    if (success) {
      setIsAddModalOpen(false);
      setNewItem({
        nome: "",
        cnpj: "",
        email: "",
        telefone: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        tipo: "fornecedor"
      });
    }
  };

  const handleEditItem = async () => {
    if (editItem) {
      const success = await updateTerceiro(editItem);
      if (success) {
        setIsEditDialogOpen(false);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedRow) {
      const id = selectedRow.idTerceiro || selectedRow.id;
      if (id) {
        const success = await deleteTerceiro(id);
        if (success) {
          setIsDeleteDialogOpen(false);
        }
      }
    }
  };

  const handleExport = (format: string) => {
    toast.success(`Dados exportados com sucesso em formato ${format}`);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "todos") {
      fetchTerceiros();
    } else {
      fetchTerceirosByTipo(value as 'fornecedor' | 'banca');
    }
  };

  const columns = [
    { accessor: "nome", header: "Nome" },
    { accessor: "cnpj", header: "CNPJ" },
    { accessor: "email", header: "Email" },
    { accessor: "telefone", header: "Telefone" },
    { accessor: "tipo", header: "Tipo", 
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value === 'fornecedor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {value === 'fornecedor' ? 'Fornecedor' : 'Banca'}
        </span>
      )
    },
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
        <h1 className="text-3xl font-bold tracking-tight">Terceiros</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar nome ou CNPJ..."
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
            onClick={() => toast.info("Filtros serão implementados")}
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
            Novo Terceiro
          </ActionButton>
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="fornecedor">Fornecedores</TabsTrigger>
          <TabsTrigger value="banca">Bancas</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable
        data={filteredData}
        columns={columns}
        onRowClick={(row) => {
          setSelectedRow(row);
          toast.info(`Selecionado: ${row.nome}`);
        }}
        isLoading={isLoading}
      />
      
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir o terceiro "${selectedRow?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
      
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Terceiro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select 
                value={newItem.tipo} 
                onValueChange={(value: 'fornecedor' | 'banca') => setNewItem({...newItem, tipo: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="banca">Banca</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Nome" value={newItem.nome} onChange={e => setNewItem({...newItem, nome: e.target.value})} />
            <Input placeholder="CNPJ" value={newItem.cnpj} onChange={e => setNewItem({...newItem, cnpj: e.target.value})} />
            <Input placeholder="Email" value={newItem.email} onChange={e => setNewItem({...newItem, email: e.target.value})} />
            <Input placeholder="Telefone" value={newItem.telefone} onChange={e => setNewItem({...newItem, telefone: e.target.value})} />
            <Input placeholder="Endereço" value={newItem.endereco} onChange={e => setNewItem({...newItem, endereco: e.target.value})} />
            <Input placeholder="Cidade" value={newItem.cidade} onChange={e => setNewItem({...newItem, cidade: e.target.value})} />
            <Input placeholder="Estado" value={newItem.estado} onChange={e => setNewItem({...newItem, estado: e.target.value})} />
            <Input placeholder="CEP" value={newItem.cep} onChange={e => setNewItem({...newItem, cep: e.target.value})} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleInsertItem} disabled={isLoading}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={open => { setIsEditDialogOpen(open); if (!open) setEditItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Terceiro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select 
                value={editItem?.tipo || "fornecedor"} 
                onValueChange={(value: 'fornecedor' | 'banca') => setEditItem(prev => prev ? {...prev, tipo: value} : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="banca">Banca</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Nome" value={editItem?.nome || ""} onChange={e => setEditItem(prev => prev ? { ...prev, nome: e.target.value } : null)} />
            <Input placeholder="CNPJ" value={editItem?.cnpj || ""} onChange={e => setEditItem(prev => prev ? { ...prev, cnpj: e.target.value } : null)} />
            <Input placeholder="Email" value={editItem?.email || ""} onChange={e => setEditItem(prev => prev ? { ...prev, email: e.target.value } : null)} />
            <Input placeholder="Telefone" value={editItem?.telefone || ""} onChange={e => setEditItem(prev => prev ? { ...prev, telefone: e.target.value } : null)} />
            <Input placeholder="Endereço" value={editItem?.endereco || ""} onChange={e => setEditItem(prev => prev ? { ...prev, endereco: e.target.value } : null)} />
            <Input placeholder="Cidade" value={editItem?.cidade || ""} onChange={e => setEditItem(prev => prev ? { ...prev, cidade: e.target.value } : null)} />
            <Input placeholder="Estado" value={editItem?.estado || ""} onChange={e => setEditItem(prev => prev ? { ...prev, estado: e.target.value } : null)} />
            <Input placeholder="CEP" value={editItem?.cep || ""} onChange={e => setEditItem(prev => prev ? { ...prev, cep: e.target.value } : null)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditItem} disabled={isLoading}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 