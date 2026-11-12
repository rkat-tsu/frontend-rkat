import React, { useState } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    disabled = false,
    isMarquee = false, // Prop baru untuk mengaktifkan efek teks berjalan
    searchable = false,
    dropdownModal = true
}) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const selectedOption = options.find(opt => String(opt.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;
    const filteredOptions = options.filter(opt => String(opt.label).toLowerCase().includes(searchQuery.trim().toLowerCase()));

    if (searchable) {
        return (
            <Popover open={searchOpen} onOpenChange={(open) => {
                setSearchOpen(open);
                if (!open) setSearchQuery('');
            }}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        disabled={disabled}
                        aria-haspopup="listbox"
                        aria-expanded={searchOpen}
                        className={cn(
                            "group flex h-11 w-full items-center justify-between rounded-md border border-gray-300/50 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:border-gray-700/50 dark:text-gray-300 dark:focus:ring-teal-600 dark:focus:border-teal-600/50 transition-all shadow-sm",
                            className
                        )}
                    >
                        <span className={cn("flex-1 text-left truncate mr-2", !selectedOption ? 'text-gray-500 font-normal' : 'font-semibold text-gray-900 dark:text-gray-100')}>
                            {displayLabel}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                    </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 dark:border-gray-700">
                        <Search className="h-4 w-4 shrink-0 text-gray-400" />
                        <input
                            autoFocus
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Cari nama atau NIK..."
                            className="h-9 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-gray-400 focus:ring-0 dark:text-gray-100"
                        />
                    </div>
                    <div role="listbox" className="mt-1 max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-gray-500">Karyawan tidak ditemukan.</div>
                        ) : filteredOptions.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={String(opt.value) === String(value)}
                                onClick={() => {
                                    onChange?.({ target: { value: opt.value } });
                                    setSearchOpen(false);
                                }}
                                className="flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2.5 text-left text-sm text-gray-900 hover:bg-teal-50 hover:text-teal-700 dark:text-gray-200 dark:hover:bg-teal-900/20 dark:hover:text-teal-300"
                            >
                                <span className="truncate">{opt.label}</span>
                                {String(opt.value) === String(value) && <Check className="h-4 w-4 shrink-0 text-teal-600" />}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <>
            {isMarquee && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes marqueeLoop {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `}} />
            )}

            <DropdownMenu modal={dropdownModal}>
                <DropdownMenuTrigger disabled={disabled} className={cn(
                    "group flex h-11 w-full items-center justify-between rounded-md border border-gray-300/50 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:border-gray-700/50 dark:text-gray-300 dark:focus:ring-teal-600 dark:focus:border-teal-600/50 transition-all shadow-sm",
                    className
                )}>
                    <span className={cn(
                        "flex-1 text-left truncate mr-2",
                        !selectedOption ? 'text-gray-500 font-normal' : 'font-semibold text-gray-900 dark:text-gray-100'
                    )}>
                        {displayLabel}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="start"
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-[8rem] bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-md max-h-60 overflow-y-auto z-[9999]"
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
                                className="group/item cursor-pointer flex justify-between items-center py-2.5 px-3 focus:bg-teal-50 dark:focus:bg-teal-900/20 focus:text-teal-700 dark:focus:text-teal-300 text-gray-900 dark:text-gray-300 overflow-hidden"
                            >
                                <div className="flex-1 overflow-hidden relative h-5 mr-2 flex items-center">
                                    {isMarquee ? (
                                        <>
                                            {/* Versi Running Text (Hanya muncul saat HOVER jika isMarquee aktif) */}
                                            <div
                                                className="hidden group-hover/item:flex whitespace-nowrap animate-[marqueeLoop_15s_linear_infinite]"
                                                style={{ width: 'max-content' }}
                                            >
                                                <span className="px-0">{opt.label}</span>
                                                <span className="px-10">{opt.label}</span>
                                            </div>

                                            {/* Versi Normal (Tampil jika tidak hover) */}
                                            <span className="group-hover/item:hidden truncate">
                                                {opt.label}
                                            </span>
                                        </>
                                    ) : (
                                        // Versi Standar (Selalu truncate, tanpa marquee)
                                        <span className="truncate">
                                            {opt.label}
                                        </span>
                                    )}
                                </div>
                                {String(opt.value) === String(value) && (
                                    <Check className="h-4 w-4 text-teal-600 flex-shrink-0 ml-2" />
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
