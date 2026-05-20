import { createFileRoute } from "@tanstack/react-router";
import { ClientConfigPage } from "@/features/settings/client-config-page";

export const Route = createFileRoute("/_authenticated/settings/client-config")({
  component: ClientConfigPage,
});
