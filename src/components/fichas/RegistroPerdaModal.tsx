import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';
import { fichasService } from '@/services/fichasService';

interface RegistroPerdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ficha: any;
  onPerdaRegistrada: () => void;
}

export function RegistroPerdaModal({
  isOpen,
  onClose,
  ficha,
  onPerdaRegistrada
}: RegistroPerdaModalProps) {
  const [quantidadePerdida, setQuantidadePerdida] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantidadePerdida || parseInt(quantidadePerdida) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, informe uma quantidade válida",
        variant: "destructive",
      });
      return;
    }

    const quantidadePerdidaNum = parseInt(quantidadePerdida);
    const quantidadeDisponivel = ficha.quantidade - (ficha.quantidade_perdida || 0);

    if (quantidadePerdidaNum > quantidadeDisponivel) {
      toast({
        title: "Erro",
        description: "A quantidade perdida não pode ser maior que a quantidade disponível",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Registrar a perda como uma movimentação do tipo "Perda"
      await axios.post(`http://26.203.75.236:8687/api/fichas/${ficha.id}/movimentacao`, {
        tipo: 'Perda',
        quantidade: quantidadePerdidaNum,
        descricao: observacoes,
        responsavel
      });

      // Atualizar a quantidade_perdida na ficha
      const fichaAtualizada = {
        ...ficha,
        quantidade_perdida: (ficha.quantidade_perdida || 0) + quantidadePerdidaNum
      };
      await fichasService.atualizarFicha(fichaAtualizada);

      toast({
        title: "Sucesso",
        description: "Perda registrada com sucesso",
      });

      onPerdaRegistrada();
      onClose();
    } catch (error) {
      console.error('Erro ao registrar perda:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar perda",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Perda</DialogTitle>
        </DialogHeader>

        {ficha ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Quantidade Total</Label>
              <Input
                type="number"
                value={ficha.quantidade}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade Já Perdida</Label>
              <Input
                type="number"
                value={ficha.quantidade_perdida || 0}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade Disponível</Label>
              <Input
                type="number"
                value={ficha.quantidade - (ficha.quantidade_perdida || 0)}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade Perdida Agora</Label>
              <Input
                type="number"
                value={quantidadePerdida}
                onChange={(e) => setQuantidadePerdida(e.target.value)}
                placeholder="Informe a quantidade perdida"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Informe o responsável pelo registro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informe o motivo da perda e outras observações"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrar Perda"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="p-4 text-center text-gray-500">
            Nenhuma ficha selecionada
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 