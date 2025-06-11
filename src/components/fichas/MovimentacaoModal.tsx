import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { ActionButton } from "@/components/ActionButton";
import { fichasService, Ficha, Movimentacao } from "@/services/fichasService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MovimentacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ficha: Ficha | null;
  onMovimentacaoRegistrada: () => void;
}

export const MovimentacaoModal: React.FC<MovimentacaoModalProps> = ({
  isOpen,
  onClose,
  ficha,
  onMovimentacaoRegistrada
}) => {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState<"Entrada" | "Saída" | "Retorno" | "Conclusão">("Retorno");
  const [quantidade, setQuantidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidadeComBanca, setQuantidadeComBanca] = useState(0);
  const [responsavel, setResponsavel] = useState("");

  useEffect(() => {
    if (ficha && isOpen) {
      carregarMovimentacoes();
      calcularQuantidadeComBanca();
    }
  }, [ficha, isOpen]);

  const carregarMovimentacoes = async () => {
    if (!ficha) return;
    
    try {
      setIsLoading(true);
      const data = await fichasService.buscarMovimentacoes(ficha.id);
      setMovimentacoes(data);
    } catch (error) {
      toast.error("Erro ao carregar movimentações");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calcularQuantidadeComBanca = () => {
    if (!ficha) return;
    
    // Para simplificar, vamos assumir que a quantidade com a banca é a quantidade original menos as movimentações de retorno
    let quantidadeRetornada = 0;
    movimentacoes.forEach(mov => {
      if (mov.tipo === "Retorno") {
        quantidadeRetornada += mov.quantidade;
      }
    });
    
    setQuantidadeComBanca(ficha.quantidade - quantidadeRetornada);
  };

  const handleSubmit = async () => {
    try {
      const quantidadeNum = Number(quantidade);
      if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
        toast.error("Quantidade inválida");
        return;
      }

      await fichasService.registrarMovimentacao(
        ficha.id,
        tipoMovimentacao,
        quantidadeNum,
        descricao,
        responsavel
      );
      
      toast.success("Movimentação registrada com sucesso");
      onMovimentacaoRegistrada();
      onClose();
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      toast.error('Erro ao registrar movimentação');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Movimentações da Ficha</DialogTitle>
          <DialogDescription>
            {ficha && `Ficha ${ficha.codigo} - ${ficha.produto} (${ficha.cor})`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4 border p-4 rounded-lg">
              <div className="text-lg font-medium">Registrar Movimentação</div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Movimentação</Label>
                <Select 
                  value={tipoMovimentacao} 
                  onValueChange={(value) => setTipoMovimentacao(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retorno">Retorno</SelectItem>
                    <SelectItem value="Saída">Saída</SelectItem>
                    <SelectItem value="Conclusão">Conclusão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input 
                  id="quantidade" 
                  type="number" 
                  value={quantidade} 
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="Informe a quantidade"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  value={descricao} 
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Informe uma descrição"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input 
                  id="responsavel" 
                  value={responsavel} 
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Informe o responsável"
                />
              </div>
              
              <ActionButton 
                onClick={handleSubmit} 
                isLoading={isLoading}
                loadingText="Registrando..."
                className="w-full"
              >
                Registrar Movimentação
              </ActionButton>
            </div>
            
            <div className="mt-4 border p-4 rounded-lg">
              <div className="text-lg font-medium mb-2">Resumo</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Quantidade Total:</div>
                  <div className="text-lg font-bold">{ficha?.quantidade || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Quantidade com Banca:</div>
                  <div className="text-lg font-bold">{quantidadeComBanca}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="text-lg font-medium mb-2">Histórico de Movimentações</div>
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentacoes.length > 0 ? (
                    movimentacoes.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>
                          {format(new Date(mov.data), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{mov.tipo}</TableCell>
                        <TableCell>{mov.quantidade}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{mov.descricao}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Nenhuma movimentação registrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 