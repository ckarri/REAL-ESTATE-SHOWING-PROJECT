export interface PropertyInput {
  id: string;
  address: string;
  mlsId?: string;
  driveTimeFromPrevious: number;
  occupancy: 'Vacant' | 'Occupied' | 'Unknown';
  listingAgentName?: string;
  listingAgentEmail?: string;
  isConfirmed?: boolean;
}

export interface AgentInfo {
  name: string;
  email: string;
  phone: string;
}

export interface TourMetadata {
  tourName: string;
  tourDate: string;
  startTime: string;
  defaultDuration: number;
  buyerEmail?: string;
  isUpdateRun?: boolean;
}

export interface ItineraryStop {
  stopNumber: number;
  address: string;
  mlsId: string | null;
  startTime: string;
  endTime: string;
  driveTimeFromPreviousMinutes: number | null;
  occupancyStatus: "Vacant – OK to Show" | "Occupied – Appointment Needed";
  appointmentStatus: "OK to Show (Vacant)" | "Tentative – Appointment Pending" | "Confirmed";
  listingAgentName: string | null;
  listingAgentEmail: string | null;
}

export interface AppointmentRequestEmail {
  propertyAddress: string;
  to: string;
  cc: string | null;
  subject: string;
  body: string;
}

export interface UpdatedItineraryEmail {
  send: boolean;
  to: string | null;
  cc: string | null;
  subject: string | null;
  body: string | null;
}

export interface TourSummaryEmail {
  to: string | null;
  subject: string;
  body: string;
}

export interface ResaResponse {
  itinerary: {
    tourName: string | null;
    tourDate: string;
    startTime: string;
    defaultShowingDurationMinutes: number;
    stops: ItineraryStop[];
  };
  appointmentRequestEmails: AppointmentRequestEmail[];
  updatedItineraryEmail: UpdatedItineraryEmail;
  tourSummaryEmail: TourSummaryEmail;
}