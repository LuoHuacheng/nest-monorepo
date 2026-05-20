import { createFileRoute } from "@tanstack/react-router";
import { PacerEventsPage } from "@/features/pacers/pacer-events-page";

export const Route = createFileRoute("/_authenticated/pacers/events")({
  component: PacerEventsPage,
});
