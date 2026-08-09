import React from 'react';
import { Link } from '@inertiajs/react';
import { Eye, Edit2, Trash2, FileDown, Send, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';

const variantConfigs = {
    detail: {
        icon: Eye,
        label: 'Lihat Detail',
        className: 'text-gray-600 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 border-gray-200 dark:border-gray-700'
    },
    edit: {
        icon: Edit2,
        label: 'Edit Data',
        className: 'text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-gray-200 dark:border-gray-700'
    },
    export: {
        icon: FileDown,
        label: 'Cetak / Export PDF',
        className: 'text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border-gray-200 dark:border-gray-700'
    },
    delete: {
        icon: Trash2,
        label: 'Hapus Data',
        className: 'text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-gray-200 dark:border-gray-700'
    },
    submit: {
        icon: Send,
        label: 'Ajukan Dokumen',
        className: 'text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 border-teal-200 dark:border-teal-800'
    },
    approve: {
        icon: CheckCircle2,
        label: 'Proses Approval',
        className: 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800'
    }
};

export default function ActionButton({
    variant = 'detail',
    tooltip,
    onClick,
    href,
    target,
    rel,
    icon: CustomIcon,
    size = 'md', // 'sm' | 'md' | 'lg'
    className = '',
    disabled = false,
    children,
    ...props
}) {
    const config = variantConfigs[variant] || variantConfigs.detail;
    const IconComponent = CustomIcon || config.icon;
    const tooltipText = tooltip || config.label;

    const sizeClasses = {
        sm: 'w-7 h-7 p-1 text-xs',
        md: 'w-8 h-8 p-1.5 text-xs',
        lg: 'h-9 px-3 py-1.5 text-xs font-semibold gap-1.5'
    }[size] || 'w-8 h-8 p-1.5 text-xs';

    const baseStyle = `inline-flex items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${config.className} ${sizeClasses} ${className}`;

    const buttonContent = (
        <>
            <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-4 h-4'} />
            {children && <span>{children}</span>}
        </>
    );

    let element;
    if (href) {
        if (target === '_blank') {
            element = (
                <a href={href} target={target} rel={rel || 'noreferrer'} className={baseStyle} {...props}>
                    {buttonContent}
                </a>
            );
        } else {
            element = (
                <Link href={href} className={baseStyle} {...props}>
                    {buttonContent}
                </Link>
            );
        }
    } else {
        element = (
            <button type="button" onClick={onClick} disabled={disabled} className={baseStyle} {...props}>
                {buttonContent}
            </button>
        );
    }

    if (!tooltipText) return element;

    return (
        <TooltipProvider>
            <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                    {element}
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs font-medium bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 border-none shadow-md">
                    {tooltipText}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function ActionGroup({ children, className = '' }) {
    return (
        <div className={`flex items-center justify-center gap-1.5 ${className}`}>
            {children}
        </div>
    );
}
