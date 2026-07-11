import { Building2, Coffee, Heart, Mountain, Plane } from "lucide-react";
import type { MemoryOption, PlannerTemplate } from "../types";

export const memoryOptions: MemoryOption[] = [
  { title: "Easy parking", detail: "Prioritize places with garage or simple parking.", color: "green", Icon: Building2 },
  { title: "Quiet streets", detail: "Suggest calmer routes when time allows.", color: "blue", Icon: Mountain },
  { title: "Date night vibe", detail: "Remember places that feel better after sunset.", color: "red", Icon: Heart },
  { title: "Coffee stop", detail: "Keep good coffee stops near your routes.", color: "gold", Icon: Coffee },
];

export const plannerTemplates: PlannerTemplate[] = [
  {
    title: "Date night",
    prompt: "Romantic plan with easy parking",
    stops: ["Garage near Sol", "Luna Rooftop", "Retiro Walk"],
    color: "red",
    Icon: Heart,
  },
  {
    title: "Slow morning",
    prompt: "Quiet coffee and a calm walk",
    stops: ["Fern & Copper", "Retiro Walk", "Quiet Library Café"],
    color: "gold",
    Icon: Coffee,
  },
  {
    title: "Airport run",
    prompt: "Efficient airport route with fuel check",
    stops: ["Low-cost Fuel", "Madrid Airport"],
    color: "blue",
    Icon: Plane,
  },
];
