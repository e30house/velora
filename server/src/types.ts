export type VeloraAction = "parking" | "scenic" | "date" | "airport" | "garage" | "score" | "route";

export type Confidence = "High" | "Medium";

export interface VeloraDestination {
  name: string;
  type: string;
  area: string;
  eta: number;
  cost: number;
  parking: "Easy" | "Moderate" | "Difficult";
  parkingDetail: string;
  note: string;
  zoneRestricted: boolean;
}

export interface VeloraVehicle {
  name: string;
  type: "Electric" | "Gas";
  level: string;
  range: string;
  compliance: "compliant" | "limited";
}

export interface VeloraTrafficEvent {
  name: string;
  detail: string;
  impact: string;
}

export interface VeloraTripMemory {
  title: string;
  detail: string;
}

export interface VeloraPlan {
  title: string;
  stops: string[];
}

export interface VeloraRoutePrefs {
  avoidTolls: boolean;
  parkingFirst: boolean;
}

// What the client sends: the same live context a human would see on screen
// when they type a question, so the model (or the fallback) can ground its
// answer in the actual route instead of guessing.
export interface AskVeloraRequest {
  prompt: string;
  destination: VeloraDestination;
  vehicle: VeloraVehicle;
  prefs: VeloraRoutePrefs;
  trafficEvent: VeloraTrafficEvent | null;
  tripMemory: VeloraTripMemory | null;
  activePlan: VeloraPlan | null;
  unitPref: "mi" | "km";
}

export interface AskVeloraResponse {
  title: string;
  text: string;
  confidence: Confidence;
  action: VeloraAction;
  actionLabel: string;
  source: "claude" | "fallback";
}

// A real place from Mapbox geocoding — anywhere in the world, not one of
// the curated demo destinations. Velora doesn't know real parking/cost/zone
// facts about it, so those get estimated (see PlaceEstimateResponse).
export interface EstimatePlaceRequest {
  name: string;
  address: string;
  category: string | null;
  lat: number;
  lng: number;
}

export interface EstimatePlaceResponse {
  parking: "Easy" | "Moderate" | "Difficult";
  parkingDetail: string;
  cost: number;
  zoneRestricted: boolean;
  note: string;
  type: string;
  source: "claude" | "fallback";
}
