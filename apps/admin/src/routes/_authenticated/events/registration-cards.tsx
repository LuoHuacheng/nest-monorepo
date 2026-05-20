import { createFileRoute } from "@tanstack/react-router";
import { RegistrationCardsPage } from "@/features/events/registration-cards-page";

export const Route = createFileRoute("/_authenticated/events/registration-cards")({
  component: RegistrationCardsPage,
});
