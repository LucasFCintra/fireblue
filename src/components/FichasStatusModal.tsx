import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CircleDot, Truck } from "lucide-react";

// Definir tipos para as fichas
export interface Ficha {
  id: string;
  codigo: string;
  banca: string;
  dataEntrada: string;
  dataPrevisao: string;
  status: "aguardando-retirada" | "em-producao" | "recebido";
  quantidade: number;
  descricao: string;
}

interface FichasStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "aguardando-retirada" | "em-producao" | "recebido";
  fichas: Ficha[];
}

const statusConfig = {
  "aguardando-retirada": {
    title: "Fichas Aguardando Retirada",
    description: "Lista de todas as fichas que aguardam retirada pelas bancas",
    icon: <Clock className="h-5 w-5 text-amber-500" />,
    badgeColor: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    label: "Aguardando Retirada"
  },
  "em-producao": {
    title: "Fichas em Produção",
    description: "Lista de todas as fichas que estão em produção nas bancas",
    icon: <CircleDot className="h-5 w-5 text-blue-500" />,
    badgeColor: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    label: "Em Produção"
  },
  "recebido": {
    title: "Fichas Recebidas",
    description: "Lista de todas as fichas que foram recebidas das bancas",
    icon: <Truck className="h-5 w-5 text-green-500" />,
    badgeColor: "bg-green-100 text-green-800 hover:bg-green-100",
    label: "Recebido"
  }
};

export const FichasStatusModal: React.FC<FichasStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  fichas
}) => {
  const config = statusConfig[status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Banca</TableHead>
                <TableHead>Data de Entrada</TableHead>
                <TableHead>Previsão</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fichas.length > 0 ? (
                fichas.map((ficha) => (
                  <TableRow key={ficha.id}>
                    <TableCell className="font-medium">{ficha.codigo}</TableCell>
                    <TableCell>{ficha.banca}</TableCell>
                    <TableCell>{ficha.dataEntrada}</TableCell>
                    <TableCell>{ficha.dataPrevisao}</TableCell>
                    <TableCell>{ficha.quantidade}</TableCell>
                    <TableCell>
                      <Badge className={config.badgeColor}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{ficha.descricao}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Nenhuma ficha encontrada com este status.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 