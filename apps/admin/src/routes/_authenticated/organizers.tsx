import { createFileRoute } from "@tanstack/react-router";
import { OrganizersPage } from "@/features/organizers/organizers-page";

export const Route = createFileRoute("/_authenticated/organizers")({
  component: OrganizersPage,
});
