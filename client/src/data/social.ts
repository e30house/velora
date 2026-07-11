import { Building2, Coffee, Globe, Heart, Lock, Mountain, Users } from "lucide-react";
import type { Friend, Guide } from "../types";

export const friends: Friend[] = [
  {
    id: "maya",
    name: "Maya",
    handle: "@maya",
    city: "Madrid",
    bio: "Coffee, rooftops, quiet corners, and places that feel good after sunset.",
    color: "blue",
    places: ["Fern & Copper", "Quiet Library Café", "Luna Rooftop"],
  },
  {
    id: "jordan",
    name: "Jordan",
    handle: "@jordan",
    city: "Madrid",
    bio: "Weekend walks, calm routes, and parking-friendly places around the city.",
    color: "green",
    places: ["Retiro Walk", "Garage near Sol", "Quiet Library Café"],
  },
  {
    id: "sofia",
    name: "Sofia",
    handle: "@sofia",
    city: "Madrid",
    bio: "Date-night spots, galleries, rooftops, and hidden streets in Centro.",
    color: "red",
    places: ["Luna Rooftop", "Garage near Sol", "Fern & Copper"],
  },
];

export const guides: Guide[] = [
  { title: "Coffee", subtitle: "12 places for slow mornings", color: "blue", Icon: Coffee, privacy: "Friends", PrivacyIcon: Users, ownerId: "maya", places: ["Fern & Copper", "Quiet Library Café", "Retiro Walk"] },
  { title: "Date night", subtitle: "8 places with easy parking", color: "red", Icon: Heart, privacy: "Private", PrivacyIcon: Lock, ownerId: "sofia", places: ["Luna Rooftop", "Garage near Sol", "Fern & Copper"] },
  { title: "Weekend walks", subtitle: "6 quieter outdoor routes", color: "green", Icon: Mountain, privacy: "Public", PrivacyIcon: Globe, ownerId: "jordan", places: ["Retiro Walk", "Quiet Library Café", "Garage near Sol"] },
  { title: "Parking", subtitle: "Reliable garages near busy areas", color: "gold", Icon: Building2, privacy: "Friends", PrivacyIcon: Users, ownerId: "jordan", places: ["Garage near Sol", "Work", "Luna Rooftop"] },
];
