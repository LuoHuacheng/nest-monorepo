export interface Order {
  id: string;
  orderNo: string;
  eventName: string;
  userName: string;
  amount: number;
  status: "pending" | "paid" | "refunded" | "cancelled";
  createdAt: string;
}

export interface OnlineOrder {
  id: string;
  orderNo: string;
  eventName: string;
  userName: string;
  amount: number;
  status: "pending" | "paid" | "refunded" | "cancelled";
  proofUrl?: string;
  createdAt: string;
}
