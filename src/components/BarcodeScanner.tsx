
import { useState, useEffect, useRef } from "react";
import { Barcode, X } from "lucide-react";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Quando o modal é aberto, foca no input automaticamente
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Em um leitor real, quando o código é escaneado, 
    // geralmente é finalizado com um "Enter"
    if (e.key === "Enter" && code) {
      e.preventDefault();
      onScan(code);
      setCode("");
    }
  };

  // Simula um scan para fins de demonstração
  const handleDemoScan = () => {
    const demoCodes = ["7894900010015", "7891000315507", "7896004400046", "7891024134054"];
    const randomCode = demoCodes[Math.floor(Math.random() * demoCodes.length)];
    setCode(randomCode);
    
    // Simula o processamento do código
    setTimeout(() => {
      onScan(randomCode);
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Barcode className="w-5 h-5" />
            Leitor de Código de Barras
          </DialogTitle>
          <DialogDescription>
            Posicione o leitor sobre o código de barras ou digite manualmente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              autoFocus
              placeholder="Código de barras"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => setCode("")}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="border rounded-md p-6 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Barcode className="w-12 h-12 mx-auto text-primary animate-pulse" />
              <p className="text-muted-foreground">
                Aguardando leitura do código de barras...
              </p>
            </div>
          </div>
          
          <Button onClick={handleDemoScan}>
            Simular Leitura
          </Button>
          
          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Dica:</strong> Conecte um leitor USB de código de barras para 
              escanear automaticamente. O código será preenchido quando detectado.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
