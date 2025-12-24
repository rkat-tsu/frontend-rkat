import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/Components/ui/dropdown-menu';

// 1. Tambahkan "units = []" ke dalam props
export default function Edit({ unit, users = [], units = [] }) {
    const { data, setData, patch, processing, errors } = useForm({
        kode_unit: unit.kode_unit || '',
        nama_unit: unit.nama_unit || '',
        tipe_unit: unit.tipe_unit || '',
        jalur_persetujuan: unit.jalur_persetujuan || '',
        id_kepala: unit.id_kepala || '',
        parent_id: unit.parent_id || '',
        no_telepon: unit.no_telepon || '',
        email: unit.email || '',
    });

    // 2. Filter units agar unit yang sedang diedit tidak muncul di pilihan Parent
    // Ini untuk mencegah circular reference (unit menjadi parent dirinya sendiri)
    const availableUnits = units.filter(u => u.id_unit !== unit.id_unit);

    const submit = (e) => {
        e.preventDefault();
        patch(route('unit.update', unit.id_unit));
    };

    const handlePhoneInput = (value) => {
        const cleaned = value.replace(/\D/g, '');
        setData('no_telepon', cleaned);
    };

    return (
        <AuthenticatedLayout
            user={null}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Unit</h2>}
        >
            <Head title="Edit Unit" />

            <div className="py-4">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-8 shadow-sm sm:rounded-lg">
                        
                        {/* Row 1: Nama & Unit */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <InputLabel htmlFor="nama_unit" value="Nama" />
                                <TextInput
                                    id="nama_unit"
                                    value={data.nama_unit}
                                    onChange={(e) => setData('nama_unit', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.nama_unit} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="kode_unit" value="Unit" />
                                <TextInput
                                    id="kode_unit"
                                    value={data.kode_unit}
                                    onChange={(e) => setData('kode_unit', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.kode_unit} className="mt-2" />
                            </div>
                        </div>

                        {/* Row 2: Tipe & Jalur */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* ... (Konten Tipe Unit sama seperti sebelumnya) */}
                            <div>
                                <InputLabel htmlFor="tipe_unit" value="Tipe Unit" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 text-left cursor-pointer">
                                            {data.tipe_unit || '-- Pilih Tipe Unit --'}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={6} className="w-56">
                                        {['Fakultas', 'Prodi', 'Unit', 'Lainnya'].map((tipe) => (
                                            <DropdownMenuItem key={tipe} onSelect={() => setData('tipe_unit', tipe)}>
                                                {tipe}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div>
                                <InputLabel htmlFor="jalur_persetujuan" value="Jalur Persetujuan" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 text-left cursor-pointer">
                                            {data.jalur_persetujuan || '-- Pilih Jalur --'}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={6} className="w-56">
                                        <DropdownMenuItem onSelect={() => setData('jalur_persetujuan', 'akademik')}>Akademik</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setData('jalur_persetujuan', 'non-akademik')}>Non-Akademik</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Row 3: No Telp & Email */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <InputLabel htmlFor="no_telepon" value="No. Telp" />
                                <TextInput
                                    id="no_telepon"
                                    value={data.no_telepon}
                                    onChange={(e) => handlePhoneInput(e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        </div>

                        {/* Dropdown Kepala Unit */}
                        {users.length > 0 && (
                            <div className="mb-6">
                                <InputLabel htmlFor="id_kepala" value="Kepala Unit (Opsional)" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 text-left cursor-pointer">
                                            {data.id_kepala ? (users.find(u => u.id_user == data.id_kepala)?.nama_lengkap) : '-- Pilih Kepala Unit --'}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={6} className="w-56 max-h-60 overflow-y-auto">
                                        <DropdownMenuItem onSelect={() => setData('id_kepala', '')}>-- Kosongkan --</DropdownMenuItem>
                                        {users.map((user) => (
                                            <DropdownMenuItem key={user.id_user} onSelect={() => setData('id_kepala', user.id_user)}>
                                                {user.nama_lengkap}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}

                        {/* Dropdown Parent Unit (SUDAH DIPERBAIKI) */}
                        {availableUnits.length > 0 && (
                            <div className="mb-6">
                                <InputLabel htmlFor="parent_id" value="Parent Unit (Opsional)" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 text-left cursor-pointer">
                                            {data.parent_id ? (availableUnits.find(u => u.id_unit == data.parent_id)?.nama_unit) : '-- Pilih Parent Unit --'}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={6} className="w-56 max-h-60 overflow-y-auto">
                                        <DropdownMenuItem onSelect={() => setData('parent_id', '')}>
                                            -- Tanpa Parent Unit --
                                        </DropdownMenuItem>
                                        {availableUnits.map((u) => (
                                            <DropdownMenuItem key={u.id_unit} onSelect={() => setData('parent_id', u.id_unit)}>
                                                {u.kode_unit ? `${u.kode_unit} - ${u.nama_unit}` : u.nama_unit}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <InputError message={errors.parent_id} className="mt-2" />
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <PrimaryButton disabled={processing} className="bg-teal-600 hover:bg-teal-700">
                                Simpan Perubahan
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}