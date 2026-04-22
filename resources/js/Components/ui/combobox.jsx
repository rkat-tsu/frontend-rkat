"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { CheckIcon, ChevronDownIcon, XIcon, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Context to expose current selected values to child components
const ComboboxValuesContext = React.createContext([])

function Combobox({
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  ...props
}) {
  const isControlled = value !== undefined
  const [internalValues, setInternalValues] = React.useState(
    defaultValue ?? (multiple ? [] : "")
  )
  const values = isControlled ? value : internalValues

  const handleValueChange = React.useCallback(
    (newValues) => {
      if (!isControlled) setInternalValues(newValues)
      onValueChange?.(newValues)
    },
    [isControlled, onValueChange]
  )

  return (
    <ComboboxValuesContext.Provider value={values}>
      <ComboboxPrimitive.Root
        value={values}
        onValueChange={handleValueChange}
        multiple={multiple}
        {...props}
      />
    </ComboboxValuesContext.Provider>
  )
}

function ComboboxValue({ children, ...props }) {
  const values = React.useContext(ComboboxValuesContext)
  if (typeof children === "function") {
    return children(values)
  }
  return (
    <ComboboxPrimitive.Value data-slot="combobox-value" {...props}>
      {children}
    </ComboboxPrimitive.Value>
  )
}

const ComboboxChips = React.forwardRef(function ComboboxChips(
  { className, ...props },
  ref
) {
  return (
    <ComboboxPrimitive.Chips
      ref={ref}
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-300/50 bg-white px-3 py-1.5 text-sm shadow-sm transition-all focus-within:outline-none focus-within:ring-1 focus-within:ring-teal-500 focus-within:border-teal-500/50 has-data-[slot=combobox-chip]:px-2 dark:bg-gray-900 dark:border-gray-700/50 dark:text-gray-300 dark:focus-within:ring-teal-600 dark:focus-within:border-teal-600/50",
        className
      )}
      {...props}
    />
  )
})

function ComboboxChip({ className, children, ...props }) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-6 w-fit items-center justify-center gap-1 rounded-md bg-teal-50 border border-teal-200 px-2 text-xs font-medium whitespace-nowrap text-teal-700 has-disabled:pointer-events-none has-disabled:opacity-50 dark:bg-teal-900/30 dark:border-teal-800 dark:text-teal-300",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ChipRemove
        className="ml-0.5 h-4 w-4 p-0 opacity-60 hover:opacity-100 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-800 rounded-full flex items-center justify-center transition-colors"
        data-slot="combobox-chip-remove"
      >
        <XIcon className="size-3" />
      </ComboboxPrimitive.ChipRemove>
    </ComboboxPrimitive.Chip>
  )
}

function ComboboxChipsInput({ className, ...props }) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn(
        "min-w-24 flex-1 border-none outline-none focus:ring-0 focus:outline-none bg-transparent py-1 text-sm text-gray-700 placeholder:text-gray-400 dark:text-gray-200 dark:placeholder:text-gray-500",
        className
      )}
      {...props}
    />
  )
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  anchor,
  showSearch = true,
  ...props
}) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "z-50 min-w-[var(--anchor-width)] max-h-60 overflow-hidden rounded-md bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-lg origin-(--transform-origin) duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 flex flex-col",
            className
          )}
          {...props}
        >
          <div className="overflow-y-auto no-scrollbar">
            {props.children}
          </div>
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({ className, ...props }) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn("p-1", className)}
      {...props}
    />
  )
}

function ComboboxItem({ className, children, ...props }) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm py-2.5 pr-3 pl-3 text-sm outline-hidden text-gray-900 dark:text-gray-300 data-highlighted:bg-teal-50 data-highlighted:text-teal-700 dark:data-highlighted:bg-teal-900/20 dark:data-highlighted:text-teal-300 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none flex size-4 items-center justify-center flex-shrink-0 ml-2" />
        }
      >
        <CheckIcon className="size-4 text-teal-600 dark:text-teal-400" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxEmpty({ className, ...props }) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "hidden w-full justify-center py-6 text-center text-sm text-gray-400 group-data-empty/combobox-content:flex",
        className
      )}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef(null)
}

export {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxValue,
  useComboboxAnchor,
}
