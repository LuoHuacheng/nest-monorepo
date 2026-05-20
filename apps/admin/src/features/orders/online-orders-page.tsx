import { useState } from "react";
import { useOrderList, useRefundOrder } from "@/api/modules/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "待支付", variant: "secondary" },
  paid: { label: "已支付", variant: "default" },
  refunded: { label: "已退款", variant: "destructive" },
  cancelled: { label: "已取消", variant: "outline" },
};

export function OnlineOrdersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refundId, setRefundId] = useState<string | null>(null);

  const queryParams: Record<string, unknown> = {
    page,
    pageSize: 10,
    type: "online",
    keyword: search || undefined,
  };

  const { data, isLoading } = useOrderList(queryParams);
  const orders = (data?.items ?? []) as Record<string, unknown>[];
  const total = data?.total ?? 0;

  const refundMutation = useRefundOrder();

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
      <h1 className="text-2xl font-bold">线上赛订单</h1>
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
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          page={page}
          pageSize={10}
          total={total}
          onPageChange={setPage}
        />
      )}
      <ConfirmDialog
        open={refundId !== null}
        onOpenChange={() => setRefundId(null)}
        title="确认退款"
        description="确定要对此订单进行退款操作吗？此操作不可撤销。"
        onConfirm={() => {
          if (refundId) refundMutation.mutate(refundId);
          setRefundId(null);
        }}
        confirmText="确认退款"
        variant="destructive"
      />
    </div>
  );
}
