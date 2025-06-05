import React, { useEffect, useState } from 'react';
import { Calendar, Download, FileText, PlusCircle, Printer, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { ActionButton } from "@/components/ActionButton";
import { useFechamentoSemanal } from '@/hooks/use-fechamento-semanal';
import { RelatorioFechamento } from '@/components/fechamento/RelatorioFechamento';
import { DetalheFechamentoBanca } from '@/components/fechamento/DetalheFechamentoBanca';
import { FechamentoBanca } from '@/types/fechamento';
import { useToast } from '@/hooks/use-toast';
import { getCurrentWeekRange } from '@/utils/dateUtils';
import { DateRange } from "react-day-picker";

export default function FechamentoSemanal() {
  const { relatorio, isLoading, gerarFechamento, salvarFechamento, finalizarFechamento } = useFechamentoSemanal();
  const [selectedFechamento, setSelectedFechamento] = useState<FechamentoBanca | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: getCurrentWeekRange().start,
    to: getCurrentWeekRange().end
  });
  const { toast } = useToast();

  // Gera o fechamento inicial ao carregar a página
  useEffect(() => {
    handleGerarFechamento();
  }, []);

  // Manipulador para gerar um novo fechamento
  const handleGerarFechamento = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Período incompleto",
        description: "Selecione um período completo para gerar o fechamento.",
        variant: "destructive",
      });
      return;
    }

    await gerarFechamento(dateRange.from, dateRange.to);
  };

  // Manipulador para ver detalhes do fechamento de uma banca
  const handleVerDetalhesBanca = (fechamento: FechamentoBanca) => {
    setSelectedFechamento(fechamento);
    setIsDetailOpen(true);
  };

  // Manipulador para fechar o modal de detalhes
  const handleCloseDetails = () => {
    setIsDetailOpen(false);
    setSelectedFechamento(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold">Fechamento Semanal</h1>
        <div className="flex flex-wrap gap-2">
          <ActionButton 
            startIcon={<RefreshCw />} 
            onClick={handleGerarFechamento}
            isLoading={isLoading}
          >
            Gerar Fechamento
          </ActionButton>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle>Período de Fechamento</CardTitle>
              <CardDescription>
                Selecione o período para gerar o fechamento
              </CardDescription>
            </div>
            <DateRangePicker
              date={dateRange}
              onChange={setDateRange}
            />
          </div>
        </CardHeader>
      </Card>

      {relatorio ? (
        <RelatorioFechamento 
          relatorio={relatorio}
          onSalvar={salvarFechamento}
          onFinalizar={finalizarFechamento}
          onVerDetalhesBanca={handleVerDetalhesBanca}
          isLoading={isLoading}
        />
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Calendar className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium">Nenhum fechamento gerado</h3>
            <p className="text-sm text-gray-500">
              Selecione um período e clique em "Gerar Fechamento" para criar um novo relatório.
            </p>
            <Button 
              onClick={handleGerarFechamento}
              disabled={isLoading}
            >
              Gerar Fechamento Agora
            </Button>
          </div>
        </Card>
      )}

      {/* Modal de detalhes */}
      <DetalheFechamentoBanca 
        fechamento={selectedFechamento}
        isOpen={isDetailOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
} 