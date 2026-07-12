import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type IconType = ComponentType<LucideProps>;

export type ColorKey = "purple" | "blue" | "green" | "gold" | "red";

export interface ThemeTokens {
  page: string;
  phone: string;
  panel: string;
  panel2: string;
  glass: string;
  border: string;
  text: string;
  muted: string;
  soft: string;
  purple: string;
  blue: string;
  green: string;
  gold: string;
  red: string;
}

export type ThemeName = "night" | "day";
export type ThemePref = "auto" | ThemeName;

export interface Vehicle {
  id: string;
  name: string;
  year: string;
  type: "Electric" | "Gas";
  level: string;
  range: string;
  rangeMi?: number;
  compliance: "compliant" | "limited";
  zoneLabel: string;
  note: string;
  color: ColorKey;
  Icon: IconType;
}

export interface Destination {
  name: string;
  type: string;
  area: string;
  eta: number;
  cost: number;
  parking: "Easy" | "Moderate" | "Difficult";
  parkingDetail: string;
  note: string;
  zoneRestricted: boolean;
  color: ColorKey;
  Icon: IconType;
  /** [longitude, latitude] — real Madrid coordinates, used for live Mapbox routing. */
  coords: [number, number];
}

export interface Friend {
  id: string;
  name: string;
  handle: string;
  city: string;
  bio: string;
  color: ColorKey;
  places: string[];
}

export interface Guide {
  title: string;
  subtitle: string;
  color: ColorKey;
  Icon: IconType;
  privacy: "Friends" | "Private" | "Public";
  PrivacyIcon: IconType;
  ownerId: string;
  places: string[];
}

export interface NearbyStop {
  name: string;
  type: string;
  etaAdd: string;
  detail: string;
  color: ColorKey;
  Icon: IconType;
}

export interface TrafficEvent {
  name: string;
  detail: string;
  impact: string;
  color: ColorKey;
  Icon: IconType;
}

export interface MemoryOption {
  title: string;
  detail: string;
  color: ColorKey;
  Icon: IconType;
}

export interface PlannerTemplate {
  title: string;
  prompt: string;
  stops: string[];
  color: ColorKey;
  Icon: IconType;
}

export interface AskVeloraIdea {
  title: string;
  answer: string;
  destination: string;
  color: ColorKey;
  Icon: IconType;
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: "Female" | "Male";
  desc: string;
  sample: string;
  preferredNames: string[];
  avoidNames: string[];
  lang: string;
  pitch: number;
  rate: number;
  fallbackIndex: number;
}

export interface RoutePrefs {
  avoidTolls: boolean;
  parkingFirst: boolean;
}

export interface PrivacySettings {
  hideHomeWork: boolean;
  blurParking: boolean;
  memoryLock: boolean;
  etaVisibility: "Private" | "Friends" | "Public";
}

export interface TripMemory {
  title: string;
  detail: string;
  color: ColorKey;
  Icon: IconType;
}

export interface Plan {
  title: string;
  prompt?: string;
  stops: string[];
  color: ColorKey;
  Icon: IconType;
}

export interface ParkedCar {
  location: string;
  walk: string;
  note?: string;
}

export interface EtaShared {
  friend: string;
  place: string;
}

export interface SavedGuideNotice {
  guide: string;
  place: string;
}

export interface AiMetric {
  label: string;
  value: number;
}

export interface AiDecision {
  score: number;
  confidence: "High" | "Medium";
  confidenceReason: string;
  metrics: AiMetric[];
  reasons: string[];
}

export type DrivingMode = "Express" | "Eco" | "Scenic";

export type UnitPref = "mi" | "km";

export type HomeWork = { home: string; work: string };
