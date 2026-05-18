import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/settings/client-config")({
  component: ClientConfigPage,
});

interface ConfigItem {
  key: string;
  label: string;
  value: string;
  description: string;
}

const initialConfigs: ConfigItem[] = [
  {
    key: "app_name",
    label: "应用名称",
    value: "体育赛事管理",
    description: "客户端显示的应用名称",
  },
  { key: "app_version", label: "当前版本", value: "1.0.0", description: "客户端当前版本号" },
  {
    key: "force_update",
    label: "强制更新",
    value: "false",
    description: "是否强制用户更新到最新版本",
  },
  {
    key: "maintenance_mode",
    label: "维护模式",
    value: "false",
    description: "开启后客户端显示维护页面",
  },
  {
    key: "contact_email",
    label: "客服邮箱",
    value: "support@example.com",
    description: "用户联系方式",
  },
  {
    key: "privacy_url",
    label: "隐私政策链接",
    value: "https://example.com/privacy",
    description: "隐私政策页面URL",
  },
];

function ClientConfigPage() {
  const [configs, setConfigs] = useState(initialConfigs);

  const handleChange = (key: string, value: string) => {
    setConfigs((prev) => prev.map((c) => (c.key === key ? { ...c, value } : c)));
  };

  const handleSave = () => {
    // Mock save - would integrate with API
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">客户端配置</h1>
        <Button onClick={handleSave}>保存配置</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>应用配置</CardTitle>
          <CardDescription>管理客户端的全局配置项</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {configs.map((config) => (
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
