"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangeValue {
  from?: string;
  to?: string;
}

interface DateRangePickerProps {
  value?: DateRangeValue;
  onChange?: (range: DateRangeValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function DateRangePicker({
  value,
  onChange,
  placeholder = "选择日期范围",
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selecting, setSelecting] = React.useState<"from" | "to">("from");

  const selectedTo = value?.to ? parse(value.to, "yyyy-MM-dd", new Date()) : undefined;

  function handleDayClick(day: Date) {
    const dateStr = format(day, "yyyy-MM-dd");

    if (selecting === "from") {
      onChange?.({ from: dateStr, to: undefined });
      setSelecting("to");
    } else {
      const fromDate = value?.from ?? dateStr;
      const fromParsed = parse(fromDate, "yyyy-MM-dd", new Date());
      if (day < fromParsed) {
        onChange?.({ from: dateStr, to: fromDate });
      } else {
        onChange?.({ from: fromDate, to: dateStr });
      }
      setSelecting("from");
      setOpen(false);
    }
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setSelecting("from");
    }
    setOpen(isOpen);
  }

  function formatDisplay() {
    if (value?.from && value?.to) {
      const fromDate = parse(value.from, "yyyy-MM-dd", new Date());
      const toDate = parse(value.to, "yyyy-MM-dd", new Date());
      return `${format(fromDate, "MM月dd日", { locale: zhCN })} - ${format(toDate, "MM月dd日", { locale: zhCN })}`;
    }
    if (value?.from) {
      const fromDate = parse(value.from, "yyyy-MM-dd", new Date());
      return `${format(fromDate, "MM月dd日", { locale: zhCN })} - ?`;
    }
    return null;
  }

  let highlightedRange: { from: Date; to?: Date | undefined } | undefined = undefined;

  if (value?.from) {
    const from = parse(value.from, "yyyy-MM-dd", new Date());
    let to: Date | undefined;

    if (value?.to) {
      to = parse(value.to, "yyyy-MM-dd", new Date());
    } else if (selecting === "to") {
      to = selectedTo;
    }

    highlightedRange = { from, to };
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          data-empty={!value?.from && !value?.to}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon />
          {formatDisplay() ?? <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={highlightedRange}
          onDayClick={handleDayClick}
          locale={zhCN}
          disabled={disabled}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DateRangePicker };
export type { DateRangePickerProps, DateRangeValue };
