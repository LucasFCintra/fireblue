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
import { Loader2, Truck } from "lucide-react";
import axios from 'axios';
import { fichasService } from '@/services/fichasService';

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
  const [responsavel, setResponsavel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Calcular quantidades
  const quantidadeTotal = ficha?.quantidade || 0;
  const quantidadeJaRecebida = ficha?.quantidade_recebida || 0;
  const quantidadePerdida = ficha?.quantidade_perdida || 0;
  const quantidadeDisponivel = quantidadeTotal - quantidadeJaRecebida - quantidadePerdida;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar quantidade recebida
    if (!quantidadeRecebida || quantidadeRecebida.trim() === '') {
      newErrors.quantidadeRecebida = 'Quantidade recebida é obrigatória';
    } else {
      const quantidadeRecebidaNum = parseInt(quantidadeRecebida);
      if (isNaN(quantidadeRecebidaNum) || quantidadeRecebidaNum <= 0) {
        newErrors.quantidadeRecebida = 'Quantidade deve ser um número maior que zero';
      } else if (quantidadeRecebidaNum > quantidadeDisponivel) {
        newErrors.quantidadeRecebida = `Quantidade não pode ser maior que ${quantidadeDisponivel} (quantidade disponível)`;
      }
    }

    // Validar responsável
    if (!responsavel || responsavel.trim() === '') {
      newErrors.responsavel = 'Responsável é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Registrar o recebimento parcial
      await axios.post('http://192.168.100.129:8687/api/recebimentos-parciais', {
        ficha_id: ficha.id,
        quantidade_recebida: parseInt(quantidadeRecebida),
        observacoes: observacoes.trim(),
        responsavel: responsavel.trim()
      });

      toast({
        title: "Recebimento Registrado",
        description: `Recebimento de ${quantidadeRecebida} unidades registrado com sucesso na ficha ${ficha.codigo}`,
      });

      onRecebimentoRegistrado();
      onClose();
      
      // Limpar formulário
      setQuantidadeRecebida('');
      setObservacoes('');
      setResponsavel('');
      setErrors({});
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

  const handleClose = () => {
    setQuantidadeRecebida('');
    setObservacoes('');
    setResponsavel('');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Registrar Recebimento Parcial
          </DialogTitle>
        </DialogHeader>

        {ficha ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações da Ficha */}
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="font-medium text-sm mb-3 text-muted-foreground">Informações da Ficha</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Código:</span>
                  <p className="font-medium">{ficha.codigo}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Banca:</span>
                  <p className="font-medium">{ficha.banca}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Produto:</span>
                  <p className="font-medium">{ficha.produto}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cor/Tamanho:</span>
                  <p className="font-medium">{ficha.cor} - {ficha.tamanho}</p>
                </div>
              </div>
            </div>

            {/* Quantidades */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quantidade Total</Label>
                <Input
                  type="number"
                  value={quantidadeTotal}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Quantidade Recebida</Label>
                <Input
                  type="number"
                  value={quantidadeJaRecebida}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Quantidade Perdida</Label>
                <Input
                  type="number"
                  value={quantidadePerdida}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Quantidade Disponível</Label>
                <Input
                  type="number"
                  value={quantidadeDisponivel}
                  disabled
                  className="bg-blue-50 border-blue-200 text-blue-700 font-medium"
                />
              </div>
            </div>

            {/* Dados do Recebimento */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Dados do Recebimento</h3>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Quantidade Recebida Agora <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={quantidadeRecebida}
                  onChange={(e) => setQuantidadeRecebida(e.target.value)}
                  placeholder="Informe a quantidade recebida"
                  className={errors.quantidadeRecebida ? "border-red-500" : ""}
                />
                {errors.quantidadeRecebida && (
                  <p className="text-sm text-red-500">{errors.quantidadeRecebida}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Responsável <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Informe o responsável pelo recebimento"
                  className={errors.responsavel ? "border-red-500" : ""}
                />
                {errors.responsavel && (
                  <p className="text-sm text-red-500">{errors.responsavel}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Observações</Label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informe observações sobre o recebimento (opcional)"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-4 w-4" />
                    Registrar Recebimento
                  </>
                )}
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