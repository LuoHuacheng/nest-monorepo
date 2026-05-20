import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientConfigList, useBatchUpdateClientConfig } from "@/api/modules/client-configs";

export const Route = createFileRoute("/_authenticated/settings/client-config")({
  component: ClientConfigPage,
});

interface ConfigItem {
  key: string;
  label: string;
  value: string;
  description: string;
}

function ClientConfigPage() {
  const { data, isLoading } = useClientConfigList();
  const batchUpdateMutation = useBatchUpdateClientConfig();
  const [configs, setConfigs] = useState<ConfigItem[]>([]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setConfigs(
        (data as Record<string, unknown>[]).map((item) => ({
          key: (item.key ?? item.code ?? "") as string,
          label: (item.label ?? item.name ?? "") as string,
          value: String(item.value ?? ""),
          description: (item.description ?? "") as string,
        })),
      );
    }
  }, [data]);

  const handleChange = (key: string, value: string) => {
    setConfigs((prev) => prev.map((c) => (c.key === key ? { ...c, value } : c)));
  };

  const handleSave = () => {
    const items = configs.map((c) => ({ key: c.key, value: c.value }));
    batchUpdateMutation.mutate({ items });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">客户端配置</h1>
        <Button onClick={handleSave} disabled={batchUpdateMutation.isPending}>
          {batchUpdateMutation.isPending ? "保存中..." : "保存配置"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>应用配置</CardTitle>
          <CardDescription>管理客户端的全局配置项</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              加载中...
            </div>
          ) : (
            configs.map((config) => (
              <div key={config.key} className="grid gap-2 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label>{config.label}</Label>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
                <div className="sm:col-span-2">
                  <Input
                    value={config.value}
                    onChange={(e) => handleChange(config.key, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
