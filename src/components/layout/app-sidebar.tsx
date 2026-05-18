import React from "react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  ShoppingCart,
  Users,
  Shield,
  Settings,
  Timer,
  Building2,
  Landmark,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
  children?: { title: string; to: string }[];
}

const menuItems: MenuItem[] = [
  { title: "概览", icon: LayoutDashboard, to: "/" },
  {
    title: "赛事管理",
    icon: CalendarDays,
    children: [
      { title: "赛事列表", to: "/events/list" },
      { title: "报名卡列表", to: "/events/registration-cards" },
      { title: "邀请码列表", to: "/events/invite-codes" },
      { title: "摆渡车列表", to: "/events/shuttle-buses" },
      { title: "成绩列表", to: "/events/results" },
    ],
  },
  {
    title: "订单管理",
    icon: ShoppingCart,
    children: [
      { title: "赛事订单", to: "/orders/events" },
      { title: "线上赛订单", to: "/orders/online" },
    ],
  },
  { title: "组委会", icon: Building2, to: "/organizers" },
  { title: "田管中心", icon: Landmark, to: "/athletic-centers" },
  {
    title: "配速员管理",
    icon: Timer,
    children: [
      { title: "配速员列表", to: "/pacers/list" },
      { title: "配速员实测", to: "/pacers/tests" },
      { title: "配速员赛事", to: "/pacers/events" },
    ],
  },
  { title: "用户管理", icon: Users, to: "/users" },
  { title: "角色管理", icon: Shield, to: "/roles" },
  {
    title: "系统配置",
    icon: Settings,
    children: [
      { title: "消息通知", to: "/settings/notifications" },
      { title: "客户端配置", to: "/settings/client-config" },
    ],
  },
];

function SidebarMenuItemLink({ item }: { item: MenuItem }) {
  const matchRoute = useMatchRoute();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (item.children) {
    const hasActiveChild = mounted
      ? item.children.some((child) => !!matchRoute({ to: child.to, fuzzy: true }))
      : false;

    return (
      <Collapsible defaultOpen={hasActiveChild} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title} className="group/btn" isActive={hasActiveChild}>
              <item.icon className="size-4 transition-colors group-hover/btn:text-primary group-data-[active=true]/btn:text-primary" />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-data-[active=true]/btn:text-primary group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => (
                <SidebarMenuSubItem key={child.to}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={mounted && !!matchRoute({ to: child.to, fuzzy: child.to !== "/" })}
                  >
                    <Link to={child.to}>{child.title}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  if (!item.to) {
    return null;
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={mounted && !!matchRoute({ to: item.to, fuzzy: item.to !== "/" })}
        tooltip={item.title}
        className="group/btn"
      >
        <Link to={item.to}>
          <item.icon className="size-4 transition-colors group-hover/btn:text-primary group-data-[active=true]/btn:text-primary" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border h-16 bg-card/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
                  <CalendarDays className="size-4.5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold tracking-tight">赛事管理</span>
                  <span className="text-[11px] font-medium text-muted-foreground/70">
                    ADMIN PANEL
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            导航
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItemLink key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
