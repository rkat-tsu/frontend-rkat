// resources/js/Components/TextArea.jsx

import { forwardRef, useEffect, useRef } from 'react';

const TextArea = forwardRef(
    ({ className = '', isFocused = false, ...props }, ref) => {
        const localRef = useRef(null);
        
        // Menggunakan ref yang diteruskan atau ref lokal
        const inputRef = ref || localRef;

        useEffect(() => {
            if (isFocused) {
                inputRef.current?.focus();
            }
        }, [isFocused]);

        return (
            <textarea
                {...props}
                className={
                    'border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm ' +
                    className
                }
                ref={inputRef}
            />
        );
    }
);

export default TextArea;