import React, { useEffect, useState } from 'react';
import { Users, MessageCircle, X, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const ChatsPage = () => {
    const [searchParams] = useSearchParams();
    const initialLead = searchParams.get('id');

    const [selectedLead, setSelectedLead] = useState(initialLead || null);
    const [conversation, setConversation] = useState([]);
    const [chatList, setChatList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [outboundText, setOutboundText] = useState("");
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Load Chat List on mount
    useEffect(() => {
        const fetchChatList = async () => {
            try {
                const res = await fetch('/api/leads/chats');
                const json = await res.json();
                if (json.success) {
                    setChatList(json.data);
                }
            } catch (error) {
                console.error("Error fetching chat list", error);
            }
        };
        fetchChatList();
    }, []);

    // Load Conversation when a lead is selected
    useEffect(() => {
        if (!selectedLead) return;

        const fetchConversation = async () => {
            setIsLoadingConversation(true);
            setConversation([]);
            try {
                const res = await fetch(`/api/leads/${selectedLead}/conversation`);
                const json = await res.json();
                if (json.success) {
                    setConversation(json.data);
                }
            } catch (error) {
                console.error("Error fetching conversation", error);
            } finally {
                setIsLoadingConversation(false);
            }
        };

        fetchConversation();
    }, [selectedLead]);

    const handleSendOutbound = async (e) => {
        e.preventDefault();
        if (!outboundText.trim() || !selectedLead || isSending) return;

        setIsSending(true);
        try {
            const response = await fetch('/api/messages/outbound', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wa_id: selectedLead,
                    message: outboundText
                })
            });

            const data = await response.json();
            if (data.success) {
                // Agregar el mensaje localmente para feedback inmediato
                const newMessage = {
                    mensaje_texto: outboundText,
                    fecha_mensaje: new Date().toISOString(),
                    sentido: 'out'
                };
                setConversation(prev => [...prev, newMessage]);
                setOutboundText("");
            } else {
                alert("Error al enviar: " + data.message);
            }
        } catch (error) {
            console.error("Error sending outbound:", error);
            alert("Error de conexión al enviar mensaje");
        } finally {
            setIsSending(false);
        }
    };

    const handleToggleManual = async (messageId, currentManual) => {
        if (!messageId) return;

        const newManualValue = currentManual ? 0 : 1;

        try {
            const response = await fetch(`/api/messages/manual/${messageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manual: newManualValue })
            });

            const data = await response.json();
            if (data.success) {
                // Actualizar localmente
                setConversation(prev => prev.map(msg =>
                    msg.id === messageId ? { ...msg, Manual: newManualValue } : msg
                ));
            } else {
                alert("Error al actualizar: " + data.message);
            }
        } catch (error) {
            console.error("Error toggling manual:", error);
            alert("Error de conexión al actualizar estado");
        }
    };

    // Update selected lead if URL param changes


    const filteredChats = chatList.filter(chat =>
        chat.remitente_wa_id.includes(searchTerm)
    );

    const getOutboundStatus = () => {
        if (!selectedLead) return null;
        const chat = chatList.find(c => c.remitente_wa_id === selectedLead);
        if (!chat) return { text: "Estado desconocido", color: "text-gray-400" };

        // El tiempo se cuenta desde el último mensaje ENVIADO POR EL REMITENTE (last_incoming)
        const referenceTime = chat.last_incoming || chat.last_interaction;
        if (!referenceTime) return { text: "Sin interacciones", color: "text-gray-400" };

        const lastInteraction = new Date(referenceTime);
        const now = new Date();
        const diffInHours = (now - lastInteraction) / (1000 * 60 * 60);

        if (diffInHours <= 23) {
            return {
                text: "Disponible para outbound",
                color: "text-emerald-500"
            };
        } else {
            return {
                text: "No disponible para outbound",
                color: "text-red-500"
            };
        }
    };

    const status = getOutboundStatus();

    // Update selected lead if URL param changes
    useEffect(() => {
        if (initialLead && initialLead !== selectedLead) {
            setSelectedLead(initialLead);
        }
    }, [initialLead]);

    return (
        <div className="h-[calc(100vh-120px)] bg-white dark:bg-gray-800 shadow-xl rounded-xl flex overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Sidebar: Lista de Chats */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
                {/* Header Sidebar */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Chats</h3>
                    <input
                        type="text"
                        placeholder="Buscar número..."
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredChats.length > 0 ? (
                        filteredChats.map((chat) => (
                            <div
                                key={chat.remitente_wa_id}
                                onClick={() => setSelectedLead(chat.remitente_wa_id)}
                                className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedLead === chat.remitente_wa_id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-gray-200 text-sm">{chat.remitente_wa_id}</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(chat.last_interaction).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-gray-400 text-sm">
                            No se encontraron chats
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="w-2/3 flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a]">
                {/* Chat Header */}
                <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm z-10">
                    {selectedLead ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <Users className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{selectedLead}</h4>
                                <p className={`text-xs ${status.color}`}>{status.text}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm">Selecciona una conversación</div>
                    )}
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedLead ? (
                        isLoadingConversation ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : conversation.length > 0 ? (
                            conversation.map((msg, idx) => {
                                const isOut = msg.sentido === 'out' || msg.sentido === 'OUT';
                                return (
                                    <div key={idx} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                                        <div className="flex flex-col items-end gap-1">
                                            <div
                                                className={`max-w-[80%] rounded-lg px-3 py-1.5 shadow-sm text-sm relative ${isOut
                                                    ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-white'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                                    }`}
                                            >
                                                <p className="pr-14 pb-1">{msg.mensaje_texto || msg.message}</p>
                                                <span className={`text-[10px] absolute bottom-1 right-2 ${isOut ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400'}`}>
                                                    {new Date(msg.fecha_mensaje).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {/* Toggle Switch para mensajes outbound */}
                                            {isOut && msg.id && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-gray-500 dark:text-gray-400">Manual</span>
                                                    <button
                                                        onClick={() => handleToggleManual(msg.id, msg.Manual)}
                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${msg.Manual ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${msg.Manual ? 'translate-x-5' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex justify-center items-center h-full text-gray-400 text-sm">
                                No hay mensajes en esta conversación.
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                            <MessageCircle className="w-16 h-16 opacity-20" />
                            <p>Selecciona un chat para comenzar a ver los mensajes</p>
                        </div>
                    )}
                </div>

                {/* Chat Input */}
                {selectedLead && (
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSendOutbound} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Escribe un mensaje..."
                                className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                value={outboundText}
                                onChange={(e) => setOutboundText(e.target.value)}
                                disabled={isSending}
                            />
                            <button
                                type="submit"
                                disabled={isSending || !outboundText.trim()}
                                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatsPage;
