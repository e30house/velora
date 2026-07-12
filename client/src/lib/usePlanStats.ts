import { useEffect, useState } from "react";
import { findDestination, planStats as mockPlanStats } from "./helpers";
import { fetchRoute, hasMapboxToken } from "./mapbox";

export interface PlanStatsResult {
  eta: number;
  cost: number;
  hardParking: boolean;
  isReal: boolean;
}

// Sums real Mapbox routes leg-by-leg (origin -> stop1 -> stop2 -> ...)
// instead of the flat mock destination.eta sum, so multi-stop trip time
// is as real as single-destination navigation already is. Falls back to
// the mock sum with no token configured or if a leg's request fails —
// same degrade-gracefully pattern used everywhere else in the app.
export function usePlanStats(stops: string[], origin: [number, number]): PlanStatsResult {
  const mock = mockPlanStats(stops);
  const [result, setResult] = useState<PlanStatsResult>({ ...mock, isReal: false });

  useEffect(() => {
    setResult({ ...mockPlanStats(stops), isReal: false });
    if (!hasMapboxToken() || stops.length === 0) return;

    let cancelled = false;

    async function computeReal() {
      try {
        const places = stops.map(findDestination);
        let totalMinutes = 0;
        let point = origin;
        for (const place of places) {
          const route = await fetchRoute(point, place.coords);
          totalMinutes += route.durationMinutes;
          point = place.coords;
        }
        if (!cancelled) {
          setResult({ eta: totalMinutes, cost: mock.cost, hardParking: mock.hardParking, isReal: true });
        }
      } catch (err) {
        console.error("Real plan routing failed, using mock estimate:", err);
      }
    }

    computeReal();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops.join("|"), origin[0], origin[1]]);

  return result;
}
