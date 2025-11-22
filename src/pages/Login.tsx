import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AbejaFilled } from "@/components/icons/AbejaLoggin";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email);
            navigate("/");
        } catch (error) {
            toast({
                title: "Error de inicio de sesión",
                description: "El correo electrónico es incorrecto. Por favor, inténtelo de nuevo.",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-white to-primary/10 flex min-h-screen items-center justify-center ">
            <AbejaFilled className="h-44 w-44 text-primary/30 transition-colors hover:text-primary/40" />

            <Card className=" relative ml-4 max-w-sm">

                <CardHeader className="z-10">
                    <CardTitle className="text-2xl z-10">Iniciar Sesión</CardTitle>
                    <CardDescription>
                        Ingresa tu correo electrónico para iniciar sesión en tu cuenta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ejemplo@seti.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
