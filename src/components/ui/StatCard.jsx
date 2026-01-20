import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({ title, value, change, trend, icon: Icon, className }) => {
    return (
        <div className={cn("p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700", className)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{value}</h3>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
            </div>
            {(change || trend) && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={cn(
                        "flex items-center font-medium",
                        trend === 'up' ? "text-green-600" : "text-red-500"
                    )}>
                        {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                        {change}
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">vs mes anterior</span>
                </div>
            )}
        </div>
    );
};
