import { createFileRoute } from "@tanstack/react-router";
import { EventOrdersPage } from "@/features/orders/event-orders-page";

export const Route = createFileRoute("/_authenticated/orders/events")({
  component: EventOrdersPage,
});
