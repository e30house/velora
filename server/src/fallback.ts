import type { AskVeloraRequest, AskVeloraResponse } from "./types.js";

function canEnter(vehicle: AskVeloraRequest["vehicle"], destination: AskVeloraRequest["destination"]): boolean {
  if (!destination.zoneRestricted) return true;
  return vehicle.compliance === "compliant";
}

// Deterministic, keyword-matched responder. This is what Velora used before
// any LLM was wired in, and it stays as the offline/no-API-key fallback so
// the app is never fully broken while you're setting up billing.
export function buildFallbackAnswer(req: AskVeloraRequest): AskVeloraResponse {
  const { prompt, destination, vehicle, prefs, trafficEvent, tripMemory, activePlan } = req;
  const q = prompt.toLowerCase();
  const allowed = canEnter(vehicle, destination);

  if (q.includes("parking") || q.includes("garage")) {
    return {
      title: "Parking-first plan",
      text:
        destination.parking === "Easy"
          ? `${destination.name} already has a strong parking outlook. I would keep the current route and guide you directly to the best entrance.`
          : `Parking near ${destination.name} looks ${destination.parking.toLowerCase()}. I recommend routing to parking first, then switching to walking directions.`,
      confidence: destination.parking === "Easy" ? "High" : "Medium",
      action: "parking",
      actionLabel: "Use parking-first",
      source: "fallback",
    };
  }

  if (q.includes("quiet") || q.includes("calm") || q.includes("stress") || q.includes("scenic")) {
    return {
      title: "Calmer route",
      text: "I would use Scenic mode and avoid the most stressful merges. It may add a few minutes, but the lane changes are easier and the instructions can be given earlier.",
      confidence: "High",
      action: "scenic",
      actionLabel: "Use calmer route",
      source: "fallback",
    };
  }

  if (q.includes("date") || q.includes("romantic")) {
    return {
      title: "Date-night plan",
      text: "Start with parking near the venue, walk in, and keep a quiet walk as an optional final stop. That avoids searching for parking at the end of the drive.",
      confidence: "High",
      action: "date",
      actionLabel: "Open date-night plan",
      source: "fallback",
    };
  }

  if (q.includes("airport") || q.includes("flight")) {
    return {
      title: "Airport timing",
      text: `${destination.name} is about ${destination.eta} minutes away in normal traffic. I would build in an extra 20-minute safety buffer and check fuel or charge before entering the airport road network.`,
      confidence: trafficEvent ? "Medium" : "High",
      action: "airport",
      actionLabel: "Route to airport",
      source: "fallback",
    };
  }

  if (q.includes("fuel") || q.includes("charge") || q.includes("range")) {
    return {
      title: vehicle.type === "Electric" ? "Charge strategy" : "Fuel strategy",
      text:
        vehicle.type === "Electric"
          ? `${vehicle.name} has ${vehicle.level} remaining and about ${vehicle.range} of estimated range. You have enough for this trip, but overnight charging is still the cheaper choice.`
          : `${vehicle.name} has ${vehicle.level} remaining and about ${vehicle.range} of estimated range. I would only add a fuel stop if your next journey is longer than expected.`,
      confidence: "High",
      action: "garage",
      actionLabel: "Open Garage",
      source: "fallback",
    };
  }

  if (q.includes("why") || q.includes("route")) {
    return {
      title: "Why this route",
      text: `${allowed ? `${vehicle.name} passes the zone check.` : `${vehicle.name} may be restricted, so I will stop you before the zone.`} ${
        prefs.parkingFirst ? "Parking-first is active. " : ""
      }${trafficEvent ? `${trafficEvent.name} is reducing route confidence. ` : "Traffic conditions are stable. "}${
        tripMemory ? `I also remember that you prefer ${tripMemory.title.toLowerCase()}.` : "I am prioritizing time, lane simplicity, and parking."
      }`,
      confidence: trafficEvent ? "Medium" : "High",
      action: "score",
      actionLabel: "View route score",
      source: "fallback",
    };
  }

  return {
    title: "Velora recommendation",
    text: `${activePlan ? `Your ${activePlan.title} plan is active. ` : ""}For ${destination.name}, I would keep the route simple, explain every lane change early, and handle parking before arrival if conditions worsen.`,
    confidence: trafficEvent ? "Medium" : "High",
    action: "route",
    actionLabel: "Continue route",
    source: "fallback",
  };
}
