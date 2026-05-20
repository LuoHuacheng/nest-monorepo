import { createFileRoute } from "@tanstack/react-router";
import { ShuttleBusesPage } from "@/features/events/shuttle-buses-page";

export const Route = createFileRoute("/_authenticated/events/shuttle-buses")({
  component: ShuttleBusesPage,
});
