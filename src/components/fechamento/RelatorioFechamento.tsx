import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer, Save } from "lucide-react";
import { FechamentoBanca, RelatorioSemanal } from '@/types/fechamento';

interface RelatorioFechamentoProps {
  relatorio: RelatorioSemanal;
  onSalvar: () => void;
  onFinalizar: () => void;
  onVerDetalhesBanca: (fechamento: FechamentoBanca) => void;
  isLoading: boolean;
}

export const RelatorioFechamento: React.FC<RelatorioFechamentoProps> = ({
  relatorio,
  onSalvar,
  onFinalizar,
  onVerDetalhesBanca,
  isLoading
}) => {
  // Função para formatar valor em reais
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">
            Relatório de Fechamento Semanal
          </CardTitle>
          <CardDescription>
            Período: {relatorio.dataInicio} a {relatorio.dataFim} (Semana {relatorio.semana})
          </CardDescription>
        </div>
        <Badge 
          className={relatorio.status === 'aberto' 
            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' 
            : 'bg-green-100 text-green-800 hover:bg-green-100'
          }
        >
          {relatorio.status === 'aberto' ? 'Em aberto' : 'Fechado'}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Resumo geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total de Bancas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{relatorio.fechamentos.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total de Peças</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{relatorio.totalPecas.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{formatarMoeda(relatorio.valorTotal)}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabela de fechamentos por banca */}
        <div>
          <h3 className="text-lg font-medium mb-4">Fechamento por Banca</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banca</TableHead>
                <TableHead>Peças Entregues</TableHead>
                <TableHead>Valor a Pagar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorio.fechamentos.map((fechamento) => (
                <TableRow key={fechamento.id}>
                  <TableCell className="font-medium">{fechamento.nomeBanca}</TableCell>
                  <TableCell>{fechamento.totalPecas.toLocaleString()}</TableCell>
                  <TableCell>{formatarMoeda(fechamento.valorTotal)}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        fechamento.status === 'pendente' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : fechamento.status === 'pago'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }
                    >
                      {fechamento.status === 'pendente' ? 'Pendente' : 
                       fechamento.status === 'pago' ? 'Pago' : 'Cancelado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onVerDetalhesBanca(fechamento)}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Ver detalhes</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption>
              Total de {relatorio.fechamentos.length} bancas com fechamento na semana.
            </TableCaption>
          </Table>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled={isLoading}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="secondary"
            disabled={isLoading || relatorio.status === 'fechado'}
            onClick={onSalvar}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button 
            variant="default"
            disabled={isLoading || relatorio.status === 'fechado'}
            onClick={onFinalizar}
          >
            Finalizar Fechamento
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}; 