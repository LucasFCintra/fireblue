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

interface RecebimentoParcialModalProps {
  isOpen: boolean;
  onClose: () => void;
  ficha: any;
  onRecebimentoRegistrado: () => void;
}

export function RecebimentoParcialModal({
  isOpen,
  onClose,
  ficha,
  onRecebimentoRegistrado
}: RecebimentoParcialModalProps) {
  const [quantidadeRecebida, setQuantidadeRecebida] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantidadeRecebida || parseInt(quantidadeRecebida) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, informe uma quantidade válida",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(quantidadeRecebida) > ficha.quantidade) {
      toast({
        title: "Erro",
        description: "A quantidade recebida não pode ser maior que a quantidade total",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('http://26.203.75.236:8687/api/recebimentos-parciais', {
        ficha_id: ficha.id,
        quantidade_recebida: parseInt(quantidadeRecebida),
        observacoes
      });

      toast({
        title: "Sucesso",
        description: "Recebimento parcial registrado com sucesso",
      });

      onRecebimentoRegistrado();
      onClose();
    } catch (error) {
      console.error('Erro ao registrar recebimento parcial:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar recebimento parcial",
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
          <DialogTitle>Registrar Recebimento Parcial</DialogTitle>
        </DialogHeader>

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
            <Label>Quantidade Recebida</Label>
            <Input
              type="number"
              value={quantidadeRecebida}
              onChange={(e) => setQuantidadeRecebida(e.target.value)}
              placeholder="Informe a quantidade recebida"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informe observações sobre o recebimento"
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
              {isLoading ? "Registrando..." : "Registrar Recebimento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 