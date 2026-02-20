import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

const DateRangePicker = ({ startDate, endDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const containerRef = useRef(null);
    const { theme } = useTheme();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to get days in month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Helper to get day of week (0 = Sunday, but we want 0 = Monday for rendering if desired, normally calendar starts Sunday)
    // Let's stick to standard Sunday start for simplicity or Monday if preferred in locale.
    // Spanish calendars often start on Monday. Let's try Monday start.
    const getFirstDayOfMonth = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // 0=Sun -> 6, 1=Mon -> 0
    };

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day) => {
        const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Normalize to YYYY-MM-DD string to match existing app logic and avoid timezone issues
        // We use local date string logic
        const clickedDateStr = new Date(clickedDate.getTime() - (clickedDate.getTimezoneOffset() * 60000))
            .toISOString().split('T')[0];

        if (!startDate || (startDate && endDate)) {
            // New range start
            onChange({ start: clickedDateStr, end: '' });
        } else {
            // New range end
            // Ensure start is before end
            if (clickedDateStr < startDate) {
                onChange({ start: clickedDateStr, end: startDate });
            } else {
                onChange({ start: startDate, end: clickedDateStr });
            }
            setIsOpen(false); // Auto close on selection complete? Maybe nice.
        }
    };

    const isSelected = (day) => {
        if (!startDate) return false;
        const currentString = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
            .toLocaleDateString('en-CA'); // YYYY-MM-DD format roughly

        // safer string comparison construction
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const dStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        return startDate === dStr || endDate === dStr;
    };

    const isInRange = (day) => {
        if (!startDate || !endDate) return false;
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const dStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        return dStr > startDate && dStr < endDate;
    };

    // Render logic
    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    // Fill empty slots for start of month
    const blanks = Array(startDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    };

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 text-sm font-medium hover:border-primary/50 transition-colors shadow-sm min-w-[200px]"
            >
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                    {startDate ? formatDateDisplay(startDate) : 'Inicio'}
                    {' - '}
                    {endDate ? formatDateDisplay(endDate) : 'Fin'}
                </span>
            </button>

            {/* Calendar Popover */}
            {isOpen && (
                <div className="absolute top-full mt-2 right-0 z-[999] bg-card border border-border rounded-xl shadow-2xl p-4 w-[300px] animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-muted rounded-full text-foreground">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-foreground capitalize">
                            {months[currentMonth]} {currentYear}
                        </span>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-muted rounded-full text-foreground">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-muted-foreground py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {blanks.map((_, i) => (
                            <div key={`blank-${i}`} className="p-2"></div>
                        ))}
                        {days.map(day => {
                            const isSel = isSelected(day);
                            const inRange = isInRange(day);

                            // Check if today
                            const today = new Date();
                            const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all mx-auto",
                                        isSel
                                            ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 scale-110"
                                            : inRange
                                                ? "bg-primary/10 text-primary font-medium rounded-none w-full"
                                                : "text-foreground hover:bg-muted hover:text-primary",
                                        !isSel && !inRange && isToday && "border border-primary text-primary font-bold"
                                    )}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer / Clear */}
                    <div className="flex justify-end mt-4 pt-3 border-t border-border">
                        <button
                            onClick={() => { onChange({ start: '', end: '' }); setIsOpen(false); }}
                            className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Limpiar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
