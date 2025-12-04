import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"; // Gunakan ikon lucide-react

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================
const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const getPaddingDays = (year, month) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const paddingStart = firstDayOfMonth;

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

  const paddingDays = [];
  for (let i = paddingStart; i > 0; i--) {
    paddingDays.push(daysInPrevMonth - i + 1);
  }
  return paddingDays;
};

// ====================================================================
// MAIN COMPONENT
// ====================================================================
export default function Calendar({ selectedDate, onDateChange }) {
  const initialDate =
    selectedDate instanceof Date && !isNaN(selectedDate)
      ? selectedDate
      : new Date();

  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [viewMode, setViewMode] = useState("day");
  const [transitionKey, setTransitionKey] = useState(0);

  const days = getDaysInMonth(currentYear, currentMonth);
  const paddingDays = getPaddingDays(currentYear, currentMonth);
  const remainingPadding = 42 - (paddingDays.length + days.length);
  const nextPaddingDays = Array.from({ length: remainingPadding }, (_, i) => i + 1);

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // ====================================================================
  // HANDLERS
  // ====================================================================
  const changeView = (mode) => {
    setTransitionKey((prev) => prev + 1);
    setViewMode(mode);
  };

  const handleMonthSelect = (monthIndex) => {
    setCurrentMonth(monthIndex);
    changeView("day");
  };

  const handleYearSelect = (year) => {
    setCurrentYear(year);
    changeView("month");
  };

  const handlePrev = () => {
    setTransitionKey((prev) => prev + 1);
    if (viewMode === "day") {
      setCurrentMonth((prev) => {
        if (prev === 0) {
          setCurrentYear((prevYear) => prevYear - 1);
          return 11;
        }
        return prev - 1;
      });
    } else if (viewMode === "year") {
      setCurrentYear((prev) => prev - 12);
    } else if (viewMode === "month") {
      setCurrentYear((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    setTransitionKey((prev) => prev + 1);
    if (viewMode === "day") {
      setCurrentMonth((prev) => {
        if (prev === 11) {
          setCurrentYear((prevYear) => prevYear + 1);
          return 0;
        }
        return prev + 1;
      });
    } else if (viewMode === "year") {
      setCurrentYear((prev) => prev + 12);
    } else if (viewMode === "month") {
      setCurrentYear((prev) => prev + 1);
    }
  };

  const handleDayClick = (day) => {
    onDateChange?.(day);
  };

  const isSelected = (day) => {
    if (!selectedDate || isNaN(selectedDate)) return false;
    return (
      day.getDate() === selectedDate.getDate() &&
      day.getMonth() === selectedDate.getMonth() &&
      day.getFullYear() === selectedDate.getFullYear()
    );
  };

  // ====================================================================
  // RENDER SUB-VIEWS
  // ====================================================================
  const renderMonthView = () => (
    <div
      key={transitionKey}
      className="grid grid-cols-3 gap-2 text-center transition-opacity duration-300 ease-in-out"
    >
      {monthNames.map((month, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleMonthSelect(index)}
          className={`w-full h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium transition duration-150 ${
            currentMonth === index &&
            new Date().getFullYear() === currentYear
              ? "bg-teal-500 text-white font-semibold"
              : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {month.substring(0, 3)}
        </button>
      ))}
    </div>
  );

  const renderYearView = () => {
    const startYear = currentYear - (currentYear % 12);
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);
    return (
      <div
        key={transitionKey}
        className="grid grid-cols-3 gap-2 text-center transition-opacity duration-300 ease-in-out"
      >
        {years.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => handleYearSelect(year)}
            className={`w-full h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium transition duration-150 ${
              year === new Date().getFullYear()
                ? "bg-teal-500 text-white font-semibold"
                : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    );
  };

  const renderDayView = () => (
    <>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-2">
        {weekDays.map((day) => (
          <span
            key={day}
            className={day === "Min" ? "text-red-500 dark:text-red-400" : ""}
          >
            {day}
          </span>
        ))}
      </div>

      <div
        key={transitionKey}
        className="grid grid-cols-7 gap-1 text-center text-sm transition-opacity duration-300 ease-in-out"
      >
        {paddingDays.map((day, index) => (
          <span
            key={`prev-${index}`}
            className="py-1 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          >
            {day}
          </span>
        ))}

        {days.map((day, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleDayClick(day)}
            className={`w-full h-8 flex items-center justify-center rounded-lg transition duration-150 ${
              isSelected(day)
                ? "bg-teal-600 text-white font-bold"
                : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            } ${day.getDay() === 0 ? "text-red-500 dark:text-red-400" : ""}`}
          >
            {day.getDate()}
          </button>
        ))}

        {nextPaddingDays.map((day, index) => (
          <span
            key={`next-${index}`}
            className="py-1 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          >
            {day}
          </span>
        ))}
      </div>
    </>
  );

  // ====================================================================
  // HEADER LOGIC
  // ====================================================================
  let headerTitle;
  if (viewMode === "day") {
    headerTitle = (
      <>
        <button
          type="button"
          onClick={() => changeView("month")}
          className="font-semibold hover:text-teal-600 dark:hover:text-teal-400 transition"
        >
          {monthNames[currentMonth]}
        </button>{" "}
        <button
          type="button"
          onClick={() => changeView("year")}
          className="font-semibold hover:text-teal-600 dark:hover:text-teal-400 transition"
        >
          {currentYear}
        </button>
      </>
    );
  } else if (viewMode === "month") {
    headerTitle = (
      <button
        type="button"
        onClick={() => changeView("year")}
        className="text-lg font-semibold hover:text-teal-600 dark:hover:text-teal-400 transition"
      >
        {currentYear}
      </button>
    );
  } else if (viewMode === "year") {
    const startYear = currentYear - (currentYear % 12);
    headerTitle = (
      <span className="text-lg font-semibold">
        {startYear} - {startYear + 11}
      </span>
    );
  }

  // ====================================================================
  // MAIN RENDER
  // ====================================================================
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 w-80 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-teal-600 dark:text-teal-400" />
          <span className="text-lg">{headerTitle}</span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {viewMode === "month" && renderMonthView()}
      {viewMode === "year" && renderYearView()}
      {viewMode === "day" && renderDayView()}
    </div>
  );
}
