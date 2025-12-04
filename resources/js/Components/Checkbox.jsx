export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-teal-600 shadow-sm focus:ring-teal-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-teal-600 dark:focus:ring-offset-gray-800 ' +
                className
            }
        />
    );
}
