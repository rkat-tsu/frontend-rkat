import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import FieldTooltipError from '@/Components/FieldTooltipError';
import CustomSelect from '@/Components/CustomSelect';
import { ChevronDown, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Index({ auth, options = [], groups = [] }) {
    const groupOptions = groups.map((group, index) => ({
        value: String(index),
        label: `${group.grup} (${group.kode_grup})`,
        grup: group.grup,
        kode_grup: group.kode_grup,
    }));
    const [selectedGroup, setSelectedGroup] = useState('');
    const createForm = useForm({ grup: '', kode_grup: '', nama: '' });
    const editForm = useForm({ grup: '', kode_grup: '', nama: '', is_active: true });
    const [editingId, setEditingId] = useState(null);
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const groupedOptions = options.reduce((groups, option) => {
        const key = `${option.grup}::${option.kode_grup}`;
        groups[key] ??= { grup: option.grup, kode_grup: option.kode_grup, options: [] };
        groups[key].options.push(option);
        return groups;
    }, {});

    const addOption = (e) => {
        e.preventDefault();
        if (!createForm.data.kode_grup) {
            toast.error('Pilih grup opsi terlebih dahulu.');
            return;
        }
        toast.warning('Konfirmasi tambah opsi', {
            description: `Tambahkan opsi “${createForm.data.nama}” ke grup ${createForm.data.grup}?`,
            action: {
                label: 'Ya, Tambahkan',
                    onClick: () => createForm.post(route('pengaturan-opsi-form.store'), {
                    onSuccess: () => {
                        createForm.reset();
                        setSelectedGroup('');
                        toast.success('Opsi berhasil ditambahkan.');
                    },
                    onError: (errors) => toast.error(errors.kode_grup || errors.grup || errors.nama || 'Opsi gagal ditambahkan.'),
                }),
            },
            cancel: { label: 'Batal' },
        });
    };

    const startEdit = (option) => {
        setEditingId(option.id);
        editForm.setData({ grup: option.grup, kode_grup: option.kode_grup, nama: option.nama, is_active: option.is_active });
    };

    const saveEdit = (e) => {
        e.preventDefault();
        toast.warning('Konfirmasi perubahan opsi', {
            description: `Simpan perubahan untuk opsi “${editForm.data.nama}”?`,
            action: {
                label: 'Ya, Simpan',
                onClick: () => editForm.patch(route('pengaturan-opsi-form.update', editingId), {
                    onSuccess: () => {
                        setEditingId(null);
                        toast.success('Perubahan opsi berhasil disimpan.');
                    },
                    onError: (errors) => toast.error(errors.kode_grup || errors.grup || errors.nama || 'Opsi gagal diperbarui.'),
                }),
            },
            cancel: { label: 'Batal' },
        });
    };

    const toggleActive = (option) => {
        const nextState = !option.is_active;
        toast.warning(`Konfirmasi ${nextState ? 'aktifkan' : 'nonaktifkan'} opsi`, {
            description: `Opsi “${option.nama}” akan ${nextState ? 'tersedia' : 'disembunyikan'} pada form.`,
            action: {
                label: nextState ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan',
                onClick: () => router.patch(route('pengaturan-opsi-form.update', option.id), {
                    nama: option.nama,
                    grup: option.grup,
                    kode_grup: option.kode_grup,
                    is_active: nextState,
                }, {
                    preserveScroll: true,
                    onSuccess: () => toast.success(`Opsi berhasil ${nextState ? 'diaktifkan' : 'dinonaktifkan'}.`),
                    onError: () => toast.error('Status opsi gagal diperbarui.'),
                }),
            },
            cancel: { label: 'Batal' },
        });
    };

    const removeOption = (option) => {
        if (['Rutin', 'Inovasi'].includes(option.nama)) {
            toast.error('Opsi bawaan tidak dapat dihapus. Nonaktifkan jika tidak ingin digunakan.');
            return;
        }
        toast.warning('Konfirmasi hapus opsi', {
            description: `Hapus opsi “${option.nama}”? Opsi yang sudah digunakan tidak dapat dihapus.`,
            action: {
                label: 'Ya, Hapus',
                onClick: () => router.delete(route('pengaturan-opsi-form.destroy', option.id), {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Opsi berhasil dihapus.'),
                    onError: (errors) => toast.error(errors.option || 'Opsi gagal dihapus karena masih digunakan.'),
                }),
            },
            cancel: { label: 'Batal' },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Pengaturan Opsi Form</h2>}>
            <Head title="Pengaturan Opsi Form" />
            <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
                <section className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">Tambah opsi</h3>
                    <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Pilih grup yang tersedia. Setiap grup memiliki kode tetap yang digunakan aplikasi untuk mengambil opsi pada form terkait.</p>
                    <form onSubmit={addOption} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:items-end">
                        <div>
                            <InputLabel value="Grup / Menu" required />
                            <CustomSelect value={selectedGroup} onChange={(e) => {
                                const group = groupOptions.find(option => option.value === e.target.value);
                                setSelectedGroup(e.target.value);
                                createForm.setData(data => ({ ...data, grup: group?.grup || '', kode_grup: group?.kode_grup || '' }));
                            }} options={groupOptions} placeholder="Pilih grup / menu" className="mt-1" />
                            <FieldTooltipError message={createForm.errors.kode_grup || createForm.errors.grup} />
                        </div>
                        <div className="w-full flex-1">
                            <InputLabel htmlFor="nama-jenis-kegiatan" value="Nama opsi" required />
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
                    <div className="space-y-5 bg-gray-50 p-4 dark:bg-gray-900/30 sm:p-5">
                        {Object.values(groupedOptions).map((group) => (
                            <div key={`${group.grup}-${group.kode_grup}`} className="overflow-hidden rounded-xl border border-teal-200 bg-white shadow-sm dark:border-teal-900 dark:bg-gray-800">
                            <button type="button" onClick={() => setCollapsedGroups(current => ({ ...current, [group.kode_grup]: !current[group.kode_grup] }))} aria-expanded={!collapsedGroups[group.kode_grup]} className="flex w-full items-center justify-between border-b border-teal-100 bg-teal-50 px-5 py-4 text-left transition hover:bg-teal-100/70 dark:border-teal-900 dark:bg-teal-950/40 dark:hover:bg-teal-950/70">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">Grup Opsi</div>
                                    <div className="mt-1 text-base font-bold text-gray-900 dark:text-white">{group.grup}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700">{group.options.length} opsi</span>
                                    <code className="rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-teal-800 ring-1 ring-teal-200 dark:bg-gray-900 dark:text-teal-300 dark:ring-teal-800">{group.kode_grup}</code>
                                    <ChevronDown size={18} className={`text-teal-700 transition-transform dark:text-teal-300 ${collapsedGroups[group.kode_grup] ? '-rotate-90' : ''}`} />
                                </div>
                            </button>
                            {!collapsedGroups[group.kode_grup] && <div className="divide-y divide-gray-100 px-4 dark:divide-gray-700">
                        {group.options.map((option) => (
                            <div key={option.id} className="flex min-h-[72px] flex-col gap-3 px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                                {editingId === option.id ? (
                                    <form onSubmit={saveEdit} className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
                                        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                                <InputLabel value="Grup / Menu" required />
                                                <CustomSelect
                                                    value={String(groupOptions.findIndex(group => group.grup === editForm.data.grup && group.kode_grup === editForm.data.kode_grup))}
                                                    onChange={(e) => {
                                                        const group = groupOptions.find(option => option.value === e.target.value);
                                                        editForm.setData(data => ({ ...data, grup: group?.grup || '', kode_grup: group?.kode_grup || '' }));
                                                    }}
                                                    options={groupOptions}
                                                    placeholder="Pilih grup / menu"
                                                    className="mt-1"
                                                />
                                                <FieldTooltipError message={editForm.errors.grup || editForm.errors.kode_grup} />
                                            </div>
                                            <div>
                                            <InputLabel value="Nama opsi" required />
                                            <TextInput value={editForm.data.nama} onChange={(e) => editForm.setData('nama', e.target.value)} className="mt-1 w-full" />
                                            <FieldTooltipError message={editForm.errors.nama} />
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center justify-end gap-2 sm:pb-0.5">
                                            <button type="submit" disabled={editForm.processing} className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg bg-gray-900 px-4 text-xs font-bold tracking-wide text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">SIMPAN</button>
                                            <button type="button" onClick={() => { editForm.reset(); setEditingId(null); }} disabled={editForm.processing} aria-label="Batal mengubah opsi" title="Batal" className="inline-flex h-9 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><X size={16} /></button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <div className="min-w-0">
                                            <div className="font-semibold text-gray-900 dark:text-white">{option.nama}</div>
                                            </div>
                                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${option.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                {option.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
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
                            </div>}
                            </div>
                        ))}
                        {options.length === 0 && <div className="px-6 py-10 text-center text-sm text-gray-500">Belum ada opsi.</div>}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
