export type EventStatus =
  | "registration_not_started"
  | "registration_open"
  | "registration_ended"
  | "event_not_started"
  | "event_in_progress"
  | "event_ended";

export type PublishStatus = "draft" | "published" | "offline";

export type EventAttribute = "online" | "shuttle_bus" | "pacer_recruitment";

export interface EventRegistrationGroup {
  id?: string;
  eventId?: string;
  name?: string;
  groupType: string;
  specName: string;
  specDescription?: string;
  genderLimit: string;
  minAge: number;
  maxAge: number;
  price: number;
  quota: number;
  soldCount?: number;
  status?: number;
  sort?: number;
  createdAt?: string;
}

export interface Event {
  id: string;
  name: string;
  category: string;
  publishStatus: PublishStatus;
  eventStatus?: EventStatus;
  groupDrawCompleted: boolean;
  adminConfirmed: boolean;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  province: string;
  city: string;
  address: string;
  location: string;
  tags: string[];
  packetPickupTime: string;
  packetPickupLocation: string;
  coverImages: string[];
  isHot: boolean;
  attributes: EventAttribute[];
  description: string;
  remark?: string;
  competitionRules?: string;
  entryStatement?: string;
  raceRoute?: string;
  registrationNotice?: string;
  pickupNotice?: string;
  maxParticipants: number;
  currentParticipants: number;
  organizerId: string;
  registrationGroups: EventRegistrationGroup[];
  createdAt: string;
  updatedAt?: string;
}

export interface RegistrationCard {
  id: string;
  name: string;
  relationship: string;
  idNumber: string;
  gender: string;
  birthDate: string;
  bloodType?: string;
  clothingSize?: string;
  phone: string;
  province?: string;
  city?: string;
  permanentAddress?: string;
  detailedAddress?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: number;
  createdAt: string;
  updatedAt?: string;
}

export interface InviteCode {
  id: string;
  eventId: string;
  eventName: string;
  code: string;
  maxUses: number;
  usedCount: number;
  status: number;
  expiresAt?: string;
  createdAt: string;
}

export interface ShuttleBus {
  id: string;
  eventId: string;
  eventName: string;
  route: string;
  departureTime: string;
  capacity: number;
  status: number;
  createdAt: string;
}

export interface EventResult {
  id: string;
  eventId: string;
  eventName: string;
  userId?: string;
  userName?: string;
  bibNumber: string;
  finishTime: string;
  rank?: number;
  status: number;
  createdAt: string;
}
