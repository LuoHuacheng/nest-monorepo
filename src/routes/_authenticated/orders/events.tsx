import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { mockOrders } from "@/mocks/data/orders";

export const Route = createFileRoute("/_authenticated/orders/events")({
  component: EventOrdersPage,
});

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "待支付", variant: "secondary" },
  paid: { label: "已支付", variant: "default" },
  refunded: { label: "已退款", variant: "destructive" },
  cancelled: { label: "已取消", variant: "outline" },
};

function EventOrdersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refundId, setRefundId] = useState<string | null>(null);

  const filtered = mockOrders.filter(
    (o) =>
      o.orderNo.includes(search) || o.eventName.includes(search) || o.userName.includes(search),
  );

  const columns = [
    { key: "orderNo", title: "订单号" },
    { key: "eventName", title: "赛事" },
    { key: "userName", title: "用户" },
    { key: "amount", title: "金额", render: (val: unknown) => `¥${val}` },
    {
      key: "status",
      title: "状态",
      render: (val: unknown) => {
        const s = statusMap[val as string];
        return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val);
      },
    },
    { key: "createdAt", title: "创建时间" },
    {
      key: "actions",
      title: "操作",
      render: (_: unknown, record: Record<string, unknown>) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            详情
          </Button>
          {record.status === "paid" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => setRefundId(record.id as string)}
            >
              退款
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">赛事订单</h1>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索订单号、赛事或用户..."
      />
      <DataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        page={page}
        pageSize={10}
        total={filtered.length}
        onPageChange={setPage}
      />
      <ConfirmDialog
        open={refundId !== null}
        onOpenChange={() => setRefundId(null)}
        title="确认退款"
        description="确定要对此订单进行退款操作吗？此操作不可撤销。"
        onConfirm={() => {
          setRefundId(null);
        }}
        confirmText="确认退款"
        variant="destructive"
      />
    </div>
  );
}
