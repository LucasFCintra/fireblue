import React from 'react';
import { Bell, BellOff, Volume2, VolumeX, CheckCircle, XCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const { settings, updateSettings, toggleNotifications } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 bg-background border border-border rounded-lg shadow-lg dark:shadow-xl dark:shadow-black/30 z-50 animate-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            {settings.enabled ? (
              <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <BellOff className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            Notificações
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleNotifications}
            className={`px-3 py-1 text-sm ${
              settings.enabled 
                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900/70' 
                : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900/70'
            }`}
          >
            {settings.enabled ? 'Ativadas' : 'Desativadas'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Configure suas preferências de notificação
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Tipos de Notificação */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Tipos de Notificação</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <Label htmlFor="success-notifications" className="text-sm text-foreground">
                  Sucessos
                </Label>
              </div>
              <Switch
                id="success-notifications"
                checked={settings.showSuccess}
                onCheckedChange={(checked) => updateSettings({ showSuccess: checked })}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <Label htmlFor="error-notifications" className="text-sm text-foreground">
                  Erros
                </Label>
              </div>
              <Switch
                id="error-notifications"
                checked={settings.showError}
                onCheckedChange={(checked) => updateSettings({ showError: checked })}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <Label htmlFor="warning-notifications" className="text-sm text-foreground">
                  Avisos
                </Label>
              </div>
              <Switch
                id="warning-notifications"
                checked={settings.showWarning}
                onCheckedChange={(checked) => updateSettings({ showWarning: checked })}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Label htmlFor="info-notifications" className="text-sm text-foreground">
                  Informações
                </Label>
              </div>
              <Switch
                id="info-notifications"
                checked={settings.showInfo}
                onCheckedChange={(checked) => updateSettings({ showInfo: checked })}
                disabled={!settings.enabled}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Configurações Avançadas */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Configurações Avançadas</h4>
          
          {/* Som */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="sound-notifications" className="text-sm text-foreground">
                Som
              </Label>
            </div>
            <Switch
              id="sound-notifications"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              disabled={!settings.enabled}
            />
          </div>

          {/* Duração */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm text-foreground">
                  Duração: {settings.duration}s
                </Label>
              </div>
            </div>
            <Slider
              value={[settings.duration]}
              onValueChange={(value) => updateSettings({ duration: value[0] })}
              max={10}
              min={2}
              step={1}
              disabled={!settings.enabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2s</span>
              <span>10s</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateSettings({
              enabled: true,
              showSuccess: true,
              showError: true,
              showWarning: true,
              showInfo: true,
              soundEnabled: false,
              duration: 5
            })}
            className="flex-1 border-border hover:bg-accent hover:text-accent-foreground"
          >
            Restaurar Padrão
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 border-border hover:bg-accent hover:text-accent-foreground"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
} 