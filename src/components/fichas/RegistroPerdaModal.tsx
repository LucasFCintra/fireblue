import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from 'axios';
import { fichasService, Ficha } from '@/services/fichasService';

interface RegistroPerdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ficha: Ficha | null;
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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  // Resetar formulário quando o modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setQuantidadePerdida('');
      setObservacoes('');
      setResponsavel('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Verificar se a ficha existe
    if (!ficha) {
      newErrors.geral = 'Nenhuma ficha selecionada';
      setErrors(newErrors);
      return false;
    }

    // Validar quantidade perdida
    if (!quantidadePerdida || quantidadePerdida.trim() === '') {
      newErrors.quantidadePerdida = 'Quantidade perdida é obrigatória';
    } else {
      const quantidadePerdidaNum = parseInt(quantidadePerdida);
      if (isNaN(quantidadePerdidaNum) || quantidadePerdidaNum <= 0) {
        newErrors.quantidadePerdida = 'Quantidade deve ser um número maior que zero';
      } else {
        const quantidadeDisponivel = ficha.quantidade - (ficha.quantidade_recebida || 0) - (ficha.quantidade_perdida || 0);
        if (quantidadePerdidaNum > quantidadeDisponivel) {
          newErrors.quantidadePerdida = `Quantidade não pode ser maior que ${quantidadeDisponivel} (quantidade disponível)`;
        }
      }
    }

    // Validar responsável
    if (!responsavel || responsavel.trim() === '') {
      newErrors.responsavel = 'Responsável é obrigatório';
    } else if (responsavel.trim().length < 2) {
      newErrors.responsavel = 'Responsável deve ter pelo menos 2 caracteres';
    }

    // Validar observações
    if (!observacoes || observacoes.trim() === '') {
      newErrors.observacoes = 'Observações são obrigatórias';
    } else if (observacoes.trim().length < 10) {
      newErrors.observacoes = 'Observações devem ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os campos destacados",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const quantidadePerdidaNum = parseInt(quantidadePerdida);
      
      if (!ficha) {
        throw new Error('Ficha não encontrada');
      }
      
      // Registrar a perda como uma movimentação do tipo "Perda"
      await axios.post(`http://26.203.75.236:8687/api/fichas/${ficha.id}/movimentacao`, {
        tipo: 'Perda',
        quantidade: quantidadePerdidaNum,
        descricao: observacoes.trim(),
        responsavel: responsavel.trim(),
        data: new Date().toISOString()
      });

      toast({
        title: "Perda Registrada",
        description: `Perda de ${quantidadePerdidaNum} unidades registrada com sucesso na ficha ${ficha.codigo}`,
      });

      onPerdaRegistrada();
      onClose();
    } catch (error) {
      console.error('Erro ao registrar perda:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar perda. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Calcular quantidades
  const quantidadeTotal = ficha?.quantidade || 0;
  const quantidadeJaPerdida = ficha?.quantidade_perdida || 0;
  const quantidadeRecebida = ficha?.quantidade_recebida || 0;
  const quantidadeDisponivel = quantidadeTotal - quantidadeRecebida - quantidadeJaPerdida;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Registrar Perda
          </DialogTitle>
          <DialogDescription>
            Registre uma perda na ficha de produção. Todos os campos são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        {ficha ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Informações da Ficha */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Informações da Ficha</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Código:</span>
                  <span className="ml-2 font-medium">{ficha.codigo}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Banca:</span>
                  <span className="ml-2 font-medium">{ficha.banca}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Produto:</span>
                  <span className="ml-2 font-medium">{ficha.produto}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 font-medium">{ficha.status}</span>
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
                  value={quantidadeRecebida}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Já Perdida</Label>
                <Input
                  type="number"
                  value={quantidadeJaPerdida}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Disponível para Perda</Label>
                <Input
                  type="number"
                  value={quantidadeDisponivel}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Quantidade Perdida Agora - OBRIGATÓRIO */}
            <div className="space-y-2">
              <Label htmlFor="quantidadePerdida" className="text-sm font-medium">
                Quantidade Perdida Agora <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantidadePerdida"
                type="number"
                value={quantidadePerdida}
                onChange={(e) => setQuantidadePerdida(e.target.value)}
                placeholder="Informe a quantidade perdida"
                className={errors.quantidadePerdida ? "border-red-500" : ""}
                min="1"
                max={quantidadeDisponivel}
              />
              {errors.quantidadePerdida && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.quantidadePerdida}
                </p>
              )}
            </div>

            {/* Responsável - OBRIGATÓRIO */}
            <div className="space-y-2">
              <Label htmlFor="responsavel" className="text-sm font-medium">
                Responsável <span className="text-red-500">*</span>
              </Label>
              <Input
                id="responsavel"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Informe o responsável pelo registro"
                className={errors.responsavel ? "border-red-500" : ""}
              />
              {errors.responsavel && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.responsavel}
                </p>
              )}
            </div>

            {/* Observações - OBRIGATÓRIO */}
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-sm font-medium">
                Observações <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informe o motivo da perda e outras observações (mínimo 10 caracteres)"
                className={errors.observacoes ? "border-red-500" : ""}
                rows={3}
              />
              {errors.observacoes && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.observacoes}
                </p>
              )}
            </div>

            {/* Alerta informativo */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                A perda será registrada no histórico de movimentações e a quantidade perdida será atualizada na ficha.
              </AlertDescription>
            </Alert>

            <DialogFooter>
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
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Registrando..." : "Registrar Perda"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="p-4 text-center">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Nenhuma ficha selecionada para registrar perda.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 