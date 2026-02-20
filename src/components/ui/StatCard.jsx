import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';

export const StatCard = ({ title, value, change, trend, icon: Icon, className }) => {
    return (
        <div className={cn(
            "p-6 rounded-3xl border transition-all duration-300 group hover:scale-[1.03] active:scale-95 cursor-default",
            "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/20 dark:border-white/10 shadow-xl hover:shadow-primary/10",
            className
        )}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">{title}</p>
                    <h3 className="text-3xl font-black tracking-tight text-foreground tabular-nums">{value}</h3>
                </div>
                <div className="relative group-hover:rotate-12 transition-transform duration-500">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-3 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-transparent rounded-2xl border border-primary/20">
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                </div>
            </div>
            {/* {(change || trend) && (
                <div className="mt-6 flex items-center gap-2">
                    <span className={cn(
                        "flex items-center font-bold px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider",
                        trend === 'up' ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" :
                            trend === 'down' ? "text-red-500 bg-red-500/10 border border-red-500/20" :
                                "text-muted-foreground bg-muted/50 border border-border"
                    )}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> :
                            trend === 'down' ? <ArrowDownRight className="w-3 h-3 mr-1" /> : null}
                        {change}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tight">vs periodo anterior</span>
                </div>
            )} */}
        </div>
    );
};
