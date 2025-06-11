import { useState, useEffect } from "react";
import { FileText, Download, Filter, Trash2, Plus, Search, Pencil, Store, Users, Loader2, Building, User, UserCircle, ArrowRight } from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import axios from "axios";

const API_URL = 'http://26.203.75.236:8687';

export default function Terceiros() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRow, setSelectedRow] = useState<Terceiro | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<Terceiro[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");
  const [todosTerceiros, setTodosTerceiros] = useState<Terceiro[]>([]);
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

  // Função para recarregar todos os terceiros (para manter os contadores atualizados)
  const recarregarTodosTerceiros = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/terceiros`);
      const data = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setTodosTerceiros(data);
    } catch (err) {
      console.error("Erro ao recarregar todos os terceiros", err);
    }
  };

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

  // Armazenar todos os terceiros para contagem - carrega na inicialização
  useEffect(() => {
    const carregarTodosTerceiros = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/terceiros`);
        const data = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setTodosTerceiros(data);
      } catch (err) {
        console.error("Erro ao buscar todos os terceiros", err);
      }
    };

    carregarTodosTerceiros();
  }, []); // Executar apenas na montagem

  // Atualizar o estado local quando terceiros mudar por operações CRUD
  useEffect(() => {
    // Se estamos na visualização de todos, também atualiza o estado de todosTerceiros
    if (activeTab === "todos" && terceiros.length > 0) {
      setTodosTerceiros(terceiros);
    }
  }, [terceiros, activeTab]);

  // Inicializa os dados filtrados quando terceiros muda
  useEffect(() => {
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
      // Recarregar todos os terceiros para atualizar os contadores
      recarregarTodosTerceiros();
    }
  };

  const handleEditItem = async () => {
    if (editItem) {
      const success = await updateTerceiro(editItem);
      if (success) {
        setIsEditDialogOpen(false);
        // Recarregar todos os terceiros para atualizar os contadores
        recarregarTodosTerceiros();
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
          // Recarregar todos os terceiros para atualizar os contadores
          recarregarTodosTerceiros();
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
    
    // Filtrar os dados localmente em vez de buscar novamente
    if (value === "todos") {
      // Mostrar todos os terceiros
      setFilteredData(todosTerceiros);
    } else {
      // Filtrar terceiros por tipo
      const terceirosFiltrados = todosTerceiros.filter(t => t.tipo === value);
      setFilteredData(terceirosFiltrados);
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
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            tipo === 'fornecedor' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {tipo === 'fornecedor' ? 'Fornecedor' : 'Banca'}
          </span>
        );
      }
    },
    { accessor: "endereco", header: "Endereço", filterable: true },
    { accessor: "cidade", header: "Cidade", filterable: true },
    { accessor: "estado", header: "Estado", filterable: true },
    { 
      accessor: "cep", 
      header: "CEP", 
      filterable: true,
      cell: (row: Terceiro) => (
        <span className="font-mono text-gray-600">
          {row.cep || '-'}
        </span>
      )
    },
    {
      accessor: (row: any) => (
        <div className="flex gap-2 justify-end">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={e => { 
              e.stopPropagation(); 
              setSelectedRow(row); 
              setEditItem(row); 
              setIsEditDialogOpen(true); 
            }}
            className="hover:bg-indigo-50 text-indigo-600"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={e => { 
              e.stopPropagation(); 
              setSelectedRow(row); 
              setIsDeleteDialogOpen(true); 
            }}
            className="hover:bg-red-50 text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      header: "Ações",
      filterable: false
    }
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-900">Terceiros</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie fornecedores e bancas para sua empresa
          </p>
        </div>
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
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Novo Terceiro
          </ActionButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700">
        <Card 
          className={`border-blue-200 bg-blue-50 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer ${activeTab === "todos" ? "ring-2 ring-blue-400" : "shadow-sm"}`}
          onClick={() => handleTabChange("todos")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total de Terceiros</CardTitle>
            <UserCircle className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{todosTerceiros.length}</div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-blue-600">
                Fornecedores e Bancas cadastrados
              </p>
              <span className="text-xs text-blue-600 font-medium flex items-center">
                {activeTab === "todos" ? "Visualizando" : "Ver todos"} <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-indigo-200 bg-indigo-50 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer ${activeTab === "fornecedor" ? "ring-2 ring-indigo-400" : ""}`}
          onClick={() => handleTabChange("fornecedor")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">Fornecedores</CardTitle>
            <Building className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">
              {todosTerceiros.filter(t => t.tipo === 'fornecedor').length}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-indigo-600">
                Fornecedores cadastrados
              </p>
              <span className="text-xs text-indigo-600 font-medium flex items-center">
                {activeTab === "fornecedor" ? "Visualizando" : "Ver lista"} <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-green-200 bg-green-50 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer ${activeTab === "banca" ? "ring-2 ring-green-400" : ""}`}
          onClick={() => handleTabChange("banca")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Bancas</CardTitle>
            <Store className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {todosTerceiros.filter(t => t.tipo === 'banca').length}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-green-600">
                Bancas cadastradas
              </p>
              <span className="text-xs text-green-600 font-medium flex items-center">
                {activeTab === "banca" ? "Visualizando" : "Ver lista"} <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center text-xs text-gray-500 -mt-2 mb-4 animate-in fade-in">
        Clique nos cards acima para filtrar os terceiros por categoria
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border animate-in fade-in duration-1000 hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            {activeTab === "todos" ? (
              <>
                <UserCircle className="h-5 w-5 text-blue-600 mr-2" />
                Todos os Terceiros
              </>
            ) : activeTab === "fornecedor" ? (
              <>
                <Building className="h-5 w-5 text-indigo-600 mr-2" />
                Fornecedores
              </>
            ) : (
              <>
                <Store className="h-5 w-5 text-green-600 mr-2" />
                Bancas
              </>
            )}
          </h2>
          {activeTab !== "todos" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleTabChange("todos")}
              className="text-gray-600 hover:bg-gray-100"
            >
              Ver todos
            </Button>
          )}
        </div>
        
        <DataTable
          data={filteredData}
          columns={columns}
          onRowClick={(row) => {
            setSelectedRow(row);
            toast.info(`Selecionado: ${row.nome}`);
          }}
          isLoading={isLoading}
          onFilterChange={(filtered) => setFilteredData(filtered)}
        />
      </div>
      
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
        <DialogContent className="max-w-5xl max-h-[85vh] w-[95vw] overflow-y-auto p-4 sm:p-6 md:p-8">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-semibold text-indigo-800">Novo Terceiro</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Preencha os dados do novo terceiro</p>
          </DialogHeader>
          
          {/* Tipo de Terceiro */}
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <Label htmlFor="tipo" className="font-medium">Tipo de Terceiro</Label>
            <Select 
              value={newItem.tipo} 
              onValueChange={(value: 'fornecedor' | 'banca') => setNewItem({...newItem, tipo: value})}
            >
              <SelectTrigger className="bg-white max-w-xs">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fornecedor">Fornecedor</SelectItem>
                <SelectItem value="banca">Banca</SelectItem>
              </SelectContent>
            </Select>
          </div>
            
          {/* Dados Principais */}
          <div>
            <h3 className="font-semibold text-gray-700 text-sm mb-2">Dados Principais</h3>
            <div className="h-0.5 bg-gray-100 mb-4"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
              <div className="space-y-2">
                <Label htmlFor="nome" className="font-medium">Nome</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome" 
                  value={newItem.nome} 
                  onChange={e => setNewItem({...newItem, nome: e.target.value})}
                  className="bg-white" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cnpj" className="font-medium">CNPJ</Label>
                <Input 
                  id="cnpj" 
                  placeholder="CNPJ" 
                  value={newItem.cnpj} 
                  onChange={e => setNewItem({...newItem, cnpj: e.target.value})}
                  className="bg-white" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone" className="font-medium">Telefone</Label>
                <Input 
                  id="telefone" 
                  placeholder="Telefone" 
                  value={newItem.telefone} 
                  onChange={e => setNewItem({...newItem, telefone: e.target.value})}
                  className="bg-white" 
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email" className="font-medium">Email</Label>
                <Input 
                  id="email" 
                  placeholder="Email" 
                  value={newItem.email} 
                  onChange={e => setNewItem({...newItem, email: e.target.value})}
                  className="bg-white" 
                />
              </div>
            </div>
          </div>
            
          {/* Endereço */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 text-sm mb-2">Endereço</h3>
            <div className="h-0.5 bg-gray-100 mb-4"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
              <div className="space-y-2">
                <Label htmlFor="cep" className="font-medium">CEP</Label>
                <div className="flex gap-2">
                  <Input 
                    id="cep"
                    placeholder="CEP" 
                    value={newItem.cep} 
                    onChange={e => setNewItem({...newItem, cep: e.target.value})}
                    onBlur={e => handleCepChange(e.target.value)}
                    className="bg-white"
                  />
                  {loadingCep && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {errorCep && <p className="text-sm text-destructive">{errorCep}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estado" className="font-medium">Estado</Label>
                <Input 
                  id="estado" 
                  placeholder="Estado" 
                  value={newItem.estado} 
                  onChange={e => setNewItem({...newItem, estado: e.target.value})}
                  className="bg-white" 
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cidade" className="font-medium">Cidade</Label>
                <Input 
                  id="cidade" 
                  placeholder="Cidade" 
                  value={newItem.cidade} 
                  onChange={e => setNewItem({...newItem, cidade: e.target.value})}
                  className="bg-white" 
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2 md:col-span-3">
                <Label htmlFor="endereco" className="font-medium">Endereço</Label>
                <Input 
                  id="endereco" 
                  placeholder="Endereço" 
                  value={newItem.endereco} 
                  onChange={e => setNewItem({...newItem, endereco: e.target.value})}
                  className="bg-white" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero" className="font-medium">Número</Label>
                <Input 
                  id="numero" 
                  placeholder="Número" 
                  value={newItem.numero} 
                  onChange={e => setNewItem({...newItem, numero: e.target.value})}
                  className="bg-white" 
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="complemento" className="font-medium">Complemento</Label>
                <Input 
                  id="complemento" 
                  placeholder="Complemento" 
                  value={newItem.complemento} 
                  onChange={e => setNewItem({...newItem, complemento: e.target.value})}
                  className="bg-white" 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="focus:ring-2 focus:ring-gray-300">Cancelar</Button>
            <Button onClick={handleInsertItem} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300">
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
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditItem(null);
          limparFormulario();
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[85vh] w-[95vw] overflow-y-auto p-4 sm:p-6 md:p-8">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-semibold text-indigo-800">Editar Terceiro</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Edite os dados do terceiro</p>
          </DialogHeader>
          
          {/* Tipo de Terceiro */}
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <Label htmlFor="tipo" className="font-medium">Tipo de Terceiro</Label>
            <Select 
              value={editItem?.tipo || "fornecedor"} 
              onValueChange={(value: 'fornecedor' | 'banca') => setEditItem(prev => prev ? {...prev, tipo: value} : null)}
            >
              <SelectTrigger className="bg-white max-w-xs">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fornecedor">Fornecedor</SelectItem>
                <SelectItem value="banca">Banca</SelectItem>
              </SelectContent>
            </Select>
          </div>
            
          {/* Dados Principais */}
          <div>
            <h3 className="font-semibold text-gray-700 text-sm mb-2">Dados Principais</h3>
            <div className="h-0.5 bg-gray-100 mb-4"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
              <div className="space-y-2">
                <Label htmlFor="edit-nome" className="font-medium">Nome</Label>
                <Input 
                  id="edit-nome" 
                  placeholder="Nome" 
                  value={editItem?.nome || ""} 
                  onChange={e => setEditItem(prev => prev ? { ...prev, nome: e.target.value } : null)}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-cnpj" className="font-medium">CNPJ</Label>
                <Input 
                  id="edit-cnpj" 
                  placeholder="CNPJ" 
                  value={editItem?.cnpj || ""} 
                  onChange={e => setEditItem(prev => prev ? { ...prev, cnpj: e.target.value } : null)}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-telefone" className="font-medium">Telefone</Label>
                <Input 
                  id="edit-telefone" 
                  placeholder="Telefone" 
                  value={editItem?.telefone || ""} 
                  onChange={e => setEditItem(prev => prev ? { ...prev, telefone: e.target.value } : null)}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-email" className="font-medium">Email</Label>
                <Input 
                  id="edit-email" 
                  placeholder="Email" 
                  value={editItem?.email || ""} 
                  onChange={e => setEditItem(prev => prev ? { ...prev, email: e.target.value } : null)}
                  className="bg-white"
                />
              </div>
            </div>
          </div>
            
          {/* Endereço */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 text-sm mb-2">Endereço</h3>
            <div className="h-0.5 bg-gray-100 mb-4"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
              <div className="space-y-2">
                <Label htmlFor="edit-cep" className="font-medium">CEP</Label>
                <div className="flex gap-2">
                  <Input 
                    id="edit-cep"
                    placeholder="CEP" 
                    value={editItem?.cep || ""} 
                    onChange={e => setEditItem(prev => prev ? { ...prev, cep: e.target.value } : null)}
                    onBlur={e => handleEditCepChange(e.target.value)}
                    className="bg-white"
                  />
                  {loadingCep && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {errorCep && <p className="text-sm text-destructive">{errorCep}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-estado" className="font-medium">Estado</Label>
                <Input 
                  id="edit-estado" 
                  placeholder="Estado" 
                  value={editItem?.estado || ""} 
                  onChange={e => setEditItem(prev => prev ? { ...prev, estado: e.target.value } : null)}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-cidade" className="font-medium">Cidade</Label>
                <Input 
                  id="edit-cidade" 
                  placeholder="Cidade" 
                  value={editItem?.cidade || ""} 
                  onChange={e => setEditItem(prev => prev ? { ...prev, cidade: e.target.value } : null)}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2 md:col-span-3">
                <Label htmlFor="edit-endereco" className="font-medium">Endereço</Label>
                <Input 
                  id="edit-endereco" 
                  placeholder="Endereço" 
                  value={editItem?.endereco || ""} 
                  onChange={e => setEditItem(prev => prev ? { ...prev, endereco: e.target.value } : null)}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-numero" className="font-medium">Número</Label>
                <Input 
                  id="edit-numero" 
                  placeholder="Número" 
                  value={editItem?.numero || ""} 
                  onChange={e => setEditItem(prev => prev ? { ...prev, numero: e.target.value } : null)}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-complemento" className="font-medium">Complemento</Label>
                <Input 
                  id="edit-complemento" 
                  placeholder="Complemento" 
                  value={editItem?.complemento || ""} 
                  onChange={e => setEditItem(prev => prev ? { ...prev, complemento: e.target.value } : null)}
                  className="bg-white"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="focus:ring-2 focus:ring-gray-300">Cancelar</Button>
            <Button onClick={handleEditItem} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300">
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
        </DialogContent>
      </Dialog>
    </div>
  );
} 