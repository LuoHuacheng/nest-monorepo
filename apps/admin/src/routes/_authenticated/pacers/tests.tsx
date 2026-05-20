import { createFileRoute } from "@tanstack/react-router";
import { PacerTestsPage } from "@/features/pacers/pacer-tests-page";

export const Route = createFileRoute("/_authenticated/pacers/tests")({
  component: PacerTestsPage,
});
