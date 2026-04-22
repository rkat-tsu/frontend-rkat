import React, { useState, useRef, useEffect } from "react";
import Calendar from "./Calendar";
import TextInput from "./TextInput";
import { CalendarDays } from "lucide-react"; 

export default function DateInput({ id, value, onChange, className = "", position = "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Konversi string ke objek Date
  const dateValue = value ? new Date(value + "T00:00:00") : null;

  const formattedDate =
    dateValue && !isNaN(dateValue)
      ? dateValue.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";

  // Tutup kalender kalau klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateSelect = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
  };

  const handleIconClick = () => {
    setIsOpen((prev) => !prev);
    if (inputRef.current) inputRef.current.focus();
  };

  const iconClasses = `
    absolute right-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer
    transition-colors duration-200 ease-in-out
    ${isOpen 
      ? "text-teal-500 dark:text-teal-400" 
      : "text-gray-400 dark:text-gray-500 hover:text-teal-500 dark:hover:text-teal-400"}
  `;

  // Tentukan class penempatan popup kalender
  // Jika position="left" (input di sebelah kanan layar), popup menyamping ke kiri: right-0
  // Jika position="right" (input di sebelah kiri layar), popup menyamping ke kanan: left-0
  const popupPositionClass = position === 'left' ? 'right-0' : 'left-0';
  const transformOrigin = position === 'left' ? 'top right' : 'top left';

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {/* Input utama */}
      <TextInput
        id={id}
        name={id}
        ref={inputRef}
        type="text"
        readOnly
        value={formattedDate || ""}
        className="block w-full cursor-pointer pr-10"
        placeholder={formattedDate ? formattedDate : "Pilih Tanggal"}
        onClick={() => setIsOpen(true)}
      />

      {/* Ikon kalender */}
      <button
        type="button"
        className={iconClasses}
        onClick={handleIconClick}
        aria-label="Buka kalender"
      >
        <CalendarDays className="w-5 h-5" />
      </button>

      {/* Popup kalender */}
      {isOpen && (
        <div
          className={`absolute z-[999] top-0 ${popupPositionClass} animate-fade-in-up`}
          style={{ transformOrigin }}
        >
          <Calendar selectedDate={dateValue} onDateChange={handleDateSelect} />
        </div>
      )}
    </div>
  );
}
