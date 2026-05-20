import { createFileRoute } from "@tanstack/react-router";
import { OnlineOrdersPage } from "@/features/orders/online-orders-page";

export const Route = createFileRoute("/_authenticated/orders/online")({
  component: OnlineOrdersPage,
});
