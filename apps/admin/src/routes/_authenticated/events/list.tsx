import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/features/events/event-list-page";

export const Route = createFileRoute("/_authenticated/events/list")({
  component: EventsPage,
});
