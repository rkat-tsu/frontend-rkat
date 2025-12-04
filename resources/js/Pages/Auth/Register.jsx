import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import PasswordInput from '@/Components/PasswordInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_lengkap: '',
        email: '',
        peran: 'Inputer_Unit',
        password: '',
        password_confirmation: '',
    });

    const roles = [
        { value: 'Inputer_Unit', label: 'Inputer Unit' },
        { value: 'Inputer_Prodi', label: 'Inputer Prodi' },
        { value: 'Kaprodi', label: 'Kepala Program Studi' },
        { value: 'Kepala_Biro', label: 'Kepala Biro' },
        { value: 'Dekan', label: 'Dekan' },
        { value: 'Rektor', label: 'Rektor' },
        { value: 'WR_1', label: 'Wakil Rektor 1' },
        { value: 'WR_2', label: 'Wakil Rektor 2' },
        { value: 'WR_3', label: 'Wakil Rektor 3' },
        { value: 'Admin', label: 'Administrator' },
    ];

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="nama_lengkap" value="Nama Lengkap" />

                    <TextInput
                        id="nama_lengkap"
                        name="nama_lengkap"
                        value={data.nama_lengkap}
                        className="mt-1 block w-full"
                        autoComplete="nama_lengkap"
                        isFocused={true}
                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                        required
                    />

                    <InputError message={errors.nama_lengkap} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="email"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="peran" value="Daftar Sebagai" />
                    <select
                        id="peran"
                        name="peran"
                        value={data.peran}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-teal-500 dark:focus:border-teal-600 focus:ring-teal-500 dark:focus:ring-teal-600 rounded-md shadow-sm"
                        onChange={(e) => setData('peran', e.target.value)}
                        required
                    >
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.peran} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <PasswordInput // <-- GANTI DARI TextInput MENJADI PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <PasswordInput // <-- GANTI DARI TextInput MENJADI PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                    >
                        Sudah Punya Akun?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Daftar
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
