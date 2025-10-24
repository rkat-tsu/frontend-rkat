import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PasswordInput from '@/Components/PasswordInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Hapus Akun
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Setelah akun Anda dihapus, semua <b>sumber daya dan datanya</b> akan <b>dihapus secara permanen</b>.
                    Sebelum menghapus akun Anda, mohon unduh data atau informasi apa pun yang ingin Anda <b>simpan</b>.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Hapus Akun
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        <b>Apakah Anda yakin ingin menghapus akun Anda?</b>
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Setelah akun Anda dihapus, semua <b>sumber daya dan datanya</b> akan <b>dihapus secara permanen</b>.
                        Mohon masukkan <b>Password</b> Anda untuk mengonfirmasi bahwa Anda ingin <b>menghapus akun Anda secara permanen</b>.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <PasswordInput // <-- GANTI DARI TextInput MENJADI PasswordInput
                            id="password"
                            name="password"
                            value={data.password}
                            ref={passwordInput}
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder="Password"
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Batal
                        </SecondaryButton>

                        <DangerButton className="ms-3" disabled={processing}>
                            Hapus Akun
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
