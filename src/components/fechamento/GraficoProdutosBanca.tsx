import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FechamentoBanca } from '@/types/fechamento';

interface GraficoProdutosBancaProps {
  fechamento: FechamentoBanca;
}

// Cores para o gráfico de pizza
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300', '#a4de6c'];

export const GraficoProdutosBanca: React.FC<GraficoProdutosBancaProps> = ({ fechamento }) => {
  // Processa os dados para o gráfico
  const dadosGrafico = useMemo(() => {
    // Agrupa as fichas por descrição de produto
    const produtosMap = new Map<string, { quantidade: number; valor: number }>();
    
    fechamento.fichasEntregues.forEach(ficha => {
      const chave = ficha.descricao.split('-')[0].trim(); // Usa a primeira parte da descrição como chave
      
      if (produtosMap.has(chave)) {
        const produto = produtosMap.get(chave)!;
        produto.quantidade += ficha.quantidade;
        produto.valor += ficha.valorTotal;
      } else {
        produtosMap.set(chave, {
          quantidade: ficha.quantidade,
          valor: ficha.valorTotal
        });
      }
    });
    
    // Converte o Map para um array de objetos
    return Array.from(produtosMap.entries()).map(([nome, dados]) => ({
      nome: nome.length > 15 ? nome.substring(0, 15) + '...' : nome, 
      quantidade: dados.quantidade,
      valor: dados.valor
    })).sort((a, b) => b.quantidade - a.quantidade);
  }, [fechamento]);

  // Formatter para valores monetários no tooltip
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Renderiza um gráfico vazio se não houver dados
  if (dadosGrafico.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sem dados para exibir</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Não há dados de produtos para mostrar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Card className="border border-border dark:shadow-lg dark:shadow-black/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base text-foreground">Quantidade por Produto</CardTitle>
          </CardHeader>
          <CardContent className="h-80 sm:h-96 lg:h-[450px] p-2 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosGrafico}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="nome" type="category" width={80} stroke="#64748b" fontSize={11} />
                <Tooltip 
                  formatter={(value) => [`${value} unidades`, 'Quantidade']}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Bar dataKey="quantidade" name="Quantidade" fill="#0f172a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border dark:shadow-lg dark:shadow-black/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base text-foreground">Distribuição de Valor</CardTitle>
          </CardHeader>
          <CardContent className="h-80 sm:h-96 lg:h-[450px] p-2 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosGrafico}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ nome, percent }) => `${nome} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                  nameKey="nome"
                >
                  {dadosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatarMoeda(value as number), 'Valor']}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Espaçamento adicional para garantir scroll */}
      <div className="h-8"></div>
    </div>
  );
}; 