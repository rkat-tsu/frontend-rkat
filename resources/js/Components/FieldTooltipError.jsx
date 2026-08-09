import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function FieldTooltipError({ message }) {
    if (!message) return null;
    return (
        <div className="absolute left-3 -bottom-8 z-30 flex items-center gap-1.5 px-3 py-1 bg-rose-600 dark:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xl animate-fade-in-up border border-rose-500/30">
            <div className="absolute -top-1 left-4 w-2.5 h-2.5 bg-rose-600 dark:bg-rose-700 rotate-45"></div>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}
