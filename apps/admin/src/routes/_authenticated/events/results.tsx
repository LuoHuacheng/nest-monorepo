import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/features/events/results-page";

export const Route = createFileRoute("/_authenticated/events/results")({
  component: ResultsPage,
});
