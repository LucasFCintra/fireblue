import { toast } from '@/components/ui/sonner';

// Funções originais do toast
let originalSuccess: any;
let originalError: any;
let originalWarning: any;
let originalInfo: any;

// Configurações atuais
let currentSettings = {
  enabled: true,
  showSuccess: true,
  showError: true,
  showWarning: true,
  showInfo: true,
  duration: 5
};

// Função para verificar se um tipo de notificação está habilitado
function isNotificationEnabled(type: 'success' | 'error' | 'warning' | 'info'): boolean {
  if (!currentSettings.enabled) return false;
  
  switch (type) {
    case 'success':
      return currentSettings.showSuccess;
    case 'error':
      return currentSettings.showError;
    case 'warning':
      return currentSettings.showWarning;
    case 'info':
      return currentSettings.showInfo;
    default:
      return false;
  }
}

// Função para interceptar os toasts
export function interceptToasts(settings: any) {
  currentSettings = settings;
  
  // Salvar funções originais apenas uma vez
  if (!originalSuccess) {
    originalSuccess = toast.success;
    originalError = toast.error;
    originalWarning = toast.warning;
    originalInfo = toast.info;
  }

  // Sobrescrever toast.success
  toast.success = (message: string, options?: any) => {
    if (!isNotificationEnabled('success')) return;
    
    const duration = options?.duration || currentSettings.duration * 1000;
    return originalSuccess(message, { ...options, duration });
  };

  // Sobrescrever toast.error
  toast.error = (message: string, options?: any) => {
    if (!isNotificationEnabled('error')) return;
    
    const duration = options?.duration || currentSettings.duration * 1000;
    return originalError(message, { ...options, duration });
  };

  // Sobrescrever toast.warning
  toast.warning = (message: string, options?: any) => {
    if (!isNotificationEnabled('warning')) return;
    
    const duration = options?.duration || currentSettings.duration * 1000;
    return originalWarning(message, { ...options, duration });
  };

  // Sobrescrever toast.info
  toast.info = (message: string, options?: any) => {
    if (!isNotificationEnabled('info')) return;
    
    const duration = options?.duration || currentSettings.duration * 1000;
    return originalInfo(message, { ...options, duration });
  };
}

// Função para restaurar as funções originais
export function restoreToasts() {
  if (originalSuccess) {
    toast.success = originalSuccess;
    toast.error = originalError;
    toast.warning = originalWarning;
    toast.info = originalInfo;
  }
} 