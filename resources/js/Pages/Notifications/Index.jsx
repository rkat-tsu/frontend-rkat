import React, { useMemo, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AlertCircle, Bell, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink } from 'lucide-react';

const formatStatus = (notification) => {
    if (notification.progress && !['Disetujui_Final', 'Disetujui', 'Ditolak', 'Revisi'].includes(notification.status)) {
        return `Menunggu ${notification.progress}`;
    }
    const labels = {
        Draft: 'Draft', Diajukan: 'Sedang diproses', Submission: 'Sedang diproses',
        Disetujui: 'Disetujui', Disetujui_Final: 'Disetujui', Approved: 'Disetujui',
        Ditolak: 'Ditolak', Revisi: 'Perlu revisi',
    };
    return labels[notification.status] || String(notification.status || 'Sedang diproses').replace(/_/g, ' ');
};

const dateLabel = (date) => date
    ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

function Index() {
    const { approvalNotifications = [], documentNotifications = [], approvalNotificationCount = approvalNotifications.length } = usePage().props;
    const [tab, setTab] = useState('pending');
    const [page, setPage] = useState(1);
    const rows = useMemo(() => (tab === 'pending' ? approvalNotifications : documentNotifications)
        .slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)), [tab, approvalNotifications, documentNotifications]);
    const pageSize = 20;
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);

    return (
        <>
            <Head title="Notifikasi" />
            <div className="w-full max-w-none space-y-6 py-6 px-2 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifikasi Dokumen</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tugas persetujuan dan progress dokumen terbaru Anda.</p>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={() => { setTab('pending'); setPage(1); }} className={`flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold ${tab === 'pending' ? 'border-b-2 border-teal-600 text-teal-700 dark:text-teal-300' : 'text-gray-500 dark:text-gray-400'}`}>
                            <AlertCircle size={16} /> Perlu diproses <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">{approvalNotificationCount}</span>
                        </button>
                        <button type="button" onClick={() => { setTab('history'); setPage(1); }} className={`flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold ${tab === 'history' ? 'border-b-2 border-teal-600 text-teal-700 dark:text-teal-300' : 'text-gray-500 dark:text-gray-400'}`}>
                            <Clock3 size={16} /> Riwayat <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">{documentNotifications.length}</span>
                        </button>
                    </div>

                    {rows.length ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {visibleRows.map((notification) => {
                                const isPending = tab === 'pending';
                                const isFinal = ['Disetujui', 'Disetujui_Final', 'Approved'].includes(notification.status);
                                return (
                                    <div key={notification.id} className="flex items-start gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40 sm:p-5">
                                        <span className="mt-1 shrink-0">
                                            {isPending ? <AlertCircle size={19} className="text-rose-500" /> : isFinal ? <CheckCircle2 size={19} className="text-emerald-500" /> : <Bell size={19} className="text-blue-500" />}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-gray-900 dark:text-white">{notification.title}</p>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notification.type} · {isPending ? `Perlu diproses${notification.progress ? ` · ${notification.progress}` : ''}` : formatStatus(notification)}</p>
                                            {notification.date && <p className="mt-1 text-xs text-gray-400">{dateLabel(notification.date)}</p>}
                                        </div>
                                        <Link href={notification.url} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-teal-300 hover:text-teal-700 dark:border-gray-600 dark:text-gray-200 dark:hover:text-teal-300">
                                            {isPending ? 'Proses' : 'Buka'} <ExternalLink size={13} />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="px-6 py-16 text-center">
                            {tab === 'pending' ? <CheckCircle2 className="mx-auto mb-3 text-emerald-500" size={32} /> : <Bell className="mx-auto mb-3 text-gray-400" size={32} />}
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{tab === 'pending' ? 'Tidak ada dokumen yang perlu diproses.' : 'Belum ada riwayat dokumen.'}</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Notifikasi dokumen akan tampil di sini.</p>
                        </div>
                    )}
                    {pageCount > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Halaman {page} dari {pageCount} · {rows.length} notifikasi</span>
                            <div className="flex gap-2">
                                <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"><ChevronLeft size={14} /> Sebelumnya</button>
                                <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40 dark:border-gray-600 dark:text-gray-200">Berikutnya <ChevronRight size={14} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => (
    <AuthenticatedLayout
        header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Notifikasi</h2>}
    >
        {page}
    </AuthenticatedLayout>
);

export default Index;
