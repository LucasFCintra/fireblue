
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação de senha
    if (password !== confirmPassword) {
      setError("As senhas não correspondem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, nome);
      if (error) setError(error.message);
    } catch (err) {
      setError("Ocorreu um erro durante o cadastro.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">SGEE Fire Blue</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão de Estoque</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Conta</CardTitle>
            <CardDescription>
              Preencha seus dados para criar uma nova conta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="nome" className="text-sm font-medium">
                  Nome Completo
                </label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Senha
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : "Cadastrar"}
              </Button>
              
              <div className="w-full mt-4 text-sm">
                <Link 
                  to="/login" 
                  className="flex items-center text-primary hover:underline"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Voltar para o login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
