
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// Mock users - in a real app, this would be in a database
const MOCK_USERS = [
  { email: "admin@agencia.com", password: "admin123", role: "admin" },
  { email: "vendas@agencia.com", password: "vendas123", role: "sales" }
];

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);

      if (user) {
        // Store user info in localStorage
        localStorage.setItem("user", JSON.stringify({
          email: user.email,
          role: user.role,
          isAuthenticated: true
        }));
        
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao Sistema de Gestão de Viagens",
        });
        
        navigate("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Falha no login",
          description: "Email ou senha incorretos",
        });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-sky-100 to-sky-200">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Agência de Viagens</CardTitle>
          <CardDescription className="text-center">Entre com suas credenciais para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Autenticando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500">
            Use: admin@agencia.com / admin123
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
