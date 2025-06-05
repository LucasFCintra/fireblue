
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-primary/10 h-24 w-24 rounded-full flex items-center justify-center text-primary mb-6 mx-auto">
          <span className="text-5xl font-bold">404</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">Página não encontrada</h1>
        <p className="text-lg text-gray-600 mb-8">
          Não foi possível encontrar a página que você está procurando.
        </p>
        <Button asChild size="lg">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
