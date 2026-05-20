import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchFormProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onReset?: () => void;
  placeholder?: string;
}

export function SearchForm({
  value,
  onChange,
  onSearch,
  onReset,
  placeholder = "搜索...",
}: SearchFormProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder={placeholder}
          className="pl-9"
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              onReset?.();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button onClick={onSearch}>搜索</Button>
      {onReset && (
        <Button variant="outline" onClick={onReset}>
          重置
        </Button>
      )}
    </div>
  );
}
