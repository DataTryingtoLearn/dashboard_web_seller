import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/ui/StatCard';
import { Users, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 'Cargando...',
        contacted: '0',
        conversions: '0',
        avgTime: '0m'
    });
    const [weeklyData, setWeeklyData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                const [
                    totalRes,
                    contactedRes,
                    conversionsRes,
                    avgTimeRes,
                    weeklyRes,
                    recentRes
                ] = await Promise.all([
                    fetch('/api/leads/count'),
                    fetch('/api/leads/contacted'),
                    fetch('/api/leads/conversions'),
                    fetch('/api/leads/avg-time'),
                    fetch('/api/leads/weekly'),
                    fetch('/api/leads/recent')
                ]);

                const totalJson = await totalRes.json();
                const contactedJson = await contactedRes.json();
                const conversionsJson = await conversionsRes.json();
                const avgTimeJson = await avgTimeRes.json();
                const weeklyJson = await weeklyRes.json();
                const recentJson = await recentRes.json();

                setStats({
                    total: Number(totalJson?.data?.count ?? 0).toLocaleString(),
                    contacted: Number(contactedJson?.data?.count ?? 0).toLocaleString(),
                    conversions: Number(conversionsJson?.data?.count ?? 0).toLocaleString(),
                    avgTime: avgTimeJson?.data?.value || '0m'
                });

                if (weeklyJson.success && Array.isArray(weeklyJson.data)) {
                    setWeeklyData(weeklyJson.data);
                }

                if (recentJson.success && Array.isArray(recentJson.data)) {
                    setRecentActivity(recentJson.data);
                }

            } catch (error) {
            }
        };

        fetchAllStats();
    }, []);

    const handleViewConversation = (wa_id) => {
        if (!wa_id) return;
        navigate(`/chats?id=${wa_id}`);
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Resumen de tu actividad y leads gestionados.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Leads"
                    value={stats.total}
                    change="+12%"
                    trend="up"
                    icon={Users}
                />
                <StatCard
                    title="Leads Contactados"
                    value={stats.contacted}
                    change="+8%"
                    trend="up"
                    icon={MessageSquare}
                />
                <StatCard
                    title="Conversiones"
                    value={stats.conversions}
                    change="+25%"
                    trend="up"
                    icon={CheckCircle}
                />
                <StatCard
                    title="Tiempo Promedio"
                    value={stats.avgTime}
                    change="-2m"
                    trend="down"
                    icon={Clock}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Leads por Semana</h3>
                    <div className="h-[300px]">
                        {weeklyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#64748B"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#64748B"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                        contentStyle={{ backgroundColor: '#FFF', borderColor: '#E2E8F0', borderRadius: '8px' }}
                                    />
                                    <Bar
                                        dataKey="leads"
                                        fill="#3B82F6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                Sin datos suficientes para mostrar la gráfica
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Actividad Reciente</h3>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={activity.message}>
                                                {activity.message}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                                        </div>
                                    </div>
                                    {Number(user?.permission_level) > 1 && (
                                        <button
                                            onClick={() => handleViewConversation(activity.remitente_wa_id)}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20"
                                        >
                                            Ver
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                No hay actividad reciente
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
