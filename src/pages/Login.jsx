import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { sileo } from 'sileo';
import { Lock, User, AlertCircle, CheckCircle2, Bot } from 'lucide-react';

const Login = () => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(id, password);

        if (result.success) {
            sileo.success({
                title: "¡Bienvenido de nuevo!",
                description: "Acceso concedido al Centro de Comando MIA.",
                icon: <CheckCircle2 className="text-emerald-500" size={18} />
            });
            navigate('/app');
        } else {
            sileo.error({
                title: "Error de Acceso",
                description: result.message || "Credenciales incorrectas. Intenta de nuevo.",
                icon: <AlertCircle className="text-red-500" size={18} />
            });
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <Link to="/" className="flex flex-col items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:glow-primary transition-all">
                            <Bot className="text-white w-10 h-10" />
                        </div>
                        <span className="font-black text-3xl tracking-tighter uppercase text-slate-900 dark:text-white">Mía</span>
                    </Link>
                </div>

                <div className="bg-card rounded-[2rem] shadow-2xl p-8 border border-border/50 backdrop-blur-xl">
                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase italic">Bienvenido</h1>
                        <p className="text-muted-foreground mt-2 font-medium">Inicia sesión para continuar al dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="employee_id" className="block text-sm font-medium text-foreground mb-1">
                                ID de Empleado
                            </label>
                            <div className="relative">
                                <input
                                    id="employee_id"
                                    type="text"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                                    placeholder="Ej. E029863"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Cargando...' : 'Ingresar'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
