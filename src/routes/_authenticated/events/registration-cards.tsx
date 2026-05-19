import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRegistrationCardList } from "@/api/modules/registration-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";

export const Route = createFileRoute("/_authenticated/events/registration-cards")({
  component: RegistrationCardsPage,
});

const statusMap: Record<
  number,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  0: { label: "禁用", variant: "secondary" },
  1: { label: "启用", variant: "default" },
};

const columns = [
  { key: "name", title: "姓名" },
  { key: "relationship", title: "与本人关系" },
  { key: "idNumber", title: "身份证号" },
  { key: "gender", title: "性别" },
  { key: "birthDate", title: "出生日期" },
  { key: "bloodType", title: "血型" },
  { key: "clothingSize", title: "衣服尺码" },
  { key: "phone", title: "手机号" },
  { key: "permanentAddress", title: "常住地址" },
  { key: "detailedAddress", title: "详细地址" },
  { key: "emergencyContactName", title: "紧急联系人" },
  { key: "emergencyContactPhone", title: "紧急联系电话" },
  {
    key: "status",
    title: "状态",
    render: (val: unknown) => {
      const s = statusMap[val as number];
      return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val);
    },
  },
  { key: "createdAt", title: "创建时间" },
  {
    key: "actions",
    title: "操作",
    render: () => (
      <Button variant="ghost" size="sm">
        详情
      </Button>
    ),
  },
];

function RegistrationCardsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useRegistrationCardList({ page, pageSize });
  const items = (data as { items?: unknown[] })?.items ?? [];
  const total = (data as { total?: number })?.total ?? 0;
  const filtered = (items as Record<string, unknown>[]).filter(
    (c) =>
      !search ||
      (c.name as string)?.includes(search) ||
      (c.phone as string)?.includes(search) ||
      (c.idNumber as string)?.includes(search),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">报名卡列表</h1>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索姓名、手机号或身份证号..."
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
