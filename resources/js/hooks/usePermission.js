import { usePage } from '@inertiajs/react';

/**
 * Custom Hook untuk menangani Role-Based Access Control (RBAC) di sisi Frontend.
 * Hook ini mengambil data user dan peran dari props auth global Inertia.
 */
export const usePermission = () => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const role = user?.peran;

    /**
     * Mengecek apakah user memiliki peran tertentu.
     * @param {string} roleName Nama peran (e.g., 'Admin', 'Tim_Renbang')
     * @returns {boolean}
     */
    const hasRole = (roleName) => {
        return role === roleName;
    };

    /**
     * Mengecek apakah user memiliki salah satu dari daftar peran yang diberikan.
     * @param {string[]} roles Array nama peran
     * @returns {boolean}
     */
    const hasAnyRole = (roles) => {
        if (!roles) return false;
        return roles.includes(role);
    };

    // Helper Functions untuk Peran Spesifik
    const isAdmin = () => hasRole('Admin');
    const isTimRenbang = () => hasRole('Tim_Renbang');
    const isDekan = () => hasRole('Dekan');
    const isKepalaUnit = () => hasRole('Kepala_Unit');
    const isRektor = () => hasRole('Rektor');
    
    // Peran Gabungan (Approver)
    const isApprover = () => {
        const approverRoles = ['Dekan', 'Kepala_Unit', 'Tim_Renbang', 'WR_1', 'WR_2', 'WR_3', 'Rektor'];
        return hasAnyRole(approverRoles);
    };

    // Peran Head (Dekan atau Kepala Unit)
    const isUnitHead = () => {
        return hasAnyRole(['Dekan', 'Kepala_Unit']);
    }

    return {
        user,
        role,
        hasRole,
        hasAnyRole,
        isAdmin,
        isTimRenbang,
        isDekan,
        isKepalaUnit,
        isRektor,
        isApprover,
        isUnitHead
    };
};
