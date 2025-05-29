import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import MateriaPrima from "./pages/MateriaPrima";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import Compras from "./pages/Compras";
import Clientes from "./pages/Clientes";
import Fornecedores from "./pages/Fornecedores";
import Terceiros from "./pages/Terceiros";
import Relatorios from "./pages/Relatorios";
import Ordens from "./pages/Ordens";
import Configuracoes from "./pages/Configuracoes";
import FechamentoSemanal from "./pages/FechamentoSemanal";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RedefinirSenha from "./pages/RedefinirSenha";
import SocketTest from "./pages/SocketTest";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Componente para proteger rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar nada enquanto carrega o estado de autenticação
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  // Redireciona para login se não estiver autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/cadastro" element={<Cadastro />} />
    <Route path="/redefinir-senha" element={<RedefinirSenha />} />
    <Route path="/socket-test" element={<SocketTest />} />
    
    <Route path="/" element={
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    }>
      <Route index element={<Dashboard />} />
      <Route path="inventario" element={<Inventario />} />
      <Route path="materia-prima" element={<MateriaPrima />} />
      <Route path="produtos" element={<Produtos />} />
      <Route path="vendas" element={<Vendas />} />
      <Route path="compras" element={<Compras />} />
      <Route path="clientes" element={<Clientes />} />
      <Route path="fornecedores" element={<Fornecedores />} />
      <Route path="terceiros" element={<Terceiros />} />
      <Route path="relatorios" element={<Relatorios />} />
      <Route path="ordens" element={<Ordens />} />
      <Route path="configuracoes" element={<Configuracoes />} />
      <Route path="fechamento-semanal" element={<FechamentoSemanal />} />
      <Route path="socket-test" element={<SocketTest />} />
    </Route>
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
