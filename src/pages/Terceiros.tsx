import { useState, useEffect } from "react";
import { FileText, Download, Filter, Trash2, Plus, Search, Pencil, Store, Users, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { useCep } from "@/hooks/use-cep";

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
    tipo: "fornecedor",
    numero: "",
    complemento: ""
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

  const { buscarCep, loading: loadingCep, error: errorCep } = useCep();

  const limparFormulario = () => {
    setNewItem({
      nome: "",
      cnpj: "",
      email: "",
      telefone: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      tipo: "fornecedor",
      numero: "",
      complemento: ""
    });
  };

  // Inicializa os dados filtrados apenas quando terceiros muda e não há filtros aplicados
  useEffect(() => {
    // Definir os dados filtrados apenas na inicialização ou quando os dados base mudarem
    setFilteredData(terceiros);
  }, [terceiros]);

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
        tipo: "fornecedor",
        numero: "",
        complemento: ""
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
    // Log para debug
    console.log(`Exportando ${filteredData.length} de ${terceiros.length} registros`);
    
    if (format === "excel") {
      // Prepara os dados para exportação
      const dadosParaExportar = filteredData.map(item => ({
        'Nome': item.nome,
        'CNPJ': item.cnpj || '',
        'Email': item.email || '',
        'Telefone': item.telefone || '',
        'Tipo': item.tipo == 'fornecedor' ? 'Fornecedor' : 'Banca',
        'Endereço': item.endereco || '',
        'Número': item.numero || '',
        'Complemento': item.complemento || '',
        'Cidade': item.cidade || '',
        'Estado': item.estado || '',
        'CEP': item.cep || ''
      }));

      // Cria uma nova planilha
      const ws = XLSX.utils.json_to_sheet(dadosParaExportar);

      // Ajusta a largura das colunas
      const wscols = [
        { wch: 30 }, // Nome
        { wch: 18 }, // CNPJ
        { wch: 30 }, // Email
        { wch: 15 }, // Telefone
        { wch: 15 }, // Tipo
        { wch: 40 }, // Endereço
        { wch: 10 }, // Número
        { wch: 20 }, // Complemento
        { wch: 20 }, // Cidade
        { wch: 10 }, // Estado
        { wch: 10 }  // CEP
      ];
      ws['!cols'] = wscols;

      // Cria um novo workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Terceiros");

      // Gera o arquivo Excel
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      let fileName = `terceiros_${dataAtual}`;
      
      // Adiciona indicação de filtro no nome do arquivo se aplicável
      if (filteredData.length !== terceiros.length) {
        fileName += `_filtrado_${filteredData.length}_de_${terceiros.length}`;
      }
      
      XLSX.writeFile(wb, `${fileName}.xlsx`);

      toast.success(`${filteredData.length} registros exportados com sucesso!`);
    } else if (format === "pdf") {
      // Cria um novo documento PDF
      const doc = new jsPDF({
        orientation: 'landscape',
      });
      
      // Adiciona o título
      doc.setFontSize(16);
      doc.text("Relatório de Terceiros", 14, 15);
      
      // Adiciona a data e informações de filtro
      doc.setFontSize(10);
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      doc.text(`Data: ${dataAtual}`, 14, 22);
      
      // Adiciona informação sobre os dados filtrados
      if (filteredData.length !== terceiros.length) {
        doc.text(`Relatório com dados filtrados: ${filteredData.length} de ${terceiros.length} registros`, 14, 28);
      }
      
      // Prepara os dados para a tabela
      const dadosParaExportar = filteredData.map(item => [
        item.nome,
        item.cnpj || '-',
        item.email || '-',
        item.telefone || '-',
        item.tipo === 'fornecedor' ? 'Fornecedor' : 'Banca',
        item.endereco || '-',
        item.numero || '-',
        item.cidade || '-',
        item.estado || '-'
      ]);

      // Configura a tabela
      autoTable(doc, {
        head: [['Nome', 'CNPJ', 'Email', 'Telefone', 'Tipo', 'Endereço', 'Número', 'Cidade', 'Estado']],
        body: dadosParaExportar,
        startY: filteredData.length !== terceiros.length ? 35 : 30,
        styles: {
          fontSize: 10,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Nome
          1: { cellWidth: 35 }, // CNPJ
          2: { cellWidth: 45 }, // Email
          3: { cellWidth: 30 }, // Telefone
          4: { cellWidth: 25 }, // Tipo
          5: { cellWidth: 40 }, // Endereço
          6: { cellWidth: 25 }, // Número
          7: { cellWidth: 30 }, // Cidade
          8: { cellWidth: 20 }, // Estado
        },
        margin: { top: 30 },
        didDrawPage: function(data: any) {
          // Adiciona o número da página
          doc.setFontSize(9);
          doc.text(
            `Página ${data.pageNumber}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        }
      });

      // Salva o PDF
      const dataAtualFormatada = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      let fileName = `terceiros_${dataAtualFormatada}`;
      
      // Adiciona indicação de filtro no nome do arquivo se aplicável
      if (filteredData.length !== terceiros.length) {
        fileName += `_filtrado_${filteredData.length}_de_${terceiros.length}`;
      }
      
      doc.save(`${fileName}.pdf`);
      
      toast.success(`${filteredData.length} registros exportados em PDF com sucesso!`);
    } else {
      toast.info("Exportação em outros formatos será implementada em breve");
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "todos") {
      fetchTerceiros();
    } else {
      fetchTerceirosByTipo(value as 'fornecedor' | 'banca');
    }
  };

  const handleCepChange = async (cep: string) => {
    const endereco = await buscarCep(cep);
    if (endereco) {
      setNewItem(prev => ({
        ...prev,
        endereco: endereco.logradouro,
        cidade: endereco.localidade,
        estado: endereco.uf,
        cep: endereco.cep
      }));
    }
  };

  const handleEditCepChange = async (cep: string) => {
    const endereco = await buscarCep(cep);
    if (endereco && editItem) {
      setEditItem(prev => prev ? {
        ...prev,
        endereco: endereco.logradouro,
        cidade: endereco.localidade,
        estado: endereco.uf,
        cep: endereco.cep
      } : null);
    }
  };

  const columns = [
    { accessor: "nome", header: "Nome", filterable: true },
    { accessor: "cnpj", header: "CNPJ", filterable: true },
    { accessor: "email", header: "Email", filterable: true },
    { accessor: "telefone", header: "Telefone", filterable: true },
    { 
      accessor: "tipo", 
      header: "Tipo", 
      filterable: true,
      cell: (row: Terceiro) => {
        const tipo = row.tipo?.toLowerCase();
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            tipo === 'fornecedor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {tipo === 'fornecedor' ? 'Fornecedor' : 'Banca'}
          </span>
        );
      }
    },
    { accessor: "endereco", header: "Endereço", filterable: true },
    { accessor: "cidade", header: "Cidade", filterable: true },
    { accessor: "estado", header: "Estado", filterable: true },
    { accessor: "cep", header: "CEP", filterable: true },
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
      header: "Ações",
      filterable: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Terceiros</h1>
        <div className="flex items-center gap-4">
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
              {/* <DropdownMenuItem onClick={() => handleExport("csv")}> <Download className="w-4 h-4 mr-2" /> CSV </DropdownMenuItem> */}
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
        data={terceiros}
        columns={columns}
        onRowClick={(row) => {
          setSelectedRow(row);
          toast.info(`Selecionado: ${row.nome}`);
        }}
        isLoading={isLoading}
        onFilterChange={(filtered) => setFilteredData(filtered)}
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
      
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        setIsAddModalOpen(open);
        if (!open) {
          limparFormulario();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Terceiro</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
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
            
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" placeholder="Nome" value={newItem.nome} onChange={e => setNewItem({...newItem, nome: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="CNPJ" value={newItem.cnpj} onChange={e => setNewItem({...newItem, cnpj: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Email" value={newItem.email} onChange={e => setNewItem({...newItem, email: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" placeholder="Telefone" value={newItem.telefone} onChange={e => setNewItem({...newItem, telefone: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="flex gap-2">
                <Input 
                  id="cep"
                  placeholder="CEP" 
                  value={newItem.cep} 
                  onChange={e => setNewItem({...newItem, cep: e.target.value})}
                  onBlur={e => handleCepChange(e.target.value)}
                />
                {loadingCep && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {errorCep && <p className="text-sm text-destructive">{errorCep}</p>}
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" placeholder="Endereço" value={newItem.endereco} onChange={e => setNewItem({...newItem, endereco: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input id="numero" placeholder="Número" value={newItem.numero} onChange={e => setNewItem({...newItem, numero: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input id="complemento" placeholder="Complemento" value={newItem.complemento} onChange={e => setNewItem({...newItem, complemento: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" placeholder="Cidade" value={newItem.cidade} onChange={e => setNewItem({...newItem, cidade: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" placeholder="Estado" value={newItem.estado} onChange={e => setNewItem({...newItem, estado: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleInsertItem} disabled={isLoading}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditItem(null);
          limparFormulario();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Terceiro</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
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
            
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome</Label>
              <Input id="edit-nome" placeholder="Nome" value={editItem?.nome || ""} onChange={e => setEditItem(prev => prev ? { ...prev, nome: e.target.value } : null)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-cnpj">CNPJ</Label>
              <Input id="edit-cnpj" placeholder="CNPJ" value={editItem?.cnpj || ""} onChange={e => setEditItem(prev => prev ? { ...prev, cnpj: e.target.value } : null)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" placeholder="Email" value={editItem?.email || ""} onChange={e => setEditItem(prev => prev ? { ...prev, email: e.target.value } : null)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-telefone">Telefone</Label>
              <Input id="edit-telefone" placeholder="Telefone" value={editItem?.telefone || ""} onChange={e => setEditItem(prev => prev ? { ...prev, telefone: e.target.value } : null)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-cep">CEP</Label>
              <div className="flex gap-2">
                <Input 
                  id="edit-cep"
                  placeholder="CEP" 
                  value={editItem?.cep || ""} 
                  onChange={e => setEditItem(prev => prev ? { ...prev, cep: e.target.value } : null)}
                  onBlur={e => handleEditCepChange(e.target.value)}
                />
                {loadingCep && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {errorCep && <p className="text-sm text-destructive">{errorCep}</p>}
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-endereco">Endereço</Label>
              <Input id="edit-endereco" placeholder="Endereço" value={editItem?.endereco || ""} onChange={e => setEditItem(prev => prev ? { ...prev, endereco: e.target.value } : null)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-numero">Número</Label>
              <Input id="edit-numero" placeholder="Número" value={editItem?.numero || ""} onChange={e => setEditItem(prev => prev ? { ...prev, numero: e.target.value } : null)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-complemento">Complemento</Label>
              <Input id="edit-complemento" placeholder="Complemento" value={editItem?.complemento || ""} onChange={e => setEditItem(prev => prev ? { ...prev, complemento: e.target.value } : null)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-cidade">Cidade</Label>
              <Input id="edit-cidade" placeholder="Cidade" value={editItem?.cidade || ""} onChange={e => setEditItem(prev => prev ? { ...prev, cidade: e.target.value } : null)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-estado">Estado</Label>
              <Input id="edit-estado" placeholder="Estado" value={editItem?.estado || ""} onChange={e => setEditItem(prev => prev ? { ...prev, estado: e.target.value } : null)} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditItem} disabled={isLoading}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 