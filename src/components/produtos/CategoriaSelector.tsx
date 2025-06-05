
import { useState } from "react";
import { Check, ChevronRight, FolderTree } from "lucide-react";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Categoria {
  id: string;
  nome: string;
  children?: Categoria[];
}

interface CategoriaSelectorProps {
  categorias: Categoria[];
  selectedCategoria?: { grupo?: string; subgrupo?: string; subSubgrupo?: string };
  onCategoriaSelect: (categorias: { grupo?: string; subgrupo?: string; subSubgrupo?: string }) => void;
}

export function CategoriaSelector({ 
  categorias, 
  selectedCategoria = {}, 
  onCategoriaSelect 
}: CategoriaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrupo, setSelectedGrupo] = useState<Categoria | null>(
    categorias.find(cat => cat.nome === selectedCategoria.grupo) || null
  );
  const [selectedSubgrupo, setSelectedSubgrupo] = useState<Categoria | null>(
    selectedGrupo?.children?.find(cat => cat.nome === selectedCategoria.subgrupo) || null
  );
  const [selectedSubSubgrupo, setSelectedSubSubgrupo] = useState<Categoria | null>(
    selectedSubgrupo?.children?.find(cat => cat.nome === selectedCategoria.subSubgrupo) || null
  );
  
  const [activeStep, setActiveStep] = useState<"grupo" | "subgrupo" | "subsubgrupo">("grupo");
  
  const filteredCategorias = searchTerm 
    ? categorias.filter(cat => 
        cat.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.children?.some(sub => 
          sub.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.children?.some(subsub => 
            subsub.nome.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      )
    : categorias;

  const handleSelectGrupo = (categoria: Categoria) => {
    setSelectedGrupo(categoria);
    setSelectedSubgrupo(null);
    setSelectedSubSubgrupo(null);
    
    if (categoria.children?.length) {
      setActiveStep("subgrupo");
    } else {
      onCategoriaSelect({ grupo: categoria.nome });
      setOpen(false);
    }
  };

  const handleSelectSubgrupo = (categoria: Categoria) => {
    setSelectedSubgrupo(categoria);
    setSelectedSubSubgrupo(null);
    
    if (categoria.children?.length) {
      setActiveStep("subsubgrupo");
    } else {
      onCategoriaSelect({ 
        grupo: selectedGrupo?.nome, 
        subgrupo: categoria.nome 
      });
      setOpen(false);
    }
  };

  const handleSelectSubSubgrupo = (categoria: Categoria) => {
    setSelectedSubSubgrupo(categoria);
    onCategoriaSelect({ 
      grupo: selectedGrupo?.nome, 
      subgrupo: selectedSubgrupo?.nome,
      subSubgrupo: categoria.nome
    });
    setOpen(false);
  };

  const getDisplayText = () => {
    const parts = [];
    if (selectedGrupo) parts.push(selectedGrupo.nome);
    if (selectedSubgrupo) parts.push(selectedSubgrupo.nome);
    if (selectedSubSubgrupo) parts.push(selectedSubSubgrupo.nome);
    
    return parts.length ? parts.join(" > ") : "Selecionar categoria";
  };
  
  const backToGrupo = () => {
    setActiveStep("grupo");
  };
  
  const backToSubgrupo = () => {
    setActiveStep("subgrupo");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between text-left font-normal" 
        >
          <div className="flex items-center">
            <FolderTree className="mr-2 h-4 w-4" />
            <span className="truncate">{getDisplayText()}</span>
          </div>
          <ChevronRight className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" side="bottom">
        <div className="p-2 border-b">
          <Input 
            placeholder="Buscar categorias..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>
        
        <div className="p-0 max-h-[300px] overflow-auto">
          {activeStep === "grupo" && (
            <div className="grid grid-cols-1 gap-1 p-2">
              {filteredCategorias.map((categoria) => (
                <Button
                  key={categoria.id}
                  variant="ghost"
                  className={cn(
                    "justify-start h-auto py-2 px-2 w-full",
                    selectedGrupo?.id === categoria.id && "bg-accent"
                  )}
                  onClick={() => handleSelectGrupo(categoria)}
                >
                  <div className="flex items-center w-full">
                    <span className="truncate">{categoria.nome}</span>
                    {categoria.children?.length ? (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    ) : (
                      selectedGrupo?.id === categoria.id && <Check className="ml-auto h-4 w-4" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
          
          {activeStep === "subgrupo" && selectedGrupo?.children && (
            <div className="grid grid-cols-1 gap-1 p-2">
              <Button
                variant="link"
                className="justify-start h-auto py-1 px-1 w-full"
                onClick={backToGrupo}
              >
                <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
                <span>Voltar</span>
              </Button>
              
              <div className="text-sm font-medium px-2 py-1 text-muted-foreground">
                {selectedGrupo.nome}
              </div>
              
              {selectedGrupo.children.map((subgrupo) => (
                <Button
                  key={subgrupo.id}
                  variant="ghost"
                  className={cn(
                    "justify-start h-auto py-2 px-2 w-full",
                    selectedSubgrupo?.id === subgrupo.id && "bg-accent"
                  )}
                  onClick={() => handleSelectSubgrupo(subgrupo)}
                >
                  <div className="flex items-center w-full">
                    <span className="truncate">{subgrupo.nome}</span>
                    {subgrupo.children?.length ? (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    ) : (
                      selectedSubgrupo?.id === subgrupo.id && <Check className="ml-auto h-4 w-4" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
          
          {activeStep === "subsubgrupo" && selectedSubgrupo?.children && (
            <div className="grid grid-cols-1 gap-1 p-2">
              <Button
                variant="link"
                className="justify-start h-auto py-1 px-1 w-full"
                onClick={backToSubgrupo}
              >
                <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
                <span>Voltar</span>
              </Button>
              
              <div className="text-sm font-medium px-2 py-1 text-muted-foreground">
                {selectedGrupo?.nome} &gt; {selectedSubgrupo.nome}
              </div>
              
              {selectedSubgrupo.children.map((subSubgrupo) => (
                <Button
                  key={subSubgrupo.id}
                  variant="ghost"
                  className={cn(
                    "justify-start h-auto py-2 px-2 w-full",
                    selectedSubSubgrupo?.id === subSubgrupo.id && "bg-accent"
                  )}
                  onClick={() => handleSelectSubSubgrupo(subSubgrupo)}
                >
                  <div className="flex items-center w-full">
                    <span className="truncate">{subSubgrupo.nome}</span>
                    {selectedSubSubgrupo?.id === subSubgrupo.id && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
