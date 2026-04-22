import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function CustomSelect({ 
    value, 
    onChange, 
    options = [], 
    placeholder = "Pilih...", 
    className, 
    disabled = false 
}) {
    const selectedOption = options.find(opt => String(opt.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger disabled={disabled} className={cn(
                // Mengubah border-gray-300 menjadi border-gray-300/50 dan mode dark menjadi border-gray-700/50
                "flex h-11 w-full items-center justify-between rounded-md border border-gray-300/50 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:border-gray-700/50 dark:text-gray-300 dark:focus:ring-teal-600 dark:focus:border-teal-600/50 transition-all shadow-sm",
                className
            )}>
                <span className={`truncate text-left ${!selectedOption ? 'text-gray-500 font-normal' : 'font-medium'}`}>
                    {displayLabel}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
                align="start" 
                // Menambahkan border border-gray-200/50 dan mode dark border-gray-700/50 agar lebih transparan
                className="w-[--radix-dropdown-menu-trigger-width] min-w-[8rem] bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-md max-h-60 overflow-y-auto z-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {options.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500 text-center">Tidak ada opsi</div>
                ) : (
                    options.map((opt) => (
                        <DropdownMenuItem
                            key={opt.value}
                            onSelect={() => {
                                if (onChange) {
                                    onChange({ target: { value: opt.value } });
                                }
                            }}
                            className="cursor-pointer flex justify-between items-center py-2.5 px-3 focus:bg-teal-50 dark:focus:bg-teal-900/20 focus:text-teal-700 dark:focus:text-teal-300 text-gray-900 dark:text-gray-300"
                        >
                            <span className="truncate">{opt.label}</span>
                            {String(opt.value) === String(value) && (
                                <Check className="h-4 w-4 text-teal-600 flex-shrink-0 ml-2" />
                            )}
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}