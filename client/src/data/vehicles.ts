import { Battery, Fuel } from "lucide-react";
import type { Vehicle } from "../types";

export const vehicles: Vehicle[] = [
  {
    id: "model-y",
    name: "Model Y",
    year: "2024",
    type: "Electric",
    level: "73%",
    range: "310 mi",
    compliance: "compliant",
    zoneLabel: "Zone compliant",
    note: "Can enter low-emission zones.",
    color: "green",
    Icon: Battery,
  },
  {
    id: "tacoma",
    name: "Tacoma",
    year: "2019",
    type: "Gas",
    level: "42%",
    range: "260 mi",
    compliance: "limited",
    zoneLabel: "Check zone",
    note: "May be restricted in central low-emission zones.",
    color: "gold",
    Icon: Fuel,
  },
];
