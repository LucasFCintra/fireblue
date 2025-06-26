# Sistema de Notificações - SGE FireBlue

## Visão Geral
O sistema de notificações permite aos usuários controlar quais tipos de notificações (toasts) desejam receber em diferentes partes da aplicação. O controle é feito através do ícone de sino na navbar.

## Funcionalidades

### 🎛️ Controle de Notificações
- **Ativar/Desativar**: Toggle geral para todas as notificações
- **Tipos específicos**: Controle individual para sucessos, erros, avisos e informações
- **Duração**: Ajuste do tempo de exibição (2-10 segundos)
- **Som**: Opção para ativar/desativar sons de notificação
- **Persistência**: Configurações salvas no localStorage
- **Interceptação Global**: Todos os toasts da aplicação respeitam as configurações

### 🎨 Interface Visual
- **Ícone dinâmico**: Sino (ativado) ou Sino riscado (desativado)
- **Indicador visual**: Ponto vermelho quando notificações estão desativadas
- **Popover responsivo**: Configurações em um painel elegante
- **Estilização dark mode**: Totalmente compatível com o tema escuro

## Como Usar

### 1. Acessar Configurações
Clique no ícone de sino na navbar para abrir o painel de configurações.

### 2. Configurar Notificações
- **Toggle Principal**: Ativa/desativa todas as notificações
- **Tipos de Notificação**: 
  - ✅ Sucessos (verde)
  - ❌ Erros (vermelho)
  - ⚠️ Avisos (amarelo)
  - ℹ️ Informações (azul)
- **Duração**: Slider para ajustar tempo de exibição
- **Som**: Toggle para ativar/desativar sons

### 3. Restaurar Padrão
Botão para voltar às configurações padrão do sistema.

## Implementação Técnica

### Contexto de Notificações
```typescript
// src/contexts/NotificationContext.tsx
interface NotificationSettings {
  enabled: boolean;
  showSuccess: boolean;
  showError: boolean;
  showWarning: boolean;
  showInfo: boolean;
  soundEnabled: boolean;
  duration: number;
}
```

### Interceptor Global de Toasts
```typescript
// src/utils/toastInterceptor.ts
export function interceptToasts(settings: any) {
  // Intercepta e sobrescreve todas as funções do toast
  // para respeitar as configurações do usuário
}
```

### Hook Personalizado
```typescript
// src/hooks/useNotificationToast.ts
import { useNotificationToast } from '@/hooks/useNotificationToast';

const { showSuccess, showError, showWarning, showInfo } = useNotificationToast();

// Uso
showSuccess("Operação realizada com sucesso!");
showError("Erro ao processar dados");
showWarning("Atenção: dados incompletos");
showInfo("Processamento em andamento...");
```

### Componente de Configuração
```typescript
// src/components/NotificationSettings.tsx
<NotificationSettings 
  isOpen={notificationSettingsOpen}
  onClose={() => setNotificationSettingsOpen(false)}
/>
```

### Wrapper Global
```typescript
// src/components/NotificationWrapper.tsx
<NotificationWrapper>
  {/* Toda a aplicação */}
</NotificationWrapper>
```

## Migração de Código Existente

### Antes (Toast Direto)
```typescript
import { toast } from '@/components/ui/sonner';

toast.success("Sucesso!");
toast.error("Erro!");
toast.warning("Aviso!");
toast.info("Info!");
```

### Depois (Hook de Notificação)
```typescript
import { useNotificationToast } from '@/hooks/useNotificationToast';

const { showSuccess, showError, showWarning, showInfo } = useNotificationToast();

showSuccess("Sucesso!");
showError("Erro!");
showWarning("Aviso!");
showInfo("Info!");
```

### ⚡ Interceptação Automática
**IMPORTANTE**: Com o novo sistema, mesmo os toasts diretos (`toast.success()`, `toast.error()`, etc.) são automaticamente interceptados e respeitam as configurações do usuário. Não é necessário migrar todo o código existente!

## Vantagens do Novo Sistema

### 🎯 Controle Granular
- Usuários podem escolher exatamente quais notificações querem ver
- Reduz poluição visual desnecessária
- Melhora a experiência do usuário

### 🔧 Flexibilidade
- Configurações persistentes
- Fácil de estender com novos tipos
- Integração transparente com o sistema existente
- **Interceptação automática** de todos os toasts

