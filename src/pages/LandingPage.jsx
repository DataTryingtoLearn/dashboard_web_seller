import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import dashboardPreview from '../assets/dashboard_prueba.png';
import {
    ChevronRight,
    Zap,
    MessageSquare,
    BarChart3,
    ShieldCheck,
    LayoutDashboard,
    ArrowRight,
    Bot,
    Sparkles,
    Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-primary/20 transition-colors duration-500 overflow-x-hidden font-sans">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                            <Bot className="text-white w-6 h-6" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter uppercase">Mía</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {['Inicio', 'Funcionalidades', 'Métricas', 'Empresa'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link to="/app" className="flex items-center gap-2 bg-primary hover:glow-primary text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all">
                                Ir al Dashboard <ArrowRight size={14} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors px-4 uppercase tracking-widest">
                                    Login
                                </Link>
                                <Link to="/login" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all hidden sm:block">
                                    Empezar Gratis
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />

                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                    >
                        <Sparkles size={12} className="animate-spin-slow" /> Inteligencia Artificial para tu CRM
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10 text-slate-900 dark:text-white"
                    >
                        Escala tus ventas con <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-500 to-indigo-600">
                            Automatización Real.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-12"
                    >
                        Mía no es solo un dashboard. Es una asistente de IA capaz de gestionar miles de conversaciones, calificar leads y reportar métricas precisas en tiempo real.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link to="/login" className="bg-primary hover:glow-primary text-white text-sm font-black px-10 py-5 rounded-2xl shadow-2xl shadow-primary/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group">
                            PRUEBA MÍA GRATIS <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <a href="#funcionalidades" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-foreground transition-colors p-4">
                            Ver funcionalidades
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mt-24 relative max-w-5xl mx-auto"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full scale-75" />
                        <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-4 shadow-2xl backdrop-blur-sm group overflow-hidden">
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <div className="w-3 h-3 rounded-full bg-red-400/20" />
                                <div className="w-3 h-3 rounded-full bg-amber-400/20" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400/20" />
                            </div>
                            <img
                                src={dashboardPreview}
                                alt="Dashboard Preview"
                                className="rounded-xl shadow-2xl transition-all duration-1000"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 border-y border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12">
                        CON LA CONFIANZA DE EQUIPOS RÁPIDOS
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-30 dark:opacity-20 grayscale">
                        {['TELCEL', 'META', 'STRIPE', 'MICROSOFT', 'GOOGLE'].map(p => (
                            <span key={p} className="text-2xl font-black italic tracking-tighter">{p}</span>
                        ))}
                    </div>
                </div>
            </section>

            <section id="funcionalidades" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-1 space-y-6">
                            <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
                                Todo lo que necesitas para <br />
                                <span className="text-primary italic">dominar el mercado.</span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                Hemos construido una suite de herramientas diseñada por expertos en CRM y IA.
                            </p>
                            <div className="pt-6 space-y-3">
                                {['100% Personalizable', 'Integración WhatsApp', 'Reportes Diarios'].map(f => (
                                    <div key={f} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                        <Check size={16} className="text-primary" /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-border hover:border-primary/50 transition-colors group">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="text-primary w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-black mb-3 text-slate-900 dark:text-white">Conversaciones Inteligentes</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Mía responde automáticamente basándose en el historial y el contexto de cada lead.
                                </p>
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-border hover:border-primary/50 transition-colors group">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="text-indigo-500 w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-black mb-3 text-slate-900 dark:text-white">Funnel a Tiempo Real</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Visualiza cada etapa de tu proceso de ventas con gráficos dinámicos y métricas precisas.
                                </p>
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-border hover:border-primary/50 transition-colors group">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Zap className="text-emerald-500 w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-black mb-3 text-slate-900 dark:text-white">Automatización de Tareas</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Automatiza seguimientos, cambios de estatus y alertas para tu equipo técnico.
                                </p>
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-border hover:border-primary/50 transition-colors group">
                                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="text-orange-500 w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-black mb-3 text-slate-900 dark:text-white">Seguridad de Grado Bancario</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Tus datos están encriptados y protegidos bajo los más altos estándares de cumplimiento.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto rounded-[3rem] bg-slate-900 relative overflow-hidden p-12 md:p-24 text-center">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-none">
                            ¿Listo para transformar <br /> tus resultados?
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
                            Únete a cientos de empresas que ya están usando Mía para liderar su industria. No dejes que la competencia te alcance.
                        </p>
                        <Link to="/login" className="inline-flex bg-primary hover:glow-primary text-white text-sm font-black px-12 py-6 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                            Empieza hoy mismo
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="py-20 px-6 border-t border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                            <Bot className="text-white w-4 h-4" />
                        </div>
                        <span className="font-black text-xl tracking-tighter uppercase">Mía</span>
                    </div>

                    <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <a href="#" className="hover:text-primary transition-colors">Politica Privacidad</a>
                        <a href="#" className="hover:text-primary transition-colors">Términos de Uso</a>
                        <a href="#" className="hover:text-primary transition-colors">Soporte</a>
                    </div>

                    <p className="text-[10px] font-bold text-slate-400">
                        © 2026 Mía Dashboard. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
