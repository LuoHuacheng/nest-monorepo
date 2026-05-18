import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { mockPacerTests } from "@/mocks/data/pacers";

export const Route = createFileRoute("/_authenticated/pacers/tests")({
  component: PacerTestsPage,
});

const columns = [
  { key: "pacerName", title: "配速员" },
  { key: "pacerId", title: "配速员ID" },
  { key: "testDate", title: "测试日期" },
  { key: "location", title: "地点" },
  { key: "finishTime", title: "完赛时间" },
  { key: "videoUrl", title: "视频" },
  {
    key: "status",
    title: "状态",
    render: (val: unknown) => (
      <Badge variant={val === 1 ? "default" : "secondary"}>{val === 1 ? "启用" : "禁用"}</Badge>
    ),
  },
  { key: "createdAt", title: "创建时间" },
  {
    key: "actions",
    title: "操作",
    render: () => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          编辑
        </Button>
        <Button variant="ghost" size="sm">
          导出
        </Button>
      </div>
    ),
  },
];

function PacerTestsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = mockPacerTests.filter(
    (t) =>
      t.pacerName.includes(search) ||
      t.pacerId.includes(search) ||
      (t.location?.includes(search) ?? false),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">配速员实测</h1>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索配速员、ID 或地点..."
      />
      <DataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        page={page}
        pageSize={10}
        total={filtered.length}
        onPageChange={setPage}
      />
    </div>
  );
}
