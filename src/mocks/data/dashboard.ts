export interface DashboardStats {
  todayOrders: number;
  todayUsers: number;
  pendingRefunds: number;
  monthlyRevenue: number;
}

export interface RecentOrder {
  id: string;
  orderNo: string;
  eventName: string;
  userName: string;
  amount: number;
  status: "pending" | "paid" | "refunded" | "cancelled";
  createdAt: string;
}

export interface RecentEvent {
  id: string;
  name: string;
  status: "draft" | "published" | "ended";
  startDate: string;
  location: string;
  currentParticipants: number;
}

export const dashboardStats: DashboardStats = {
  todayOrders: 128,
  todayUsers: 56,
  pendingRefunds: 12,
  monthlyRevenue: 158000,
};

export const recentOrders: RecentOrder[] = [
  {
    id: "1",
    orderNo: "ORD20260518001",
    eventName: "2026北京马拉松",
    userName: "张三",
    amount: 200,
    status: "paid",
    createdAt: "2026-05-18 10:30:00",
  },
  {
    id: "2",
    orderNo: "ORD20260518002",
    eventName: "2026上海半程马拉松",
    userName: "李四",
    amount: 150,
    status: "pending",
    createdAt: "2026-05-18 09:15:00",
  },
  {
    id: "3",
    orderNo: "ORD20260517003",
    eventName: "2026杭州马拉松",
    userName: "王五",
    amount: 180,
    status: "refunded",
    createdAt: "2026-05-17 16:45:00",
  },
  {
    id: "4",
    orderNo: "ORD20260517004",
    eventName: "2026北京马拉松",
    userName: "赵六",
    amount: 200,
    status: "paid",
    createdAt: "2026-05-17 14:20:00",
  },
  {
    id: "5",
    orderNo: "ORD20260517005",
    eventName: "2026厦门马拉松",
    userName: "钱七",
    amount: 160,
    status: "cancelled",
    createdAt: "2026-05-17 11:00:00",
  },
];

export const recentEvents: RecentEvent[] = [
  {
    id: "1",
    name: "2026北京马拉松",
    status: "published",
    startDate: "2026-10-15",
    location: "北京天安门广场",
    currentParticipants: 28500,
  },
  {
    id: "2",
    name: "2026上海半程马拉松",
    status: "published",
    startDate: "2026-11-02",
    location: "上海东方明珠",
    currentParticipants: 12000,
  },
  {
    id: "3",
    name: "2026杭州马拉松",
    status: "draft",
    startDate: "2026-12-01",
    location: "杭州黄龙体育中心",
    currentParticipants: 0,
  },
];
