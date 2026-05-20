import { createFileRoute } from "@tanstack/react-router";
import { AthleticCentersPage } from "@/features/athletic-centers/athletic-centers-page";

export const Route = createFileRoute("/_authenticated/athletic-centers")({
  component: AthleticCentersPage,
});
