import { createFileRoute } from "@tanstack/react-router";
import { InviteCodesPage } from "@/features/events/invite-codes-page";

export const Route = createFileRoute("/_authenticated/events/invite-codes")({
  component: InviteCodesPage,
});
