import React, { useState, useEffect, useRef } from 'react';
import {
    Search, User, Send, Save, Bot,
    MessageSquare, AlertCircle, CheckCircle2, Clock,
    XCircle, Phone, Lock, Unlock, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { sileo } from 'sileo';

const ChatsPage = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [filter, setFilter] = useState('TODOS');
    const [searchTerm, setSearchTerm] = useState('');
    const [manualMessage, setManualMessage] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchChats();
        const interval = setInterval(() => {
            fetchChats();
            if (selectedChat) {
                fetchHistory(selectedChat.telefono);
            }
        }, 15000);
        return () => clearInterval(interval);
    }, [selectedChat]); // Re-create interval if selectedChat changes to keep update loop fresh

    const fetchChats = async () => {
        try {
            const res = await fetch(`/api/chats?q=${encodeURIComponent(searchTerm)}`);
            if (res.status === 401) return;
            const data = await res.json();
            setChats(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    };

    const fetchHistory = async (telefono) => {
        if (!telefono) return;
        setLoadingMessages(true);
        try {
            const res = await fetch(`/api/historial/${telefono}`);
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
            scrollToBottom();
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        setNote(chat.comentarios || '');
        fetchHistory(chat.telefono);
    };

    const handleSendManual = async () => {
        if (!manualMessage.trim() || !selectedChat) return;

        try {
            const res = await fetch(`/api/enviar_manual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telefono: selectedChat.telefono,
                    texto: manualMessage
                })
            });

            if (res.ok) {
                if (selectedChat.estado !== 'MANUAL') {
                    sileo.info({
                        title: "Modo Manual Activado",
                        description: "Has tomado el control de la conversación. La IA se ha pausado.",
                        icon: <User className="text-purple-500" size={18} />
                    });
                } else {
                    sileo.success({
                        title: "Mensaje Enviado",
                        description: "El mensaje ha sido entregado correctamente.",
                        icon: <Send className="text-emerald-500" size={18} />
                    });
                }
                setManualMessage('');
                fetchHistory(selectedChat.telefono);
                fetchChats(); // Refresh status
            } else {
                sileo.error({
                    title: "Error al enviar",
                    description: "No se pudo entregar el mensaje. Revisa la conexión.",
                    icon: <XCircle className="text-red-500" size={18} />
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            sileo.error({
                title: "Error Crítico",
                description: "Ocurrió un error inesperado al intentar enviar el mensaje.",
            });
        }
    };

    const handleSaveNote = async () => {
        if (!selectedChat) return;
        try {
            const res = await fetch(`/api/guardar_comentario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telefono: selectedChat.telefono,
                    comentario: note
                })
            });
            if (res.ok) {
                sileo.success({
                    title: "Nota Guardada",
                    description: "La información del cliente ha sido actualizada.",
                    icon: <Save className="text-yellow-500" size={18} />
                });
                fetchChats(); // Refresh to show updated note indicator
            }
        } catch (error) {
            console.error("Error saving note:", error);
            sileo.error({
                title: "Error al Guardar",
                description: "No se pudo guardar la nota en este momento."
            });
        }
    };

    const handleReactivateBot = async () => {
        if (!selectedChat || !confirm("¿Reactivar el bot para este chat?")) return;
        try {
            const res = await fetch(`/api/reactivar/${selectedChat.telefono}`, {
                method: 'POST'
            });
            if (res.ok) {
                sileo.success({
                    title: "Modo IA Activado",
                    description: "La asistente MIA ha retomado el control del chat.",
                    icon: <Sparkles className="text-primary animate-pulse" size={18} />
                });
                fetchChats();
                // Local state update for immediate feedback
                setSelectedChat(prev => ({ ...prev, estado: 'IA' }));
                if (selectedChat) fetchHistory(selectedChat.telefono);
            }
        } catch (error) {
            console.error("Error reactivating bot:", error);
            sileo.error({
                title: "Error de Activación",
                description: "No se pudo reactivar la IA."
            });
        }
    };

    const handleSetManual = async () => {
        if (!selectedChat) return;
        try {
            const res = await fetch(`/api/leads/${selectedChat.telefono}/manual`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manual: true })
            });
            if (res.ok) {
                sileo.info({
                    title: "Modo Manual",
                    description: "Control manual activado. Se ha pausado la IA.",
                    icon: <User className="text-purple-500" size={18} />
                });
                fetchChats();
                // Local state update
                setSelectedChat(prev => ({ ...prev, estado: 'MANUAL' }));
            }
        } catch (error) {
            console.error("Error setting manual:", error);
            sileo.error({ title: "Error", description: "No se pudo activar el modo manual." });
        }
    };

    const filteredChats = chats.filter(chat => {
        const status = (chat.estatus_ok || '').toUpperCase();
        if (filter === 'TODOS') return true;
        if (filter === 'ERROR') return status.includes('ERROR') || status.includes('RECHAZO');
        if (filter === 'VENTA') return status.includes('VENTA');
        return status === filter;
    });

    const getBadgeColor = (status) => {
        status = (status || '').toUpperCase();
        if (status.includes('VENTA')) return "bg-teal-100 text-teal-700 border-teal-200";
        if (status === 'PERMITIDO_R3') return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200";
        if (status === 'PERMITIDO') return "bg-green-100 text-green-700";
        if (status === 'ABANDONADO') return "bg-gray-100 text-gray-600";
        if (status === 'YA ES TELCEL') return "bg-blue-100 text-blue-600";
        if (status === 'REPEP') return "bg-purple-100 text-purple-600";
        if (status === 'FUERAREGION') return "bg-pink-100 text-pink-600";
        if (status === 'PORTOUT60') return "bg-indigo-100 text-indigo-600";
        if (status.includes('ERROR')) return "bg-red-100 text-red-600";
        return "bg-gray-100 text-gray-500";
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-500">
            <div className="w-1/3 min-w-[380px] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex flex-col z-20 shadow-[20px_0_50px_rgba(0,0,0,0.02)]">
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                                <MessageSquare className="text-primary w-6 h-6" />
                                Mensajes
                            </h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                Agentes en Línea
                            </p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                    </div>

                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Buscar por teléfono o contenido..."
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-slate-800 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm group-hover:shadow-md outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchChats()}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    </div>
                </div>

                <div className="px-6 pb-4 overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 w-max">
                        {['TODOS', 'VENTA', 'PERMITIDO', 'PERMITIDO_R3', 'ERROR'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all border",
                                    filter === f
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                                        : "bg-white dark:bg-slate-800 text-muted-foreground border-border hover:border-primary/50"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
                    {filteredChats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                            <Search size={40} className="mb-4" />
                            <p className="text-xs font-bold uppercase tracking-widest">Sin resultados</p>
                        </div>
                    ) : (
                        filteredChats.map((chat, idx) => (
                            <div
                                key={`${chat.telefono}-${idx}`}
                                onClick={() => handleSelectChat(chat)}
                                className={cn(
                                    "p-4 cursor-pointer transition-all duration-300 rounded-2xl border flex items-center gap-4 relative overflow-hidden group",
                                    selectedChat?.telefono === chat.telefono
                                        ? "bg-primary/[0.03] border-primary/30 shadow-sm"
                                        : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                )}
                            >
                                {selectedChat?.telefono === chat.telefono && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                )}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-500 font-bold border border-white/20 relative">
                                    <User size={20} />
                                    {chat.ventana_24h && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-black text-sm tracking-tight">{chat.telefono}</span>
                                        <span className="text-[9px] font-bold text-muted-foreground/60">{chat.fecha}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border", getBadgeColor(chat.estatus_ok))}>
                                            {chat.estatus_ok}
                                        </div>
                                        {chat.estado === 'MANUAL' && (
                                            <div className="p-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md">
                                                <User size={10} />
                                            </div>
                                        )}
                                        {chat.comentarios && (
                                            <div className="p-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-md">
                                                <Save size={10} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative">
                {selectedChat ? (
                    <>
                        <div className="h-24 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-8 flex items-center justify-between z-10 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl tracking-tighter">{selectedChat.telefono}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", selectedChat.ventana_24h ? "bg-emerald-500" : "bg-red-500")} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            {selectedChat.estado === 'MANUAL' ? "Modo Manual" : "Asistente MIA Activo"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {selectedChat.estado === 'MANUAL' ? (
                                    <button
                                        onClick={handleReactivateBot}
                                        className="h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                                    >
                                        <Bot size={14} /> ACTIVAR IA
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSetManual}
                                        className="h-10 px-6 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 active:scale-95 flex items-center gap-2"
                                    >
                                        <User size={14} /> MODO MANUAL
                                    </button>
                                )}
                                <div className="h-10 w-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                    <Phone size={18} />
                                </div>
                            </div>
                        </div>

                        {(selectedChat.info_portabilidad && selectedChat.info_portabilidad.estatus !== '-') && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-border px-8 py-3 flex gap-8">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Portabilidad</p>
                                    <p className="text-xs font-bold text-primary">{selectedChat.info_portabilidad.numero_portar}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Estatus</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{selectedChat.info_portabilidad.estatus}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-8 flex flex-col space-y-8 bg-[#f8fafc] dark:bg-slate-950/20">
                            {messages.map((msg, idx) => {
                                const isUser = msg.mensaje_usuario && !msg.mensaje_usuario.startsWith('[');
                                const isBot = msg.respuesta_bot && !msg.respuesta_bot.includes('[SILENCIO');

                                return (
                                    <React.Fragment key={msg.id || `${msg.fecha}-${idx}`}>
                                        {isUser && (
                                            <div className="flex flex-col items-start max-w-[70%] animate-in slide-in-from-left-4 duration-300">
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-white/5 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {msg.mensaje_usuario}
                                                </div>
                                                <span className="text-[9px] font-bold text-muted-foreground/40 mt-1 px-1 uppercase tracking-tighter">{msg.fecha}</span>
                                            </div>
                                        )}

                                        {isBot && (
                                            <div className="flex flex-col items-end self-end max-w-[70%] animate-in slide-in-from-right-4 duration-300">
                                                <div className={cn(
                                                    "p-4 rounded-2xl rounded-tr-none shadow-lg text-sm leading-relaxed border",
                                                    msg.estado === 'MANUAL'
                                                        ? "bg-primary text-white border-primary shadow-primary/20"
                                                        : "bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5"
                                                )}>
                                                    <div className={cn("text-[8px] font-black mb-1 uppercase tracking-widest opacity-60", msg.estado === 'MANUAL' ? "text-white" : "text-primary")}>
                                                        {(() => {
                                                            if (msg.estado === 'MANUAL') {
                                                                const match = (msg.respuesta_bot || '').match(/^\[(.*?)\]/);
                                                                return match ? `Respuesta por: ${match[1]}` : "Respuesta Humana";
                                                            }
                                                            return "Asistente MIA";
                                                        })()}
                                                    </div>
                                                    <div className="whitespace-pre-wrap">
                                                        {msg.estado === 'MANUAL' ? (msg.respuesta_bot || '').replace(/^\[.*?\]\s*/, '') : msg.respuesta_bot}
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-bold text-muted-foreground/40 mt-1 px-1 uppercase tracking-tighter">{msg.fecha}</span>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="px-8 absolute bottom-24 left-0 right-0 z-10 pointer-events-none">
                            <div className="bg-yellow-50/90 dark:bg-yellow-900/20 backdrop-blur-md border border-yellow-200/50 dark:border-yellow-900/30 p-3 rounded-2xl shadow-xl flex gap-3 pointer-events-auto max-w-2xl mx-auto">
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="flex-1 bg-transparent text-xs p-1 focus:outline-none resize-none h-10 font-medium placeholder:text-yellow-600/40"
                                    placeholder="Añadir nota privada sobre este cliente..."
                                />
                                <button
                                    onClick={handleSaveNote}
                                    className="h-10 w-10 flex items-center justify-center bg-yellow-400 dark:bg-yellow-600 rounded-xl text-yellow-900 dark:text-yellow-100 hover:scale-110 transition-transform active:scale-90"
                                >
                                    <Save size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10">
                            <div className="relative flex items-center gap-4">
                                {!selectedChat.ventana_24h && (
                                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-20 rounded-2xl flex items-center justify-center">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200 dark:border-red-800">
                                            <Lock size={12} /> Ventana de 24h Cerrada
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={manualMessage}
                                    onChange={(e) => setManualMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendManual()}
                                    placeholder="Escribe un mensaje para el cliente..."
                                    className="flex-1 h-14 pl-6 pr-4 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-2xl outline-none text-sm font-medium"
                                />
                                <button
                                    onClick={handleSendManual}
                                    disabled={!selectedChat.ventana_24h || !manualMessage.trim()}
                                    className="h-14 w-14 rounded-2xl bg-primary hover:glow-primary text-white flex items-center justify-center shadow-lg transition-all active:scale-90 disabled:opacity-50 disabled:grayscale"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative">
                            <MessageSquare size={40} className="text-slate-200 dark:text-slate-700" />
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-bounce">
                                <Bot size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tighter">Centro de Comando MIA</h2>
                            <p className="max-w-xs text-muted-foreground text-sm font-medium">Selecciona una conversación del listado lateral para comenzar a gestionar el lead en tiempo real.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border">
                                <Search size={20} className="text-primary mb-2 mx-auto" />
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Búsqueda Inteligente</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border">
                                <User size={20} className="text-primary mb-2 mx-auto" />
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Control Manual</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatsPage;