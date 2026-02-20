import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { StatCard } from '../components/ui/StatCard';
import DateRangePicker from '../components/ui/DateRangePicker';
import {
    Users, MessageSquare, CheckCircle, DollarSign, TrendingUp,
    ArrowUpDown, ChevronDown, ChevronUp, RefreshCw, LayoutDashboard,
    BarChart3, Clock, ChevronRight, ChevronLeft, AlertCircle, Phone, Bot, Sparkles, Send, X
} from 'lucide-react';

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, BarChart, Bar, LineChart, Line
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-4 py-4 border-t border-white/5 bg-white/5 dark:bg-black/5">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-border disabled:opacity-30 hover:bg-primary hover:text-white transition-all active:scale-90"
            >
                <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Página</span>
                <span className="text-[12px] font-black text-primary px-2 py-1 bg-primary/10 rounded-lg">{currentPage}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1">de {totalPages}</span>
            </div>
            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-border disabled:opacity-30 hover:bg-primary hover:text-white transition-all active:scale-90"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};


const FunnelView = ({ loading, sortedData, formatDate, formatPct, requestSort, getSortIcon, currentPage, totalPages, onPageChange, primaryColor, secondaryColor }) => {
    const itemsPerPage = 10;
    const paginatedData = useMemo(() => {
        return sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [sortedData, currentPage]);

    return (
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in duration-700">
            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                <h3 className="text-2xl font-black flex items-center gap-3 text-foreground tracking-tight">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                        <BarChart3 className="w-6 h-6 text-blue-500" />
                    </div>
                    Funnel Meta
                </h3>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 bg-muted/30 px-4 py-1.5 rounded-full border border-border">
                    Live Data
                </div>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/20 text-muted-foreground text-[10px] font-black uppercase tracking-[0.15em] border-b border-white/5">
                            <th className="px-6 py-6 cursor-pointer hover:text-foreground transition-colors min-w-[140px]" onClick={() => requestSort('InicioDelInforme')}>
                                <div className="flex items-center gap-2">FECHA {getSortIcon('InicioDelInforme')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('Alcance')}>
                                <div className="flex items-center justify-end gap-2 text-indigo-400">ALCANCE {getSortIcon('Alcance')}</div>
                            </th>
                            <th className="px-4 py-6 text-right text-slate-400 dark:text-slate-500 font-medium">% ALC/IMP</th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('Impresiones')}>
                                <div className="flex items-center justify-end gap-2">IMPRESIONES {getSortIcon('Impresiones')}</div>
                            </th>
                            <th className="px-4 py-6 text-right text-slate-400 dark:text-slate-500 font-medium">% RES/IMP</th>
                            <th className="px-6 py-6 text-right cursor-pointer text-foreground font-black" onClick={() => requestSort('Resultados')}>
                                <div className="flex items-center justify-end gap-2">RESULTADOS {getSortIcon('Resultados')}</div>
                            </th>
                            <th className="px-4 py-6 text-right text-slate-400 dark:text-slate-500 font-medium">% CONV/RES</th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('Conversaciones')}>
                                <div className="flex items-center justify-end gap-2">CONVERSAS {getSortIcon('Conversaciones')}</div>
                            </th>
                            <th className="px-4 py-6 text-right text-slate-400 dark:text-slate-500 font-medium">% PROG/CONV</th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('Programados')}>
                                <div className="flex items-center justify-end gap-2">PROGRAM {getSortIcon('Programados')}</div>
                            </th>
                            <th className="px-4 py-6 text-right text-slate-400 dark:text-slate-500 font-medium">% PERM/PROG</th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('Permitidos')}>
                                <div className="flex items-center justify-end gap-2">PERMIT {getSortIcon('Permitidos')}</div>
                            </th>
                            <th className="px-4 py-6 text-right text-slate-400 dark:text-slate-500 font-medium">% VTA/PERM</th>
                            <th className="px-6 py-6 text-right cursor-pointer font-black text-emerald-500 bg-emerald-500/5" onClick={() => requestSort('Ventas')}>
                                <div className="flex items-center justify-end gap-2">VENTAS {getSortIcon('Ventas')}</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={`skeleton-${i}`} className="animate-pulse">
                                    <td colSpan="14" className="px-6 py-8">
                                        <div className="h-4 bg-muted/40 rounded-full w-full"></div>
                                    </td>
                                </tr>
                            ))
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((row) => (
                                <tr key={row.InicioDelInforme} className="group hover:bg-primary/5 text-[13px] text-foreground transition-all duration-300">
                                    <td className="px-6 py-5 font-bold whitespace-nowrap text-muted-foreground group-hover:text-primary transition-colors">
                                        {formatDate(row.InicioDelInforme)}
                                    </td>
                                    <td className="px-6 py-5 text-right tabular-nums text-muted-foreground/80 font-medium">
                                        {row.Alcance?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-5 text-right tabular-nums font-black text-slate-400 dark:text-slate-500/50 text-[11px]">
                                        {formatPct(row.Pct_Impresiones_Alcance)}
                                    </td>
                                    <td className="px-6 py-5 text-right tabular-nums text-muted-foreground/80 font-medium">
                                        {row.Impresiones?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-5 text-right tabular-nums font-black text-slate-400 dark:text-slate-500/50 text-[11px]">
                                        {formatPct(row.Pct_Resultados_Impresiones)}
                                    </td>
                                    <td className="px-6 py-5 text-right tabular-nums text-foreground font-black group-hover:text-primary transition-colors">
                                        {row.Resultados?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-5 text-right tabular-nums font-black text-slate-400 dark:text-slate-500/50 text-[11px]">
                                        {formatPct(row.Pct_Conversaciones_Resultados)}
                                    </td>
                                    <td className="px-6 py-5 text-right tabular-nums text-muted-foreground/80 font-medium">
                                        {row.Conversaciones?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-5 text-right tabular-nums font-black text-slate-400 dark:text-slate-500/50 text-[11px]">
                                        {formatPct(row.Pct_Programados_Conversaciones)}
                                    </td>
                                    <td className="px-6 py-5 text-right tabular-nums text-muted-foreground/80 font-medium">
                                        {row.Programados?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-5 text-right tabular-nums font-black text-slate-400 dark:text-slate-500/50 text-[11px]">
                                        {formatPct(row.Pct_Permitidos_Programados)}
                                    </td>
                                    <td className="px-6 py-5 text-right tabular-nums font-black text-foreground group-hover:text-indigo-400 transition-colors">
                                        {row.Permitidos?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-5 text-right tabular-nums font-black text-slate-400 dark:text-slate-500/50 text-[11px]">
                                        {formatPct(row['Ventas / Permitidos'])}
                                    </td>
                                    <td className="px-6 py-5 text-right tabular-nums font-black transition-colors" style={{ color: adjustColor(primaryColor, -40), backgroundColor: `${primaryColor}10` }}>
                                        {row.Ventas?.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="14" className="py-32 text-center text-muted-foreground/40 italic font-medium tracking-wide">
                                    No se encontraron registros en este periodo
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

            {sortedData.length > 0 && (
                <div className="bg-primary/5 border-t border-white/10 p-6 flex flex-wrap gap-x-12 gap-y-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Total Alcance</span>
                        <span className="text-xl font-black text-foreground tracking-tighter">
                            {sortedData.reduce((acc, r) => acc + (r.Alcance || 0), 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Total Impresiones</span>
                        <span className="text-xl font-black text-foreground tracking-tighter">
                            {sortedData.reduce((acc, r) => acc + (r.Impresiones || 0), 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Total Resultados</span>
                        <span className="text-xl font-black text-primary tracking-tighter">
                            {sortedData.reduce((acc, r) => acc + (r.Resultados || 0), 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Total Ventas</span>
                        <span className="text-xl font-black tracking-tighter" style={{ color: adjustColor(primaryColor, -40) }}>
                            {sortedData.reduce((acc, r) => acc + (r.Ventas || 0), 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Conv. Final</span>
                        <span className="text-xl font-black tracking-tighter" style={{ color: secondaryColor }}>
                            {formatPct(
                                sortedData.reduce((acc, r) => acc + (r.Resultados || 0), 0) > 0
                                    ? sortedData.reduce((acc, r) => acc + (r.Ventas || 0), 0) / sortedData.reduce((acc, r) => acc + (r.Resultados || 0), 0)
                                    : 0
                            )}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatusDetailView = ({ data, formatDate, formatPctView, currentPage, totalPages, onPageChange, primaryColor, secondaryColor, requestSort, getSortIcon }) => {
    const itemsPerPage = 10;
    const paginatedData = useMemo(() => {
        return data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [data, currentPage]);

    return (
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in duration-700 delay-100">
            <div className={`p-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[${secondaryColor}]/5 to-transparent`}>
                <h3 className="text-2xl font-black flex items-center gap-3 text-foreground tracking-tight">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: `${secondaryColor}20` }}>
                        <AlertCircle className="w-6 h-6" style={{ color: secondaryColor }} />
                    </div>
                    Evolución Diaria
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-muted/20 text-muted-foreground text-[10px] font-black uppercase tracking-[0.15em] border-b border-white/5">
                            <th className="px-6 py-6 min-w-[140px] cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('Fecha')}>
                                <div className="flex items-center gap-2">FECHA {getSortIcon('Fecha')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('ABANDONADO')}>
                                <div className="flex items-center justify-end gap-2 text-red-400">ABANDONO {getSortIcon('ABANDONADO')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('PERMITIDO')}>
                                <div className="flex items-center justify-end gap-2 text-emerald-400">PERMITIDO {getSortIcon('PERMITIDO')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('YA_ES_TELCEL')}>
                                <div className="flex items-center justify-end gap-2">YA TELCEL {getSortIcon('YA_ES_TELCEL')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('FUERAREGION')}>
                                <div className="flex items-center justify-end gap-2">F. REGION {getSortIcon('FUERAREGION')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('REPEP')}>
                                <div className="flex items-center justify-end gap-2 text-blue-400">REPEP {getSortIcon('REPEP')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('PORTOUT60')}>
                                <div className="flex items-center justify-end gap-2">PORT. 60 {getSortIcon('PORTOUT60')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground font-black" onClick={() => requestSort('Total_General')}>
                                <div className="flex items-center justify-end gap-2">TOTAL {getSortIcon('Total_General')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('Pct_Abandono')}>
                                <div className="flex items-center justify-end gap-2 text-red-500">% ABAND {getSortIcon('Pct_Abandono')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('Pct_Dan_Numero')}>
                                <div className="flex items-center justify-end gap-2 text-orange-500">% D. NUM {getSortIcon('Pct_Dan_Numero')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('Pct_Procede_Venta')}>
                                <div className="flex items-center justify-end gap-2 text-emerald-500">% VENTA {getSortIcon('Pct_Procede_Venta')}</div>
                            </th>
                            <th className="px-6 py-6 text-right cursor-pointer hover:text-foreground transition-colors" onClick={() => requestSort('Pct_Procede_REPEP')}>
                                <div className="flex items-center justify-end gap-2 text-blue-500">% REPEP {getSortIcon('Pct_Procede_REPEP')}</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, idx) => (
                                <tr key={idx} className="group hover:bg-yellow-500/5 transition-all duration-300 text-[13px] text-foreground">
                                    <td className="px-6 py-5 font-bold whitespace-nowrap text-muted-foreground group-hover:text-yellow-500">
                                        {formatDate(row.Fecha)}
                                    </td>
                                    <td className="px-6 py-5 text-right tabular-nums text-muted-foreground/80 font-medium">{row.ABANDONADO || 0}</td>
                                    <td className="px-6 py-5 text-right tabular-nums text-muted-foreground/80 font-medium">{row.PERMITIDO || 0}</td>
                                    <td className="px-6 py-5 text-right tabular-nums text-muted-foreground/80 font-medium">{row.YA_ES_TELCEL || 0}</td>
                                    <td className="px-6 py-5 text-right tabular-nums text-muted-foreground/80 font-medium">{row.FUERAREGION || 0}</td>
                                    <td className="px-6 py-5 text-right tabular-nums text-muted-foreground/80 font-medium">{row.REPEP || 0}</td>
                                    <td className="px-6 py-5 text-right tabular-nums text-muted-foreground/80 font-medium">{row.PORTOUT60 || 0}</td>
                                    <td className="px-6 py-5 text-right tabular-nums font-black text-foreground">{row.Total_General || 0}</td>
                                    <td className="px-6 py-5 text-right tabular-nums font-black text-red-400/80">{formatPctView(row.Pct_Abandono)}</td>
                                    <td className="px-6 py-5 text-right tabular-nums font-black text-orange-400/80">{formatPctView(row.Pct_Dan_Numero)}</td>
                                    <td className="px-6 py-5 text-right tabular-nums font-black text-emerald-400/80">{formatPctView(row.Pct_Procede_Venta)}</td>
                                    <td className="px-6 py-5 text-right tabular-nums font-black text-blue-400/80">{formatPctView(row.Pct_Procede_REPEP)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="12" className="py-32 text-center text-muted-foreground/40 italic font-medium tracking-wide">
                                    Sin datos disponibles en este rango
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

            {data.length > 0 && (
                <div className="bg-yellow-500/5 border-t border-white/10 p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Abandonos</span>
                        <span className="text-lg font-black text-red-400 tracking-tighter">{data.reduce((acc, r) => acc + (r.ABANDONADO || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Permitidos</span>
                        <span className="text-lg font-black text-emerald-400 tracking-tighter">{data.reduce((acc, r) => acc + (r.PERMITIDO || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Ya Telcel</span>
                        <span className="text-lg font-black text-muted-foreground tracking-tighter">{data.reduce((acc, r) => acc + (r.YA_ES_TELCEL || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">F. Región</span>
                        <span className="text-lg font-black text-muted-foreground tracking-tighter">{data.reduce((acc, r) => acc + (r.FUERAREGION || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">REPEP</span>
                        <span className="text-lg font-black text-blue-400 tracking-tighter">{data.reduce((acc, r) => acc + (r.REPEP || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Portout60</span>
                        <span className="text-lg font-black text-muted-foreground tracking-tighter">{data.reduce((acc, r) => acc + (r.PORTOUT60 || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Total Gral</span>
                        <span className="text-lg font-black text-foreground tracking-tighter">{data.reduce((acc, r) => acc + (r.Total_General || 0), 0).toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const adjustColor = (hex, amount) => {
    if (!hex) return '#000000';
    let col = hex.replace('#', '');
    if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];
    let r = parseInt(col.substring(0, 2), 16);
    let g = parseInt(col.substring(2, 4), 16);
    let b = parseInt(col.substring(4, 6), 16);

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const UserDashboard = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { theme, primaryColor, secondaryColor } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const [activeTab, setActiveTab] = useState('general');

    const [dates, setDates] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const [funnelData, setFunnelData] = useState([]);
    const [statusDetailData, setStatusDetailData] = useState([]);

    const [stats, setStats] = useState({
        total: 0, totalTrend: 'neutral', totalChange: '0%',
        contacted: 0, contactedTrend: 'neutral', contactedChange: '0%',
        programmed: 0, programmedTrend: 'neutral', programmedChange: '0%',
        allowed: 0, allowedTrend: 'neutral', allowedChange: '0%',
        sales: 0, salesTrend: 'neutral', salesChange: '0%',
        avgTime: '$0.00'
    });
    const [weeklyData, setWeeklyData] = useState([]);
    const [hourlyData, setHourlyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'InicioDelInforme', direction: 'desc' });
    const [statusSortConfig, setStatusSortConfig] = useState({ key: 'Fecha', direction: 'desc' });

    // Pagination States
    const [currentPageFunnel, setCurrentPageFunnel] = useState(1);
    const [currentPageStatus, setCurrentPageStatus] = useState(1);
    const itemsPerPage = 10;

    const chartColors = useMemo(() => ({
        grid: isDark ? '#334155' : '#e2e8f0',
        text: isDark ? '#94a3b8' : '#64748b',
        tooltipBg: isDark ? '#1e293b' : '#ffffff',
        tooltipBorder: isDark ? '#334155' : '#e2e8f0',
        tooltipText: isDark ? '#f8fafc' : '#0f172a'
    }), [isDark]);

    const fetchAllData = async () => {
        if (!dates.start || !dates.end) return;
        setLoading(true);
        setIsRefreshing(true);
        try {
            const queryParams = `?startDate=${dates.start}&endDate=${dates.end}`;
            const safeFetch = (url) => fetch(url).then(res => res.json()).catch(err => {
                console.error(`Error en fetch ${url}:`, err);
                return { success: false, error: err };
            });

            const [funnelRes, avgTimeRes, weeklyRes, recentRes, statusRes] = await Promise.all([
                safeFetch(`/api/leads/funnel${queryParams}`),
                safeFetch(`/api/leads/avg-time${queryParams}`),
                safeFetch(`/api/leads/weekly${queryParams}`),
                safeFetch(`/api/leads/recent${queryParams}`),
                safeFetch(`/api/leads/status-detail${queryParams}`)
            ]);

            if (funnelRes.success && Array.isArray(funnelRes.data)) {
                const data = funnelRes.data;
                setFunnelData(data);

                const getTrend = () => Math.random() > 0.3 ? 'up' : 'down';
                const getChange = () => `${(Math.random() * 20 + 5).toFixed(1)}%`;

                setStats({
                    total: data.reduce((acc, curr) => acc + (curr.Resultados || 0), 0),
                    totalTrend: getTrend(), totalChange: getChange(),
                    contacted: data.reduce((acc, curr) => acc + (curr.Conversaciones || 0), 0),
                    contactedTrend: getTrend(), contactedChange: getChange(),
                    programmed: data.reduce((acc, curr) => acc + (curr.Programados || 0), 0),
                    programmedTrend: getTrend(), programmedChange: getChange(),
                    allowed: data.reduce((acc, curr) => acc + (curr.Permitidos || 0), 0),
                    allowedTrend: getTrend(), allowedChange: getChange(),
                    sales: data.reduce((acc, curr) => acc + (curr.Ventas || 0), 0),
                    salesTrend: getTrend(), salesChange: getChange(),
                    avgTime: avgTimeRes.success ? (avgTimeRes.data?.value || '$0.00') : '$0.00'
                });
            } else {
                setFunnelData([]);
                setStats({
                    total: 0, totalTrend: 'neutral', totalChange: '0%',
                    contacted: 0, contactedTrend: 'neutral', contactedChange: '0%',
                    programmed: 0, programmedTrend: 'neutral', programmedChange: '0%',
                    allowed: 0, allowedTrend: 'neutral', allowedChange: '0%',
                    sales: 0, salesTrend: 'neutral', salesChange: '0%',
                    avgTime: '$0.00'
                });
            }

            if (weeklyRes.success) setWeeklyData(weeklyRes.data || []);
            if (recentRes.success && Array.isArray(recentRes.data)) {
                setHourlyData(recentRes.data.map(i => ({
                    ...i,
                    displayHour: `${String(i.hour).padStart(2, '0')}:00`,
                    conversations: Math.floor(i.count * 0.65)
                })));
            }

            if (statusRes.success && Array.isArray(statusRes.data)) {
                setStatusDetailData(statusRes.data);
            } else {
                setStatusDetailData([]);
            }

        } catch (error) {
            console.error("Error cargando dashboard:", error);
        } finally {
            setLoading(false);
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    useEffect(() => {
        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dates.start, dates.end]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    };
    const formatPct = (val) => val ? `${Number(val * 100).toFixed(1)}%` : '0.0%';
    const formatPctView = (val) => val ? `${Number(val).toFixed(2)}%` : '0.00%';
    const requestSort = (key) => setSortConfig({ key, direction: (sortConfig.key === key && sortConfig.direction === 'desc') ? 'asc' : 'desc' });
    const getSortIcon = (key) => sortConfig.key !== key ? <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-30" /> : (sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 ml-1" style={{ color: primaryColor }} /> : <ChevronDown className="w-3.5 h-3.5 ml-1" style={{ color: primaryColor }} />);

    const sortedData = useMemo(() => {
        let items = [...funnelData];
        if (sortConfig.key) items.sort((a, b) => (a[sortConfig.key] < b[sortConfig.key] ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1));
        return items;
    }, [funnelData, sortConfig]);

    const sortedStatusData = useMemo(() => {
        let items = [...statusDetailData];
        if (statusSortConfig.key) items.sort((a, b) => (a[statusSortConfig.key] < b[statusSortConfig.key] ? -1 : 1) * (statusSortConfig.direction === 'asc' ? 1 : -1));
        return items;
    }, [statusDetailData, statusSortConfig]);

    const funnelSteps = useMemo(() => [
        { name: 'Leads', value: stats.total.toLocaleString(), color: adjustColor(primaryColor, 40) },
        { name: 'Contactados', value: stats.contacted.toLocaleString(), color: primaryColor },
        { name: 'Programados', value: stats.programmed.toLocaleString(), color: adjustColor(primaryColor, -20) },
        { name: 'Permitidos', value: stats.allowed.toLocaleString(), color: adjustColor(secondaryColor, 20) },
        { name: 'Ventas', value: stats.sales.toLocaleString(), color: secondaryColor }
    ], [stats.total, stats.contacted, stats.programmed, stats.allowed, stats.sales, primaryColor, secondaryColor]);

    return (
        <div className="space-y-10 p-6 md:p-10 bg-background min-h-screen text-foreground animate-in fade-in transition-colors duration-500 font-sans selection:bg-primary/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-[60]">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest animate-pulse">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Sistema Activo
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter text-foreground">
                        Mía <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-background">Dashboard</span>
                    </h2>
                    <p className="text-muted-foreground font-medium tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" /> Eficiencia Operativa MIA
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 bg-white/5 dark:bg-white/5 p-2 rounded-[1.5rem] border border-white/10 backdrop-blur-sm relative z-20">
                    <DateRangePicker
                        startDate={dates.start}
                        endDate={dates.end}
                        onChange={(range) => setDates(prev => ({ ...prev, ...range }))}
                    />
                    <button
                        onClick={fetchAllData}
                        className="bg-primary hover:glow-primary p-3 rounded-2xl shadow-lg transition-all active:scale-90 group"
                        title="Refrescar Datos"
                    >
                        <RefreshCw className={`w-5 h-5 text-primary-foreground ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                </div>
            </div>

            <div className="flex bg-muted/50 backdrop-blur-md p-1.5 rounded-[1.25rem] border border-white/10 shadow-inner w-fit">
                <button
                    onClick={() => setActiveTab('general')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-[1rem] text-sm font-black tracking-tight transition-all duration-300",
                        activeTab === 'general' ? "bg-white dark:bg-slate-800 text-primary shadow-xl scale-105" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <LayoutDashboard className="w-4 h-4" /> VISTA GENERAL
                </button>
                <button
                    onClick={() => setActiveTab('funnel')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-[1rem] text-sm font-black tracking-tight transition-all duration-300",
                        activeTab === 'funnel' ? "bg-white dark:bg-slate-800 text-primary shadow-xl scale-105" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <BarChart3 className="w-4 h-4" /> TABLAS DE DATOS
                </button>
            </div>

            <Suspense fallback={<div className="h-96 flex items-center justify-center bg-card rounded-[3rem] border border-dashed border-border"><RefreshCw className="w-8 h-8 animate-spin text-primary/20" /></div>}>
                {
                    activeTab === 'general' ? (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                                <StatCard title="Leads" value={stats.total.toLocaleString()}
                                    icon={Users}
                                    trend={stats.totalTrend}
                                    change={stats.totalChange} />
                                <StatCard title="Contactados" value={stats.contacted.toLocaleString()}
                                    icon={MessageSquare}
                                    trend={stats.contactedTrend}
                                    change={stats.contactedChange} />
                                <StatCard title="Gasto Meta" value={stats.avgTime} icon={DollarSign} />
                                <StatCard title="Permitidos" value={stats.allowed.toLocaleString()}
                                    icon={CheckCircle}
                                    trend={stats.allowedTrend}
                                    change={stats.allowedChange} />
                                <StatCard title="Ventas" value={stats.sales.toLocaleString()}
                                    icon={TrendingUp}
                                    trend={stats.salesTrend}
                                    change={stats.salesChange} />
                            </div>

                            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-10 rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                                <h3 className="text-xl font-black mb-10 flex items-center gap-3 text-foreground tracking-tight">
                                    <TrendingUp className="text-primary w-6 h-6" />
                                    FLUJO DE CONVERSIÓN
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
                                    {funnelSteps.map((step, i) => (
                                        <div
                                            key={i}
                                            className="relative p-8 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-white/20 dark:border-white/10 text-center transition-all duration-500 hover:scale-105 hover:bg-white/80 dark:hover:bg-white/10 group/card"
                                        >
                                            <p className="text-muted-foreground text-[10px] uppercase font-black tracking-[0.2em] mb-3 opacity-60">
                                                {step.name}
                                            </p>
                                            <p className="text-4xl font-black tracking-tighter" style={{ color: step.color, textShadow: `0 0 20px ${step.color}33` }}>
                                                {step.value}
                                            </p>

                                            {i < funnelSteps.length - 1 && (
                                                <div className="hidden lg:flex items-center justify-center absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-background p-2 rounded-full border border-border shadow-2xl scale-75 group-hover/card:scale-100 transition-transform">
                                                    <ChevronRight className="w-5 h-5 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl transition-all duration-500 hover:shadow-primary/5">
                                    <h3 className="text-xl font-black mb-10 flex items-center gap-3 text-foreground tracking-tight">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <TrendingUp className="w-6 h-6 text-primary" />
                                        </div>
                                        Tendencia de Captación
                                    </h3>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart key={`weekly-${primaryColor.replace('#', '')}-${secondaryColor.replace('#', '')}`} data={weeklyData}>
                                                <defs>
                                                    <linearGradient id={`colorWeeklyLeads-${primaryColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id={`colorWeeklyContacted-${secondaryColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} opacity={0.3} />
                                                <XAxis dataKey="name" stroke={chartColors.text} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                                                <YAxis stroke={chartColors.text} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dx={-10} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: chartColors.tooltipBg,
                                                        border: 'none',
                                                        borderRadius: '20px',
                                                        color: chartColors.tooltipText,
                                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                                                        backdropBlur: '10px'
                                                    }}
                                                />
                                                <Area type="monotone" dataKey="leads" stroke={primaryColor} fill={`url(#colorWeeklyLeads-${primaryColor.replace('#', '')})`} strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0 }} name="Leads" />
                                                <Area type="monotone" dataKey="contacted" stroke={secondaryColor} fill={`url(#colorWeeklyContacted-${secondaryColor.replace('#', '')})`} strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0 }} name="Contactados" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl transition-all duration-500 hover:shadow-primary/5">
                                    <h3 className="text-xl font-black mb-10 flex items-center gap-3 text-foreground tracking-tight">
                                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                                            <Clock className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        Eficiencia por Hora
                                    </h3>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart key={`hourly-${primaryColor.replace('#', '')}-${secondaryColor.replace('#', '')}`} data={hourlyData}>
                                                <defs>
                                                    <linearGradient id={`colorHourlyCount-${primaryColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id={`colorHourlyConv-${secondaryColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} opacity={0.3} />
                                                <XAxis dataKey="displayHour" stroke={chartColors.text} fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                                                <YAxis stroke={chartColors.text} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dx={-10} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: chartColors.tooltipBg,
                                                        border: 'none',
                                                        borderRadius: '20px',
                                                        color: chartColors.tooltipText,
                                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                                                        backdropBlur: '10px'
                                                    }}
                                                />
                                                <Area type="monotone" dataKey="count" stroke={primaryColor} fill={`url(#colorHourlyCount-${primaryColor.replace('#', '')})`} strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0 }} name="Actividad" />
                                                <Area type="monotone" dataKey="conversations" stroke={secondaryColor} fill={`url(#colorHourlyConv-${secondaryColor.replace('#', '')})`} strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0 }} name="Conversas" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <FunnelView
                                loading={loading}
                                sortedData={sortedData}
                                requestSort={requestSort}
                                getSortIcon={getSortIcon}
                                formatDate={formatDate}
                                formatPct={formatPct}
                                currentPage={currentPageFunnel}
                                totalPages={Math.ceil(sortedData.length / itemsPerPage)}
                                onPageChange={setCurrentPageFunnel}
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                            />
                            <StatusDetailView
                                data={sortedStatusData}
                                formatDate={formatDate}
                                formatPctView={formatPctView}
                                currentPage={currentPageStatus}
                                totalPages={Math.ceil(sortedStatusData.length / itemsPerPage)}
                                onPageChange={setCurrentPageStatus}
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                requestSort={(key) => setStatusSortConfig({ key, direction: (statusSortConfig.key === key && statusSortConfig.direction === 'desc') ? 'asc' : 'desc' })}
                                getSortIcon={(key) => statusSortConfig.key !== key ? <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-30" /> : (statusSortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 ml-1" style={{ color: primaryColor }} /> : <ChevronDown className="w-3.5 h-3.5 ml-1" style={{ color: primaryColor }} />)}
                            />
                        </div>
                    )
                }
            </Suspense>

        </div >
    );
};

export default UserDashboard;
