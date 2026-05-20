import { createFileRoute } from "@tanstack/react-router";
import { EventFormPage } from "@/features/events/event-form-page";

export const Route = createFileRoute("/_authenticated/events/create")({
  component: () => <EventFormPage />,
});
