import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  title: string;
  fixed?: "left" | "right";
  width?: number;
  render?: (value: unknown, record: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

function getFixedClass(col: Column): string {
  if (!col.fixed) return "";
  if (col.fixed === "left") {
    return "sticky left-0 z-10 bg-background shadow-[1px_0_0_var(--color-border)]";
  }
  return "sticky right-0 z-10 bg-background shadow-[-1px_0_0_var(--color-border)]";
}

export function DataTable({
  columns,
  data,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
}: DataTableProps) {
  const totalPages = Math.ceil(total / pageSize);

  // Compute left/right offsets for fixed columns
  const leftOffsets: Record<string, number> = {};
  const rightOffsets: Record<string, number> = {};
  let leftOffset = 0;
  let rightOffset = 0;

  for (const col of columns) {
    if (col.fixed === "left") {
      leftOffsets[col.key] = leftOffset;
      leftOffset += col.width ?? 150;
    }
  }
  // oxlint-disable-next-line unicorn/no-array-reverse
  for (const col of [...columns].reverse()) {
    if (col.fixed === "right") {
      rightOffsets[col.key] = rightOffset;
      rightOffset += col.width ?? 80;
    }
  }

  function getFixedStyle(col: Column): React.CSSProperties | undefined {
    if (!col.fixed) return undefined;
    if (col.fixed === "left") return { left: leftOffsets[col.key] };
    return { right: rightOffsets[col.key] };
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(getFixedClass(col), col.fixed && "bg-muted/50")}
                  style={getFixedStyle(col)}
                >
                  {col.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={getFixedClass(col)}
                      style={getFixedStyle(col)}
                    >
                      {col.render
                        ? col.render(record[col.key], record)
                        : String(record[col.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            共 {total} 条，第 {page}/{totalPages} 页
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              <ChevronLeft className="size-4" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            >
              下一页
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
