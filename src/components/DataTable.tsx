import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
  Loader2,
  Filter,
  ChevronDown,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<T> {
  data: T[];
  columns: {
    accessor: keyof T | ((row: T) => React.ReactNode);
    header: string;
    cell?: (row: T) => React.ReactNode;
    filterable?: boolean;
  }[];
  actions?: {
    label: string;
    onClick: (row: T) => void;
  }[];
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  pagination?: boolean;
  isLoading?: boolean;
  onFilterChange?: (filteredData: T[]) => void;
}

export default function DataTable<T>({
  data,
  columns,
  actions,
  onRowClick,
  searchable = true,
  pagination = true,
  isLoading = false,
  onFilterChange,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [isColumnFilterOpen, setIsColumnFilterOpen] = useState<Record<string, boolean>>({});

  // Extrair valores únicos para cada coluna para os filtros
  const uniqueColumnValues = useMemo(() => {
    const result: Record<string, Set<string>> = {};
    
    columns.forEach(column => {
      if (typeof column.accessor === 'string' || column.accessor instanceof String) {
        const accessor = column.accessor as keyof T;
        const values = new Set<string>();
        
        data.forEach(row => {
          const value = row[accessor];
          if (value !== undefined && value !== null) {
            values.add(String(value));
          }
        });
        
        result[accessor as string] = values;
      }
    });
    
    return result;
  }, [data, columns]);

  // Função para alternar um valor no filtro de coluna
  const toggleColumnFilterValue = (column: string, value: string) => {
    setColumnFilters(prev => {
      const currentValues = prev[column] || [];
      const valueExists = currentValues.includes(value);
      
      let newValues: string[];
      if (valueExists) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
      
      return {
        ...prev,
        [column]: newValues.length > 0 ? newValues : []
      };
    });
  };

  // Função para limpar todos os filtros de uma coluna
  const clearColumnFilter = (column: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  };

  // Calcular o número de filtros ativos
  const activeFiltersCount = Object.values(columnFilters).reduce(
    (count, filters) => count + (filters.length > 0 ? 1 : 0), 
    0
  );

  // Aplicar filtros de pesquisa e de coluna
  const filteredData = useMemo(() => {
    let filtered = data;
    
    // Aplicar filtro de pesquisa global
    if (searchable && searchQuery) {
      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
      
      filtered = filtered.filter((item) => {
        // Verifica se todos os termos de busca estão presentes em pelo menos um campo
        return searchTerms.every(term => {
          return Object.entries(item as Record<string, any>).some(([key, value]) => {
            // Ignora campos que não são úteis para busca como IDs, funções, etc.
            if (!value || typeof value === 'function' || key === 'id' || typeof value === 'object') {
              return false;
            }
            
            // Converte para string de forma segura e verifica se inclui o termo
            const valueStr = String(value).toLowerCase();
            return valueStr.includes(term);
          });
        });
      });
    }
    
    // Aplicar filtros de coluna
    if (Object.keys(columnFilters).length > 0) {
      filtered = filtered.filter(item => {
        return Object.entries(columnFilters).every(([column, allowedValues]) => {
          if (allowedValues.length === 0) return true;
          
          const value = (item as Record<string, any>)[column];
          if (value === undefined || value === null) return false;
          
          return allowedValues.includes(String(value));
        });
      });
    }
    
    return filtered;
  }, [data, searchable, searchQuery, columnFilters]);

  // Notificar o componente pai quando os dados filtrados mudarem
  useEffect(() => {
    if (onFilterChange) {
      // Se não houver busca ou filtros, envia todos os dados
      if ((!searchQuery || searchQuery.trim() === '') && Object.keys(columnFilters).length === 0) {
        onFilterChange(data);
      } else {
        onFilterChange(filteredData);
      }
    }
  }, [filteredData, onFilterChange, data, searchQuery, columnFilters]);

  // Paginate data
  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  const totalPages = pagination ? Math.ceil(filteredData.length / pageSize) : 1;

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
              
              // Se o campo de busca foi limpo, resetar os filtros
              if (!e.target.value.trim()) {
                if (onFilterChange) {
                  onFilterChange(data);
                }
              }
            }}
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => {
                const accessor = typeof column.accessor === 'function' 
                  ? `column-${index}` 
                  : column.accessor as string;
                
                const hasFilter = columnFilters[accessor]?.length > 0;
                
                return (
                  <TableHead key={index} className="relative">
                    <div className="flex items-center gap-2">
                      {column.header}
                      
                      {column.filterable !== false && typeof column.accessor !== 'function' && (
                        <Popover 
                          open={isColumnFilterOpen[accessor]} 
                          onOpenChange={(open) => {
                            setIsColumnFilterOpen(prev => ({ ...prev, [accessor]: open }));
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`p-0 h-7 w-7 rounded-full ${hasFilter ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                            >
                              <Filter className="h-3.5 w-3.5" />
                              <span className="sr-only">Filtrar {column.header}</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-60 p-0" align="start">
                            <Command>
                              <CommandInput placeholder={`Buscar em ${column.header}`} />
                              <CommandList>
                                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                                <CommandGroup>
                                  {Array.from(uniqueColumnValues[accessor] || []).map((value, valueIndex) => (
                                    <CommandItem 
                                      key={valueIndex} 
                                      onSelect={() => toggleColumnFilterValue(accessor, value)}
                                      className="flex items-center gap-2"
                                      aria-selected={columnFilters[accessor]?.includes(value)}
                                    >
                                      <div className="flex items-center gap-2 w-full">
                                        <div className="flex-shrink-0">
                                          <Checkbox 
                                            checked={columnFilters[accessor]?.includes(value)} 
                                            className="pointer-events-none"
                                          />
                                        </div>
                                        <span>{value}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                              <div className="border-t p-2 flex justify-between">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => clearColumnFilter(accessor)}
                                  disabled={!hasFilter}
                                >
                                  Limpar
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => setIsColumnFilterOpen(prev => ({ ...prev, [accessor]: false }))}
                                >
                                  Fechar
                                </Button>
                              </div>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </TableHead>
                );
              })}
              {actions && <TableHead className="w-[80px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell
                        ? column.cell(row)
                        : typeof column.accessor === "function"
                        ? column.accessor(row)
                        : (row[column.accessor] as React.ReactNode)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {filteredData.length !== data.length ? (
              <span>Exibindo {filteredData.length} de {data.length} registros</span>
            ) : (
              <span>Total de {data.length} registros</span>
            )}
          </p>
          {Object.keys(columnFilters).length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => setColumnFilters({})}
            >
              <X className="h-3.5 w-3.5" />
              Limpar filtros
            </Button>
          )}
        </div>
        
        {pagination && totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">Primeira página</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Página anterior</span>
            </Button>

            <span className="text-sm font-medium">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Próxima página</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Última página</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
