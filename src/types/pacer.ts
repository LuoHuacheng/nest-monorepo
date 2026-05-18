export type PacerStatus = "pending" | "approved" | "suspended" | "revoked";

export interface Pacer {
  id: string;
  pacerNo?: string;
  name: string;
  phone: string;
  idCard: string;
  avatar?: string;
  paceSegments: string[];
  targetTime?: string;
  clothingSize: string;
  validFrom: string;
  validTo: string;
  healthReportUrl: string;
  ecgImageUrl: string;
  marathonCertificates: string[];
  pacePlanImageUrl: string;
  status: PacerStatus;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PacerTest {
  id: string;
  pacerId: string;
  pacerName: string;
  testDate: string;
  location?: string;
  finishTime: string;
  videoUrl?: string;
  status: number;
  createdAt: string;
}

export interface PacerEvent {
  id: string;
  pacerId: string;
  pacerName: string;
  eventId: string;
  eventName: string;
  targetTime?: string;
  status: "assigned" | "withdrawn" | "completed";
  assignedAt: string;
  createdAt: string;
}
