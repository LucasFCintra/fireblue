import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const { signIn, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isResetMode) {
        const { error } = await resetPassword(email);
        if (error) setError(error.message);
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      }
    } catch (err) {
      setError("Ocorreu um erro durante a autenticação.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">SGEE Fire Blue</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gestão de Estoque</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isResetMode ? "Recuperar Senha" : "Login"}
            </CardTitle>
            <CardDescription>
              {isResetMode 
                ? "Informe seu e-mail para receber instruções de recuperação" 
                : "Acesse sua conta para utilizar o sistema"}
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
                <label htmlFor="email" className="text-sm font-medium text-foreground">
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

              {!isResetMode && (
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
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
                    Aguarde...
                  </>
                ) : isResetMode ? "Enviar instruções" : "Entrar"}
              </Button>
              
              <div className="flex items-center justify-between w-full mt-4 text-sm">
                <Button
                  variant="link"
                  type="button"
                  className="p-0 h-auto"
                  onClick={() => setIsResetMode(!isResetMode)}
                >
                  {isResetMode ? "Voltar ao login" : "Esqueceu a senha?"}
                </Button>

                {!isResetMode && (
                  <Link to="/cadastro" className="text-primary hover:underline">
                    Criar conta
                  </Link>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
