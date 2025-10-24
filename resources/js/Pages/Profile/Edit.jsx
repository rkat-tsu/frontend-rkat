import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Profil
                </h2>
            }
        >
            <Head title="Profil" />

            <div className="py-12">
                {/* PERUBAHAN: Mengganti max-w-7xl menjadi max-w-4xl (atau max-w-3xl jika ingin lebih compact) */}
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8"> 
                    
                    {/* HANYA PERLU SATU CARD UNTUK SEMUA */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        {/* Hapus className="max-w-xl" agar komponen mengambil lebar penuh container 4xl */}
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>
                    
                    {/* Pisahkan Update Password dan Delete Account jika Anda ingin tetap memisahkannya */}
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <UpdatePasswordForm className="max-w-xl" /> {/* Pertahankan max-w-xl untuk form password agar lebih pendek */}
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <DeleteUserForm className="max-w-xl" /> {/* Pertahankan max-w-xl untuk form delete */}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
