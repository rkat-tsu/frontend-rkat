import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FieldTooltipError from '@/Components/FieldTooltipError';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Index({ auth, options = [] }) {
    const createForm = useForm({ nama: '' });
    const editForm = useForm({ nama: '', is_active: true });
    const [editingId, setEditingId] = useState(null);

    const addOption = (e) => {
        e.preventDefault();
        createForm.post(route('jenis-kegiatan.store'), {
            onSuccess: () => createForm.reset(),
            onError: () => toast.error('Opsi tidak dapat ditambahkan. Periksa nama yang dimasukkan.'),
        });
    };

    const startEdit = (option) => {
        setEditingId(option.id);
        editForm.setData({ nama: option.nama, is_active: option.is_active });
    };

    const saveEdit = (e) => {
        e.preventDefault();
        editForm.patch(route('jenis-kegiatan.update', editingId), {
            onSuccess: () => setEditingId(null),
            onError: () => toast.error('Opsi tidak dapat diperbarui.'),
        });
    };

    const toggleActive = (option) => {
        router.patch(route('jenis-kegiatan.update', option.id), {
            nama: option.nama,
            is_active: !option.is_active,
        }, { preserveScroll: true });
    };

    const removeOption = (option) => {
        if (['Rutin', 'Inovasi'].includes(option.nama)) {
            toast.error('Opsi bawaan tidak dapat dihapus. Nonaktifkan jika tidak ingin digunakan.');
            return;
        }
        router.delete(route('jenis-kegiatan.destroy', option.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Opsi Jenis Kegiatan</h2>}>
            <Head title="Opsi Jenis Kegiatan" />
            <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
                <section className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">Tambah opsi</h3>
                    <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Opsi aktif akan tersedia pada form pengajuan RKAT.</p>
                    <form onSubmit={addOption} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="w-full flex-1">
                            <InputLabel htmlFor="nama-jenis-kegiatan" value="Nama jenis kegiatan" required />
                            <TextInput id="nama-jenis-kegiatan" value={createForm.data.nama} onChange={(e) => createForm.setData('nama', e.target.value)} className="mt-1 w-full" placeholder="Contoh: Pengembangan" />
                            <FieldTooltipError message={createForm.errors.nama} />
                        </div>
                        <div className="flex shrink-0 items-center justify-end gap-2 sm:pb-0.5">
                            <button type="submit" disabled={createForm.processing} className="inline-flex h-9 min-w-[88px] items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-xs font-bold tracking-wide text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">
                                <Plus size={15} /> TAMBAH
                            </button>
                            <button type="button" onClick={() => createForm.reset()} disabled={createForm.processing} aria-label="Batal menambah opsi" title="Batal" className="inline-flex h-9 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                                <X size={16} />
                            </button>
                        </div>
                    </form>
                </section>

                <section className="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800">
                    <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white">Daftar opsi</h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {options.map((option) => (
                            <div key={option.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                                {editingId === option.id ? (
                                    <form onSubmit={saveEdit} className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
                                        <div className="flex-1">
                                            <InputLabel value="Nama jenis kegiatan" required />
                                            <TextInput value={editForm.data.nama} onChange={(e) => editForm.setData('nama', e.target.value)} className="mt-1 w-full" />
                                            <FieldTooltipError message={editForm.errors.nama} />
                                        </div>
                                        <div className="flex shrink-0 items-center justify-end gap-2 sm:pb-0.5">
                                            <button type="submit" disabled={editForm.processing} className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg bg-gray-900 px-4 text-xs font-bold tracking-wide text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">SIMPAN</button>
                                            <button type="button" onClick={() => { editForm.reset(); setEditingId(null); }} disabled={editForm.processing} aria-label="Batal mengubah opsi" title="Batal" className="inline-flex h-9 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><X size={16} /></button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900 dark:text-white">{option.nama}</div>
                                            <div className={`mt-1 text-xs font-medium ${option.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>{option.is_active ? 'Aktif' : 'Nonaktif'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => toggleActive(option)} className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">{option.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                                            <button type="button" onClick={() => startEdit(option)} className="rounded-md p-2 text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-900/30" title="Ubah nama"><Pencil size={16} /></button>
                                            {!['Rutin', 'Inovasi'].includes(option.nama) && <button type="button" onClick={() => removeOption(option)} className="rounded-md p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30" title="Hapus opsi"><Trash2 size={16} /></button>}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {options.length === 0 && <div className="px-6 py-10 text-center text-sm text-gray-500">Belum ada opsi jenis kegiatan.</div>}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
