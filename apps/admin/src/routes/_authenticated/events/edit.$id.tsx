import { createFileRoute } from "@tanstack/react-router";
import { EventFormPage } from "@/features/events/event-form-page";

export const Route = createFileRoute("/_authenticated/events/edit/$id")({
  component: EditEventPage,
});

function EditEventPage() {
  const { id } = Route.useParams();
  return <EventFormPage eventId={id} />;
}
