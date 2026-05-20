export type EventStatus =
  | "registration_not_started"
  | "registration_open"
  | "registration_ended"
  | "event_not_started"
  | "event_in_progress"
  | "event_ended";

export function computeEventStatus(event: {
  startDate: Date;
  endDate: Date;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  groupDrawCompleted: boolean;
  adminConfirmed: boolean;
}): EventStatus {
  const now = new Date();

  if (now >= event.endDate) return "event_ended";
  if (now >= event.startDate) return "event_in_progress";

  if (!event.registrationStartDate || now < event.registrationStartDate)
    return "registration_not_started";
  if (!event.registrationEndDate || now < event.registrationEndDate) return "registration_open";

  // registrationEndDate <= now < startDate
  if (event.groupDrawCompleted && event.adminConfirmed) return "event_not_started";
  return "registration_ended";
}
