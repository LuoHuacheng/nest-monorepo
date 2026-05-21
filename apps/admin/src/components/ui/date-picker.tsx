"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onBlur?: () => void;
}

function DatePicker({
  value,
  onChange,
  placeholder = "选择日期",
  disabled = false,
  className,
  onBlur,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange?.(format(date, "yyyy-MM-dd"));
    } else {
      onChange?.("");
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          onBlur={onBlur}
          data-empty={!value}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon />
          {selectedDate ? (
            format(selectedDate, "yyyy年MM月dd日", { locale: zhCN })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          locale={zhCN}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
export type { DatePickerProps };