### 🎨 Consistência Visual
- Design unificado com o resto da aplicação
- Suporte completo ao modo escuro
- Animações suaves e responsivas

### 💾 Persistência
- Configurações salvas automaticamente
- Restauradas ao recarregar a página
- Backup local no navegador

### ⚡ Compatibilidade
- **Funciona com código existente** sem necessidade de migração
- Interceptação automática de todos os toasts
- Fallback para configurações padrão

## Estrutura de Arquivos

```
src/
├── contexts/
│   └── NotificationContext.tsx    # Contexto principal
├── hooks/
│   └── useNotificationToast.ts    # Hook personalizado
├── components/
│   ├── Header.tsx                 # Navbar com ícone
│   ├── NotificationSettings.tsx   # Painel de configurações
│   └── NotificationWrapper.tsx    # Wrapper global
├── utils/
│   └── toastInterceptor.ts        # Interceptor de toasts
└── App.tsx                        # Provider na raiz
```

## Configurações Padrão

```typescript
const defaultSettings = {
  enabled: true,           // Notificações ativadas
  showSuccess: true,       // Mostrar sucessos
  showError: true,         // Mostrar erros
  showWarning: true,       // Mostrar avisos
  showInfo: true,          // Mostrar informações
  soundEnabled: false,     // Som desativado
  duration: 5              // 5 segundos
};
```

## Exemplos de Uso

### Página de Fechamento Semanal
```typescript
const handleGerarFechamento = async () => {
  if (!dateRange.from || !dateRange.to) {
    showWarning("Selecione um período completo para gerar o fechamento.", {
      description: "Período incompleto"
    });
    return;
  }
  
  try {
    await gerarFechamento(dateRange.from, dateRange.to);
    showSuccess("Fechamento gerado com sucesso!");
  } catch (error) {
    showError("Erro ao gerar fechamento");
  }
};
```

### Página de Produtos
```typescript
const handleSalvarProduto = async () => {
  try {
    await salvarProduto(dados);
    showSuccess("Produto salvo com sucesso!");
  } catch (error) {
    showError("Erro ao salvar produto");
  }
};
```

### Código Existente (Funciona Automaticamente)
```typescript
// Este código continua funcionando e respeita as configurações
toast.success("Operação realizada com sucesso!");
toast.error("Erro ao processar dados");
toast.warning("Atenção: dados incompletos");
toast.info("Processamento em andamento...");
```

## Teste do Sistema

### Botões de Teste no Dashboard
O Dashboard inclui botões de teste para verificar se o sistema está funcionando:

1. **Botões do Hook**: Usam `showSuccess()`, `showError()`, etc.
2. **Botões Diretos**: Usam `toast.success()`, `toast.error()`, etc.

Ambos os tipos respeitam as configurações do usuário.

## Próximos Passos

### 🚀 Melhorias Futuras
- [ ] Notificações push para eventos importantes
- [ ] Configurações por tipo de usuário
- [ ] Histórico de notificações
- [ ] Notificações em tempo real via WebSocket
- [ ] Configurações sincronizadas entre dispositivos

### 🔧 Manutenção
- [ ] Testes unitários para o contexto
- [ ] Testes de integração para o hook
- [ ] Documentação de API
- [ ] Guia de migração para desenvolvedores

## Troubleshooting

### Problema: Notificações não aparecem
**Solução**: Verificar se as notificações estão ativadas no painel de configurações

### Problema: Configurações não são salvas
**Solução**: Verificar se o localStorage está disponível e não está bloqueado

### Problema: Hook não funciona
**Solução**: Verificar se o NotificationProvider está envolvendo a aplicação

### Problema: Toasts diretos não respeitam configurações
**Solução**: Verificar se o NotificationWrapper está presente no App.tsx

## Contribuição

Para adicionar novos tipos de notificação:

1. Atualizar a interface `NotificationSettings`
2. Adicionar o novo tipo no contexto
3. Criar a função correspondente no hook
4. Atualizar o componente de configurações
5. Atualizar o interceptor global
6. Documentar o novo tipo

## Suporte

Para dúvidas ou problemas com o sistema de notificações, consulte:
- Documentação do contexto: `src/contexts/NotificationContext.tsx`
- Interceptor global: `src/utils/toastInterceptor.ts`
- Exemplos de uso: `src/pages/FechamentoSemanal.tsx`
- Hook personalizado: `src/hooks/useNotificationToast.ts` 