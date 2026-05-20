import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface FilterBarProps {
  children: React.ReactNode;
  onReset?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  searchPlaceholder?: string;
}

export function FilterBar({
  children,
  onReset,
  searchValue,
  onSearchChange,
  onSearch,
  searchPlaceholder,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <div className="flex items-center gap-2">
        {onSearchChange && (
          <div className="flex flex-1 max-w-sm items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
                placeholder={searchPlaceholder}
                className="pl-8 pr-8"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  onClick={() => {
                    onSearchChange("");
                    onReset?.();
                  }}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
            <Button onClick={() => onSearch?.()}>搜索</Button>
          </div>
        )}
        <CollapsibleTrigger asChild>
          <Button variant="outline">
            <SlidersHorizontal className="mr-1.5 size-4" />
            筛选
          </Button>
        </CollapsibleTrigger>
        {open && onReset && (
          <Button variant="ghost" onClick={onReset}>
            重置筛选
          </Button>
        )}
      </div>
      <CollapsibleContent className="mt-3">
        <div className="rounded-md border border-border p-4">
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
            {children}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface FilterItemProps {
  label: string;
  children: React.ReactNode;
}

export function FilterItem({ label, children }: FilterItemProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
