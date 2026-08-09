import React from 'react';
import {
    Clock, Send, CheckCircle2, AlertTriangle, XCircle, Wallet, FileText, Check, ShieldAlert, Sparkles
} from 'lucide-react';

/**
 * Universal StatusBadge Component for RKAT, Pencairan, LPJ, and Master Data Statuses.
 */
export default function StatusBadge({
    status = '',
    size = 'md',
    showIcon = true,
    className = ''
}) {
    if (!status) return null;

    const normalizedStatus = String(status).toLowerCase().trim().replace(/_/g, ' ');

    let label = status;
    let colorStyle = 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    let Icon = Clock;

    // 1. DRAFT STATUS
    if (normalizedStatus.includes('draft')) {
        label = 'Draft';
        colorStyle = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800';
        Icon = FileText;
    }
    // 2. DIAJUKAN / MENUNGGU PERSETUJUAN STATUS
    else if (
        normalizedStatus.includes('diajukan') ||
        normalizedStatus.includes('menunggu') ||
        normalizedStatus.includes('proses')
    ) {
        label = status.replace(/_/g, ' ');
        colorStyle = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50';
        Icon = Send;
    }
    // 3. DISETUJUI STATUS
    else if (
        normalizedStatus.includes('disetujui') ||
        normalizedStatus.includes('approved') ||
        normalizedStatus.includes('siap cair')
    ) {
        label = status.replace(/_/g, ' ');
        colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/50';
        Icon = CheckCircle2;
    }
    // 4. DICAIRKAN / SELESAI STATUS
    else if (
        normalizedStatus.includes('dicairkan') ||
        normalizedStatus.includes('selesai') ||
        normalizedStatus.includes('cair')
    ) {
        label = status.replace(/_/g, ' ');
        colorStyle = 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-900/50';
        Icon = Wallet;
    }
    // 5. REVISI STATUS
    else if (
        normalizedStatus.includes('revisi') ||
        normalizedStatus.includes('perlu revisi')
    ) {
        label = 'Revisi';
        colorStyle = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/50';
        Icon = AlertTriangle;
    }
    // 6. DITOLAK STATUS
    else if (
        normalizedStatus.includes('ditolak') ||
        normalizedStatus.includes('rejected')
    ) {
        label = 'Ditolak';
        colorStyle = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/50';
        Icon = XCircle;
    }
    // 7. AKTIF / NON-AKTIF STATUS
    else if (normalizedStatus === '1' || normalizedStatus === 'aktif' || normalizedStatus === 'active' || normalizedStatus === 'true') {
        label = 'Aktif';
        colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/50';
        Icon = Check;
    }
    else if (normalizedStatus === '0' || normalizedStatus === 'non-aktif' || normalizedStatus === 'inactive' || normalizedStatus === 'false') {
        label = 'Non-Aktif';
        colorStyle = 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        Icon = XCircle;
    }

    // Size variations
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[11px] font-medium gap-1 rounded-md',
        md: 'px-2.5 py-1 text-xs font-semibold gap-1.5 rounded-lg',
        lg: 'px-3.5 py-1.5 text-sm font-bold gap-2 rounded-xl'
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 16
    };

    return (
        <span
            className={`inline-flex items-center justify-center border transition-all duration-150 whitespace-nowrap shadow-2xs ${sizeClasses[size] || sizeClasses.md} ${colorStyle} ${className}`}
        >
            {showIcon && <Icon size={iconSizes[size] || 14} className="flex-shrink-0" />}
            <span className="capitalize">{label}</span>
        </span>
    );
}
