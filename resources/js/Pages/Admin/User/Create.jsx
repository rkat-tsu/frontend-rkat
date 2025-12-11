import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import PasswordInput from '@/Components/PasswordInput';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/Components/ui/dropdown-menu';

export default function Create({ auth, units = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_lengkap: '',
        username: '',
        email: '',
        peran: 'Inputer',
        password: '',
        password_confirmation: '',
        no_telepon: '',
        id_unit: '',
    });

    const roles = [
        { value: 'Inputer', label: 'Inputer' },
        { value: 'Kaprodi', label: 'Kepala Program Studi' },
        { value: 'Kepala_Unit', label: 'Kepala Unit' },
        { value: 'Dekan', label: 'Dekan' },
        { value: 'Rektor', label: 'Rektor' },
        { value: 'WR_1', label: 'Wakil Rektor 1' },
        { value: 'WR_2', label: 'Wakil Rektor 2' },
        { value: 'WR_3', label: 'Wakil Rektor 3' },
        { value: 'Admin', label: 'Administrator' },
    ];

    const submit = (e) => {
        e.preventDefault();
        post(route('user.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambah User</h2>}
        >
            <Head title="Tambah User" />

            <div className="py-4">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-8 shadow-sm sm:rounded-lg">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <InputLabel htmlFor="nama_lengkap" value="Nama Lengkap" />
                                <TextInput id="nama_lengkap" name="nama_lengkap" value={data.nama_lengkap} onChange={(e) => setData('nama_lengkap', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.nama_lengkap} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput id="email" name="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <InputLabel htmlFor="peran" value="Peran" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 text-left cursor-pointer">
                                            {roles.find(r => r.value === data.peran)?.label || '-- Pilih Peran --'}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={6} className="w-56">
                                        {roles.map(r => (
                                            <DropdownMenuItem
                                                key={r.value}
                                                onSelect={() => setData('peran', r.value)}
                                                className={data.peran === r.value ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}
                                            >
                                                {r.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <InputError message={errors.peran} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="no_telepon" value="No. Telp" />
                                <TextInput id="no_telepon" name="no_telepon" value={data.no_telepon} onChange={(e) => setData('no_telepon', e.target.value)} className="mt-1 block w-full" />
                                <InputError message={errors.no_telepon} className="mt-2" />
                            </div>
                        </div>

                        <div className="mb-6">
                            <InputLabel htmlFor="id_unit" value="Unit" />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 text-left cursor-pointer">
                                        {data.id_unit
                                            ? (units.find(u => u.id_unit == data.id_unit)?.kode_unit
                                                ? `${units.find(u => u.id_unit == data.id_unit)?.kode_unit} - ${units.find(u => u.id_unit == data.id_unit)?.nama_unit}`
                                                : units.find(u => u.id_unit == data.id_unit)?.nama_unit)
                                            : '-- Pilih Unit (opsional) --'}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent sideOffset={6} className="w-56">
                                    <DropdownMenuItem onSelect={() => setData('id_unit', '')} className={data.id_unit === '' ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                        -- Pilih Unit (opsional) --
                                    </DropdownMenuItem>
                                    {units.map(u => (
                                        <DropdownMenuItem
                                            key={u.id_unit}
                                            onSelect={() => setData('id_unit', u.id_unit)}
                                            className={data.id_unit == u.id_unit ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}
                                        >
                                            {u.kode_unit ? `${u.kode_unit} - ${u.nama_unit}` : u.nama_unit}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <InputError message={errors.id_unit} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <PasswordInput id="password" name="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                <PasswordInput id="password_confirmation" name="password_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <PrimaryButton type="submit" disabled={processing} className="bg-teal-600 hover:bg-teal-700">Buat User</PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
