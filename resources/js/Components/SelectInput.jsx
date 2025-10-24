// resources/js/Components/SelectInput.jsx

import { forwardRef } from 'react';

const SelectInput = forwardRef(
    ({ className = '', children, ...props }, ref) => {
        return (
            <select
                {...props}
                className={
                    'border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm ' +
                    className
                }
                ref={ref}
            >
                {/* children akan menjadi opsi (<option>) yang Anda berikan */}
                {children} 
            </select>
        );
    }
);

export default SelectInput;