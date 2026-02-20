import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { Drawer, ColorPicker, Text, Stack, Button as MantineButton, Group } from '@mantine/core';
import {
    LayoutDashboard, Users, LogOut, Menu, MessageCircle,
    ChevronLeft, ChevronRight, Sun, Moon, Palette, Settings,
    Check, X, ShieldCheck, RefreshCw, Bot, Sparkles, Send, Plus
} from 'lucide-react';
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, active, onClick, isCollapsed }) => {
    const shouldReduceMotion = useReducedMotion();
    return (
        <button
            onClick={onClick}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
            title={isCollapsed ? label : ""}
            role="menuitem"
            className={cn(
                "w-full flex items-center py-3.5 rounded-2xl transition-all duration-200 group relative",
                isCollapsed ? "justify-center px-0" : "px-4",
                active
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            )}
        >
            {active && !isCollapsed && (
                <m.div
                    layoutId="activeIndicator"
                    className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            <Icon className={cn(
                "w-5 h-5 min-w-[20px] transition-all duration-200",
                active ? "scale-110" : "group-hover:text-primary group-hover:scale-110"
            )} />

            {!isCollapsed && (
                <span className="ml-4 text-xs font-black uppercase tracking-widest truncate">
                    {label}
                </span>
            )}
        </button>
    );
};


const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (user?.role !== 'admin' && user?.role !== 'superadmin' && Number(user?.permission_level) < 1) {
        return <Navigate to="/app" replace />;
    }
    return children;
};

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const { theme, setTheme, primaryColor, setPrimaryColor, secondaryColor, setSecondaryColor } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
    const [showCookies, setShowCookies] = useState(() => !localStorage.getItem('cookies-accepted'));

    const [isFabOpen, setIsFabOpen] = useState(false);

    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        let timer;
        if (isFabOpen) {
            timer = setTimeout(() => {
                setIsFabOpen(false);
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [isFabOpen, theme, primaryColor, secondaryColor, isAiOpen, isCustomizerOpen]);

    const handleAcceptCookies = () => {
        localStorage.setItem('cookies-accepted', 'true');
        setShowCookies(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const runAiQuery = async () => {
        if (!aiQuery.trim()) return;
        setIsAiLoading(true);
        setAiResponse(null);
        try {
            const response = await fetch('/api/ai/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userQuery: aiQuery })
            });
            const res = await response.json();
            if (res.success) {
                setAiResponse(res.data);
            } else {
                setAiResponse({ explanation: res.message || "No pude procesar esa consulta." });
            }
        } catch (error) {
            setAiResponse({ explanation: "Error de conexión con el motor de IA." });
        } finally {
            setIsAiLoading(false);
        }
    };


    const getNavItems = () => {
        const items = [{ label: 'Dashboard', icon: LayoutDashboard, path: '/app' }];
        // Allow "Mensajes" if user is admin, superadmin, or has any permission level
        if (user?.role === 'admin' || user?.role === 'superadmin' || Number(user?.permission_level) >= 1) {
            items.push({ label: 'Mensajes', icon: MessageCircle, path: '/app/chats' });
            items.push({ label: 'Usuarios', icon: Users, path: '/app/users' });
        }
        return items;
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-foreground flex transition-colors duration-300 font-sans">

            <aside className={cn(
                "hidden md:flex flex-col transition-all duration-300 relative border-r overflow-visible z-30",
                "bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-slate-200 dark:border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.02)]",
                isCollapsed ? "w-24" : "w-72"
            )}>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-4 top-12 z-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/20 rounded-xl p-1.5 shadow-xl hover:scale-110 transition-all hover:bg-primary hover:text-white group"
                >
                    {isCollapsed ?
                        <ChevronRight className="w-4 h-4" /> :
                        <ChevronLeft className="w-4 h-4" />
                    }
                </button>

                <div className={cn("h-28 flex items-center", isCollapsed ? "justify-center px-0" : "px-8")}>
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-primary/40 group cursor-pointer hover:rotate-6 transition-transform">
                            <span className="text-white font-black text-2xl">S</span>
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-300">
                                <span className="font-black text-xl leading-none tracking-tighter text-foreground">
                                    {user?.company_name || "Mía"}
                                </span>
                                <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">
                                    CORE SYSTEM
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <nav className={cn("flex-1 space-y-3 mt-4", isCollapsed ? "px-4" : "px-6")}>
                    {getNavItems().map((item) => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            isCollapsed={isCollapsed}
                            active={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                        />
                    ))}
                </nav>

                <div className={cn("p-6 m-4 mt-auto rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-border/50", isCollapsed ? "p-2 m-2" : "p-6")}>
                    <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "px-1")}>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 shrink-0">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black truncate text-foreground uppercase tracking-tight">
                                    {user?.name}
                                </p>
                                <p className="text-[10px] font-bold truncate capitalize text-muted-foreground/60 tracking-wider">
                                    {user?.role}
                                </p>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <Button
                            variant="ghost"
                            className="w-full mt-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold text-xs uppercase tracking-widest"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                        </Button>
                    )}
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 relative">
                <main className="flex-1 overflow-y-auto no-scrollbar relative">
                    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    <Outlet />
                </main>
            </div>

            {location.pathname === '/app' && (
                <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-center">
                    <AnimatePresence>
                        {isFabOpen && (
                            <div className="flex flex-col gap-4 mb-4">
                                {/* AI Item */}
                                <m.button
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-2xl shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform group relative"
                                    onClick={() => { setIsAiOpen(true); setIsFabOpen(false); }}
                                >
                                    <Bot className="w-6 h-6" />
                                    <span className="absolute right-full mr-4 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Mía IA
                                    </span>
                                </m.button>

                                {/* Customizer Item */}
                                <m.button
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    transition={{ duration: 0.15, delay: 0.05, ease: "easeOut" }}
                                    className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-primary shadow-2xl border border-border flex items-center justify-center hover:scale-105 active:scale-95 transition-transform group relative"
                                    onClick={() => { setIsCustomizerOpen(true); setIsFabOpen(false); }}
                                >
                                    <Palette className="w-6 h-6" />
                                    <span className="absolute right-full mr-4 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Colores
                                    </span>
                                </m.button>

                                {/* Toggle Theme Item */}
                                <m.button
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    transition={{ duration: 0.15, delay: 0.1, ease: "easeOut" }}
                                    className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-foreground shadow-2xl border border-border flex items-center justify-center hover:scale-105 active:scale-95 transition-transform relative group"
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                >
                                    <Sun className={cn("h-6 w-6 text-yellow-500 absolute transition-all", theme === 'dark' ? "rotate-90 opacity-0 scale-0" : "rotate-0 opacity-100 scale-100")} />
                                    <Moon className={cn("h-6 w-6 text-indigo-400 absolute transition-all", theme === 'dark' ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-0")} />
                                    <span className="absolute right-full mr-4 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Modo {theme === 'dark' ? 'Claro' : 'Oscuro'}
                                    </span>
                                </m.button>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Main FAB Toggle */}
                    <m.button
                        animate={{ rotate: isFabOpen ? 45 : 0 }}
                        className={cn(
                            "w-16 h-16 rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all duration-300",
                            isFabOpen
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                : "bg-primary text-white hover:glow-primary scale-110"
                        )}
                        onClick={() => setIsFabOpen(!isFabOpen)}
                    >
                        <Plus size={32} strokeWidth={3} />
                    </m.button>
                </div>
            )}

            <Drawer
                opened={isAiOpen}
                onClose={() => setIsAiOpen(false)}
                position="right"
                size="xl"
                padding="xl"
                overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
                styles={{
                    inner: { zIndex: 1000 },
                    content: {
                        background: isDark ? '#0f172a' : '#ffffff',
                        borderLeft: '1px solid ' + (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                        boxShadow: '-20px 0 50px rgba(0,0,0,0.1)',
                        borderRadius: '32px 0 0 32px'
                    }
                }}
            >
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <Bot className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-foreground uppercase">Mía IA</h3>
                                <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase opacity-60">Análisis Predictivo</p>
                            </div>
                        </div>
                        <button onClick={() => setIsAiOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
                        <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10">
                            <h4 className="text-sm font-black text-primary uppercase mb-4 tracking-widest">¿Qué deseas consultar?</h4>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    placeholder="Ej: ¿Cuántas ventas tuvimos ayer?"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-primary outline-none transition-all shadow-xl font-medium"
                                    onKeyDown={(e) => e.key === 'Enter' && runAiQuery()}
                                />
                                <button
                                    onClick={runAiQuery}
                                    className="absolute right-2 top-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                                >
                                    {isAiLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {aiResponse && (
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="bg-muted/50 rounded-[2rem] p-8 border border-border/50">
                                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase mb-4 tracking-widest">
                                        <Sparkles className="w-4 h-4" /> Respuesta de Mía
                                    </div>
                                    <p className="text-foreground leading-relaxed font-medium">
                                        {aiResponse.explanation}
                                    </p>
                                </div>
                                <div className="bg-slate-900 dark:bg-white/5 rounded-2xl p-4 overflow-x-auto">
                                    <code className="text-[10px] text-emerald-400 font-mono">
                                        {aiResponse.sql}
                                    </code>
                                </div>
                            </m.div>
                        )}
                    </div>
                </div>
            </Drawer>

            <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
                <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-around">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all relative overflow-hidden group",
                                    active ? "text-primary bg-primary/10" : "text-muted-foreground"
                                )}
                            >
                                {active && (
                                    <m.div
                                        layoutId="mobileNavActive"
                                        className="absolute inset-0 bg-primary/10 z-0"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <Icon className={cn(
                                    "w-6 h-6 z-10 transition-transform duration-300",
                                    active ? "scale-110" : "group-hover:scale-110"
                                )} />
                                <span className="text-[9px] font-black uppercase tracking-tighter z-10">{item.label}</span>
                            </button>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-1 p-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-black uppercase tracking-tighter"
                    >
                        <LogOut className="w-6 h-6" />
                        <span className="text-[9px]">Salir</span>
                    </button>
                </nav>
            </div>

            <Drawer
                opened={isCustomizerOpen}
                onClose={() => setIsCustomizerOpen(false)}
                title={<span className="font-black text-xl tracking-tighter uppercase mr-4">Apariencia</span>}
                position="right"
                size="md"
                padding="xl"
                overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
                styles={{ header: { borderBottom: '1px solid var(--border)', paddingBottom: '20px' }, content: { borderRadius: '32px 0 0 32px' } }}
            >
                <Stack>
                    <Text size="xs" fw={900} tt="uppercase" c="dimmed">Color Principal</Text>
                    <ColorPicker value={primaryColor} onChange={setPrimaryColor} format="hex" fullWidth swatches={['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']} />
                    <Text size="xs" fw={900} tt="uppercase" c="dimmed" mt="md">Color Secundario</Text>
                    <ColorPicker value={secondaryColor} onChange={setSecondaryColor} format="hex" fullWidth swatches={['#6366f1', '#4f46e5', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']} />
                    <MantineButton variant="light" color="orange" fullWidth mt="xl" radius="md" leftSection={<RefreshCw size={14} />} onClick={() => { setPrimaryColor('#f97316'); setSecondaryColor('#6366f1'); }}>
                        Restablecer Predeterminados
                    </MantineButton>
                </Stack>
            </Drawer>

            {showCookies && (
                <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[70] animate-in slide-in-from-bottom-10 duration-700">
                    <div className="bg-white dark:bg-slate-900 border border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-[2rem] p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck size={80} />
                        </div>
                        <h4 className="text-lg font-black tracking-tight flex items-center gap-2 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                            </div>
                            Política de Cookies
                        </h4>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6">
                            Utilizamos cookies y almacenamiento local para guardar tus preferencias de personalización y asegurar que el sistema funcione correctamente.
                        </p>
                        <Group grow>
                            <MantineButton
                                variant="outline"
                                color="gray"
                                radius="xl"
                                size="xs"
                                onClick={() => setShowCookies(false)}
                                styles={{ root: { fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' } }}
                            >
                                Después
                            </MantineButton>
                            <MantineButton
                                color="orange"
                                radius="xl"
                                size="xs"
                                onClick={handleAcceptCookies}
                                styles={{ root: { fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' } }}
                            >
                                Aceptar Todo
                            </MantineButton>
                        </Group>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
