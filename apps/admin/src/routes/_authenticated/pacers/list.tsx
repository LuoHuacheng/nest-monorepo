import { createFileRoute } from "@tanstack/react-router";
import { PacersPage } from "@/features/pacers/pacer-list-page";

export const Route = createFileRoute("/_authenticated/pacers/list")({
  component: PacersPage,
});
