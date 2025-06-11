import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, Calendar, Edit, Trash2, BarChart3, QrCode, FileText, Tag, MapPin, User, DollarSign, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/ActionButton";

interface InventarioDetalhesProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onEdit?: () => void;
  onDelete?: () => void;
  onAjusteEstoque?: () => void;
}

export function InventarioDetalhes({
  isOpen,
  onClose,
  item,
  onEdit,
  onDelete,
  onAjusteEstoque,
}: InventarioDetalhesProps) {
  const [activeTab, setActiveTab] = useState("geral");
  
  // Função para formatar a data
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };
  
  // Determinar a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em Estoque": return "bg-green-100 text-green-800";
      case "Baixo Estoque": return "bg-yellow-100 text-yellow-800";
      case "Sem Estoque": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Imagem padrão caso não exista uma imagem do produto
  const imagemPadrao = "https://placehold.co/300x300/e2e8f0/64748b?text=Sem+Imagem";
  
  if (!item) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Package className="h-5 w-5" />
            {item.produto}
          </DialogTitle>
          <DialogDescription>
            Detalhes do produto {item.sku}
          </DialogDescription>
        </DialogHeader>
        
        {/* Abas */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("geral")}
            className={`px-4 py-2 font-medium text-sm ${activeTab === "geral" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
          >
            Informações Gerais
          </button>
          <button
            onClick={() => setActiveTab("estoque")}
            className={`px-4 py-2 font-medium text-sm ${activeTab === "estoque" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
          >
            Estoque
          </button>
        </div>
        
        {/* Conteúdo principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna da Imagem */}
          <div className="md:col-span-1">
            <div className="rounded-md border overflow-hidden">
              <img 
                src={item.imagemUrl || imagemPadrao} 
                alt={item.produto} 
                className="w-full h-auto object-cover aspect-square"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = imagemPadrao;
                }}
              />
            </div>
            
            <div className="mt-4 flex flex-col gap-2">
              <Badge variant="outline" className={`w-full justify-center py-1 text-sm ${getStatusColor(item.status)}`}>
                {item.status}
              </Badge>
              
              {/* Código de barras */}
              {item.codigoBarras && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <QrCode className="h-4 w-4" />
                  <span>Código: {item.codigoBarras}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Coluna de Informações */}
          <div className="md:col-span-2">
            {activeTab === "geral" && (
              <div className="space-y-4">
                {/* Seção principal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      Categoria
                    </p>
                    <p className="font-medium">{item.categoria}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      Valor Unitário
                    </p>
                    <p className="font-medium">R$ {item.valorUnitario.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Localização
                    </p>
                    <p className="font-medium">{item.localizacao}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Fornecedor
                    </p>
                    <p className="font-medium">{item.fornecedor || "Não especificado"}</p>
                  </div>
                </div>
                
                {/* Descrição */}
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <Info className="h-3.5 w-3.5" />
                    Descrição
                  </p>
                  <p className="text-sm">{item.descricao || "Sem descrição disponível."}</p>
                </div>
                
                {/* Datas */}
                <div className="pt-2 border-t space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Data de Cadastro: {formatDate(item.dataCadastro)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Última Atualização: {formatDate(item.dataUltimaAtualizacao)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "estoque" && (
              <div className="space-y-4">
                {/* Informações de estoque */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-muted/50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantidade em Estoque</p>
                        <p className="text-2xl font-bold">{item.quantidade} {item.unidadeMedida || "un"}</p>
                      </div>
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
                    <p className="font-medium">
                      {item.estoqueMinimo || 0} {item.unidadeMedida || "un"}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Unidade de Medida</p>
                    <p className="font-medium">{item.unidadeMedida || "Unidade"}</p>
                  </div>
                </div>
                
                {/* Alerta de estoque baixo */}
                {item.status === "Baixo Estoque" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm text-yellow-700">
                      Este produto está com estoque abaixo do mínimo recomendado de {item.estoqueMinimo} {item.unidadeMedida || "unidades"}.
                    </p>
                  </div>
                )}
                
                {/* Alerta de sem estoque */}
                {item.status === "Sem Estoque" && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-700">
                      Este produto está sem estoque. Considere realizar uma compra ou transferência.
                    </p>
                  </div>
                )}
                
                {/* Valor do estoque */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Valor em Estoque:</p>
                    <p className="font-medium">R$ {(item.quantidade * item.valorUnitario).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          {onAjusteEstoque && (
            <Button variant="outline" onClick={onAjusteEstoque} className="sm:mr-auto">
              <Package className="h-4 w-4 mr-2" />
              Ajustar Estoque
            </Button>
          )}
          
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
            
            <DialogClose asChild>
              <Button variant="default">Fechar</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 