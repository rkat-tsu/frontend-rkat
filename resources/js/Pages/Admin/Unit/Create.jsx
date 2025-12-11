import React, { useEffect } from 'react';
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

export default function Create({ users = [], units = [] }) {
    useEffect(() => {
        // debugging: log units prop to confirm data is received from server
        console.log('Create Unit - units prop:', units);
    }, [units]);
    const { data, setData, post, processing, errors } = useForm({
        kode_unit: '',
        nama_unit: '',
        tipe_unit: '',
        jalur_persetujuan: '',
        id_kepala: '',
        parent_id: '',
        no_telepon: '',

        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('unit.store'));
    };

    // Format nomor telepon otomatis
    const handlePhoneInput = (value) => {
        const cleaned = value.replace(/\D/g, '');
        setData('no_telepon', cleaned);
    };

    return (
        <AuthenticatedLayout
            user={null}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambahkan Unit</h2>}
        >
            <Head title="Tambahkan Unit" />

            <div className="py-4">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-8 shadow-sm sm:rounded-lg">
                        {/* Row 1: Nama & Unit */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <InputLabel htmlFor="nama_unit" value="Nama" />
                                <TextInput
                                    id="nama_unit"
                                    name="nama_unit"
                                    placeholder="Kaset"
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
                                    name="kode_unit"
                                    placeholder="BEM"
                                    value={data.kode_unit}
                                    onChange={(e) => setData('kode_unit', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.kode_unit} className="mt-2" />
                            </div>
                        </div>

                        {/* Row 2: Tipe Unit & Jalur Persetujuan */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <InputLabel htmlFor="tipe_unit" value="Tipe Unit" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 text-left cursor-pointer">
                                            {data.tipe_unit || '-- Pilih Tipe Unit --'}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={6} className="w-56">
                                        <DropdownMenuItem onSelect={() => setData('tipe_unit', '')} className={data.tipe_unit === '' ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                            -- Pilih Tipe Unit --
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setData('tipe_unit', 'Fakultas')} className={data.tipe_unit === 'Fakultas' ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                            Fakultas
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setData('tipe_unit', 'Prodi')} className={data.tipe_unit === 'Prodi' ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                            Prodi
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setData('tipe_unit', 'Unit')} className={data.tipe_unit === 'Unit' ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                            Unit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setData('tipe_unit', 'Lainnya')} className={data.tipe_unit === 'Lainnya' ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                            Lainnya
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <InputError message={errors.tipe_unit} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="jalur_persetujuan" value="Jalur Persetujuan" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 text-left cursor-pointer">
                                            {data.jalur_persetujuan || '-- Pilih Jalur Persetujuan --'}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={6} className="w-56">
                                        <DropdownMenuItem onSelect={() => setData('jalur_persetujuan', '')} className={data.jalur_persetujuan === '' ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                            -- Pilih Jalur Persetujuan --
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setData('jalur_persetujuan', 'akademik')} className={data.jalur_persetujuan === 'akademik' ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                            Akademik
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setData('jalur_persetujuan', 'non-akademik')} className={data.jalur_persetujuan === 'non-akademik' ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                            Non-Akademik
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <InputError message={errors.jalur_persetujuan} className="mt-2" />
                            </div>
                        </div>

                        {/* Row 3: No. Telp & Email */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <InputLabel htmlFor="no_telepon" value="No. Telp" />
                                <TextInput
                                    id="no_telepon"
                                    name="no_telepon"
                                    placeholder="083635691001"
                                    value={data.no_telepon}
                                    onChange={(e) => handlePhoneInput(e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.no_telepon} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@tsu.ac.id"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                        </div>

                        {/* Optional: id_kepala (hidden atau advanced field) */}
                        {users.length > 0 && (
                            <div className="mb-6">
                                <InputLabel htmlFor="id_kepala" value="Kepala Unit (Opsional)" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 text-left cursor-pointer">
                                            {data.id_kepala ? (users.find(u => u.id_user == data.id_kepala)?.nama_lengkap) : '-- Pilih Kepala Unit --'}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={6} className="w-56">
                                        <DropdownMenuItem onSelect={() => setData('id_kepala', '')} className={data.id_kepala === '' ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                            -- Pilih Kepala Unit --
                                        </DropdownMenuItem>
                                        {users.map((user) => (
                                            <DropdownMenuItem key={user.id_user} onSelect={() => setData('id_kepala', user.id_user)} className={data.id_kepala == user.id_user ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                                {user.nama_lengkap}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <InputError message={errors.id_kepala} className="mt-2" />
                            </div>
                        )}

                        {/* Optional: parent_id (choose existing Parent Unit) */}
                        {units.length > 0 && (
                            <div className="mb-6">
                                <InputLabel htmlFor="parent_id" value="Parent Unit (Opsional)" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 text-left cursor-pointer">
                                            {data.parent_id ? (units.find(u => u.id_unit == data.parent_id)?.nama_unit) : '-- Pilih Parent Unit --'}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={6} className="w-56">
                                        <DropdownMenuItem onSelect={() => setData('parent_id', '')} className={data.parent_id === '' ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                            -- Pilih Parent Unit --
                                        </DropdownMenuItem>
                                        {units.map((u) => (
                                            <DropdownMenuItem key={u.id_unit} onSelect={() => setData('parent_id', u.id_unit)} className={data.parent_id == u.id_unit ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                                {u.kode_unit ? `${u.kode_unit} - ${u.nama_unit}` : u.nama_unit}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <InputError message={errors.parent_id} className="mt-2" />
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <PrimaryButton
                                type="submit"
                                disabled={processing}
                                className="bg-teal-600 hover:bg-teal-700"
                            >
                                Tambahkan
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
