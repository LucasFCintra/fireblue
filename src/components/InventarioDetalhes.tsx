import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Info,
  Tag,
  DollarSign,
  MapPin,
  User,
  FileText,
  Calendar,
  AlertTriangle,
  BarChart3,
  Edit,
  TrendingUp,
  Trash2,
  QrCode,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"geral" | "estoque">("geral");

  const formatDate = (dateString: string) => {
    if (!dateString) return "Não informado";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data inválida";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ativo":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800";
      case "inativo":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-200 dark:border-gray-800";
      case "baixo":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800";
    }
  };
  
  // Imagem padrão caso não exista uma imagem do produto
  const imagemPadrao = "https://placehold.co/300x300/e2e8f0/64748b?text=Sem+Imagem";
  
  if (!item) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {item.nome_produto || item.produto}
          </DialogTitle>
          <DialogDescription>
            Detalhes do produto {item.sku || item.codigo_barras}
          </DialogDescription>
        </DialogHeader>
        
        {/* Abas */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab("geral")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "geral" 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Informações Gerais
          </button>
          <button
            onClick={() => setActiveTab("estoque")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "estoque" 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Estoque
          </button>
        </div>
        
        {activeTab === "geral" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seção de Imagem */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Imagem do Produto</label>
                <div className="mt-2 flex flex-col items-center">
                  <div className="relative w-full max-w-[200px]">
                    <img 
                      src={item.imagem_url || item.imagemUrl || imagemPadrao} 
                      alt={item.nome_produto || item.produto} 
                      className="w-full h-auto object-contain rounded-md border border-input aspect-square"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = imagemPadrao;
                      }}
                    />
                  </div>
                  
                  <div className="mt-4 space-y-3 w-full max-w-[200px]">
                    <Badge variant="outline" className={`w-full justify-center py-2 text-sm ${getStatusColor(item.status)}`}>
                      {item.status}
                    </Badge>
                    
                    {/* Código de barras */}
                    {(item.codigo_barras || item.codigoBarras) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/30 rounded-md">
                        <QrCode className="h-4 w-4" />
                        <span>Código: {item.codigo_barras || item.codigoBarras}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Informações Básicas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <div className="p-2 bg-gray-50 rounded-md border">
                  <p className="text-sm">{item.sku || 'Não informado'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Código de Barras</label>
                <div className="p-2 bg-gray-50 rounded-md border">
                  <p className="text-sm">{item.codigo_barras || item.codigoBarras || 'Não informado'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nome do Produto</label>
                <div className="p-2 bg-gray-50 rounded-md border">
                  <p className="text-sm font-medium">{item.nome_produto || item.produto}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <div className="p-2 bg-gray-50 rounded-md border">
                  <p className="text-sm">{item.categoria || 'Não informado'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fornecedor</label>
                <div className="p-2 bg-gray-50 rounded-md border">
                  <p className="text-sm">{item.fornecedor || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Seção de Estoque e Valores */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor Unitário</label>
                <div className="p-2 bg-gray-50 rounded-md border">
                  <p className="text-sm font-medium">R$ {(item.preco_unitario || item.valorUnitario || 0).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantidade em Estoque</label>
                <div className="p-2 bg-gray-50 rounded-md border">
                  <p className="text-sm font-medium">{item.quantidade || 0} {item.unidade || item.unidadeMedida || "un"}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
                <div className="p-2 bg-gray-50 rounded-md border">
                  <p className="text-sm">{item.estoque_minimo || 0} {item.unidade || item.unidadeMedida || "un"}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Localização</label>
                <div className="p-2 bg-gray-50 rounded-md border">
                  <p className="text-sm">{item.localizacao || 'Não informado'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unidade de Medida</label>
                <div className="p-2 bg-gray-50 rounded-md border">
                  <p className="text-sm">{item.unidade || item.unidadeMedida || 'Unidade (un)'}</p>
                </div>
              </div>
              
              {/* Valor Total em Estoque */}
              <div>
                <label className="block text-sm font-medium mb-1">Valor Total em Estoque</label>
                <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm font-bold text-blue-800">
                    R$ {((item.preco_unitario || item.valorUnitario || 0) * item.quantidade).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "estoque" && (
          <div className="space-y-6">
            {/* Informações de estoque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantidade em Estoque</p>
                    <p className="text-2xl font-bold">{item.quantidade} {item.unidade || item.unidadeMedida || "un"}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
                    <p className="text-2xl font-bold">{item.estoque_minimo || 0} {item.unidade || item.unidadeMedida || "un"}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md sm:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">R$ {((item.preco_unitario || item.valorUnitario || 0) * item.quantidade).toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            {/* Histórico de movimentações */}
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Histórico de movimentações será implementado em breve</p>
            </div>
          </div>
        )}
        
        {/* Botões de ação */}
        <DialogFooter className="pt-6 border-t">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              
              {onAjusteEstoque && (
                <Button
                  variant="outline"
                  onClick={onAjusteEstoque}
                  className="w-full sm:w-auto"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ajustar Estoque
                </Button>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 