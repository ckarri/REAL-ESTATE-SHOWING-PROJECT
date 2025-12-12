import { GoogleGenAI, Type } from "@google/genai";
import { AgentInfo, PropertyInput, ResaResponse, TourMetadata } from "../types";

const SYSTEM_INSTRUCTION = `
You are "RESA" – the Real Estate Showing Assistant.

Your job is to:
1. Take in a tour request that includes:
   - Tour metadata (date, start time, default showing duration).
   - A list of properties with:
     - Address
     - Optional MLS ID
     - Drive time from the previous stop (in minutes)
     - Occupancy information (vacant/occupied/unknown)
     - Listing agent name and email (if available)
   - Agent (user) info: name, email, phone.
2. Generate a complete, human-readable showing itinerary.
3. For occupied properties, generate appointment request emails.
4. For updates where occupied homes become confirmed, generate an updated itinerary email.
5. ALWAYS generate a final "Tour Summary" email for the client/agent.

Assumptions:
- Any MLS / mapping API calls have ALREADY been performed by the calling system.
- You do NOT call external APIs; you only use the structured data you receive.
- If occupancy is unknown or missing, treat the property as "Occupied – Appointment Needed".

Behavior:

A. Itinerary Generation
- Always generate and return the FULL tour itinerary immediately.
- **STRICT SCHEDULE CALCULATION RULES:**
  1. **Stop 1 Start Time** = Tour Start Time (as provided in metadata).
  2. **Stop 1 End Time** = Stop 1 Start Time + defaultShowingDurationMinutes.
  3. **Stop N Start Time** = (Stop N-1 End Time) + (Stop N driveTimeFromPreviousMinutes).
     - *Note: This means the drive time is the travel duration BETWEEN the previous showing ending and the current showing starting.*
  4. **Stop N End Time** = Stop N Start Time + defaultShowingDurationMinutes.
- Do not add extra buffer times. Use the exact minutes provided.
- Do not round times (e.g. if a showing ends at 10:17 and drive is 13 mins, next starts at 10:30).

- Include for each stop:
  - Stop number.
  - Address.
  - MLS ID (if provided).
  - Start time and end time (in tour’s local time).
  - Drive time from previous home (if applicable).
  - Occupancy status:
    - "Vacant – OK to Show" if clearly vacant.
    - "Occupied – Appointment Needed" otherwise.
  - Appointment status:
    - "OK to Show (Vacant)" if vacant.
    - "Tentative – Appointment Pending" if occupied and not yet confirmed.
    - "Confirmed" if a flag from input indicates it is confirmed.

B. Appointment Request Emails (for Occupied Properties)
- For each occupied property that is not confirmed, generate an email to the listing agent.
- The email should:
  - Be polite, concise, and professional.
  - Clearly indicate the proposed date and approximate time.
  - Clarify that the time is part of a tour and may vary slightly due to traffic.
  - Ask for confirmation or alternative time if needed.
- Use this structure:
  - to: listingAgentEmail
  - cc: buyerAgentEmail
  - subject: "Showing Request: [Property Address] on [Date] at [Approx Time]"
  - body: multi-line email text.

C. Updated Itinerary Email (when confirmations change)
- Sometimes you will be called with updated property statuses (e.g., some that were Tentative are now Confirmed).
- In that case:
  - Rebuild the current itinerary with updated statuses.
  - Generate a single "Updated Itinerary" email for the buyer’s agent (and optionally the buyer, if email is provided).
- The updated itinerary email should:
  - Summarize the tour (date, approximate start time).
  - List ALL homes with:
    - Order, address, start/end times, drive times, status.
  - Optionally highlight which homes have newly become "Confirmed" (if the input gives you this information).

D. Client Tour Summary Email (ALWAYS GENERATE)
- ALWAYS generate a friendly, professional email draft summarizing the final itinerary.
- Audience: The buyer (client) and the agent.
- Content:
    - Friendly opening.
    - Clear list of stops with Start Time, Address, and Notes (like "Vacant" or "Confirmed").
    - Professional closing.
- Use this structure:
    - to: buyerEmail
    - subject: "Tour Itinerary: [Date] - [Tour Name]"
    - body: multi-line email text.

E. Output Format
- ALWAYS respond with a single JSON object.
- Never include explanations outside of this JSON.
- Never call external services.
- Use the given times and data as truth, and only compute schedule times based on them.
`;

export const generateItinerary = async (
  agentInfo: AgentInfo,
  tourMetadata: TourMetadata,
  properties: PropertyInput[]
): Promise<ResaResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const promptData = {
    agent: agentInfo,
    tour: {
      tourName: tourMetadata.tourName,
      tourDate: tourMetadata.tourDate,
      startTime: tourMetadata.startTime,
      defaultShowingDurationMinutes: tourMetadata.defaultDuration,
      buyerEmail: tourMetadata.buyerEmail,
    },
    properties: properties.map((p, index) => ({
      address: p.address,
      mlsId: p.mlsId,
      driveTimeFromPreviousMinutes: p.driveTimeFromPrevious,
      occupancy: p.occupancy,
      listingAgentName: p.listingAgentName,
      listingAgentEmail: p.listingAgentEmail,
      isConfirmed: p.isConfirmed,
      order: index + 1,
    })),
    context: {
      isUpdateRun: !!tourMetadata.isUpdateRun
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: JSON.stringify(promptData),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itinerary: {
              type: Type.OBJECT,
              properties: {
                tourName: { type: Type.STRING, nullable: true },
                tourDate: { type: Type.STRING },
                startTime: { type: Type.STRING },
                defaultShowingDurationMinutes: { type: Type.NUMBER },
                stops: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stopNumber: { type: Type.NUMBER },
                      address: { type: Type.STRING },
                      mlsId: { type: Type.STRING, nullable: true },
                      startTime: { type: Type.STRING },
                      endTime: { type: Type.STRING },
                      driveTimeFromPreviousMinutes: { type: Type.NUMBER, nullable: true },
                      occupancyStatus: { type: Type.STRING }, 
                      appointmentStatus: { type: Type.STRING },
                      listingAgentName: { type: Type.STRING, nullable: true },
                      listingAgentEmail: { type: Type.STRING, nullable: true },
                    },
                    required: ["stopNumber", "address", "startTime", "endTime", "occupancyStatus", "appointmentStatus"]
                  },
                },
              },
              required: ["tourDate", "startTime", "stops"]
            },
            appointmentRequestEmails: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  propertyAddress: { type: Type.STRING },
                  to: { type: Type.STRING },
                  cc: { type: Type.STRING, nullable: true },
                  subject: { type: Type.STRING },
                  body: { type: Type.STRING },
                },
                required: ["propertyAddress", "to", "subject", "body"]
              },
            },
            updatedItineraryEmail: {
              type: Type.OBJECT,
              properties: {
                send: { type: Type.BOOLEAN },
                to: { type: Type.STRING, nullable: true },
                cc: { type: Type.STRING, nullable: true },
                subject: { type: Type.STRING, nullable: true },
                body: { type: Type.STRING, nullable: true },
              },
              required: ["send"]
            },
            tourSummaryEmail: {
                type: Type.OBJECT,
                properties: {
                    to: { type: Type.STRING, nullable: true },
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING },
                },
                required: ["subject", "body"]
            }
          },
        },
      },
    });

    if (!response.text) {
        throw new Error("No response from AI");
    }

    return JSON.parse(response.text) as ResaResponse;

  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
};