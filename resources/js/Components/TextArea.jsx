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
                    'border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-teal-500 dark:focus:border-teal-600 focus:ring-teal-500 dark:focus:ring-teal-600 rounded-md shadow-sm ' +
                    className
                }
                ref={inputRef}
            />
        );
    }
);

export default TextArea;