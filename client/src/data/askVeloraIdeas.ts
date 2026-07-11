import { Building2, Coffee, Heart, Mountain } from "lucide-react";
import type { AskVeloraIdea } from "../types";

export const askVeloraIdeas: AskVeloraIdea[] = [
  {
    title: "Romantic with parking",
    answer: "I'd start with Garage near Sol, walk 4 minutes to Luna Rooftop, then end with Retiro Walk if the night is going well.",
    destination: "Luna Rooftop",
    color: "red",
    Icon: Heart,
  },
  {
    title: "Quiet coffee",
    answer: "Quiet Library Café is calmer than the center and parking is still possible before evening.",
    destination: "Quiet Library Café",
    color: "blue",
    Icon: Coffee,
  },
  {
    title: "Avoid busy streets",
    answer: "Use Scenic mode. It adds a few minutes but avoids the most stressful roads.",
    destination: "Retiro Walk",
    color: "green",
    Icon: Mountain,
  },
  {
    title: "Find parking first",
    answer: "Garage near Sol is the safest option before walking into Centro.",
    destination: "Garage near Sol",
    color: "green",
    Icon: Building2,
  },
];
