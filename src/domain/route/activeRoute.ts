// Pure builder for the renderable geometry of the active route leg.
//
// Signal K deltas give us the next and (optionally) previous waypoint positions
// for the active leg. From those plus the vessel position we derive the shapes
// the chart draws: the active leg line, a course-to-steer line from the boat to
// the next waypoint, and the waypoint markers. Multi-leg route resources are a
// future enhancement; this covers the active-leg geometry available live.

export interface LatLon {
  latitude: number;
  longitude: number;
}

export interface ActiveRouteInput {
  vessel: LatLon | null;
  nextWaypoint: LatLon | null;
  previousWaypoint: LatLon | null;
}

export interface ActiveRouteGeometry {
  // The active leg (previous -> next), drawn solid. Empty when there is no
  // known previous waypoint (e.g. steering to a single "go to" mark).
  legs: Array<[LatLon, LatLon]>;
  // Boat -> next waypoint, drawn dashed as the course to steer.
  courseToSteer: [LatLon, LatLon] | null;
  nextWaypoint: LatLon | null;
  previousWaypoint: LatLon | null;
}

function isValid(point: LatLon | null): point is LatLon {
  return (
    point !== null &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude)
  );
}

// Returns null when there is no next waypoint to steer to, so callers can simply
// clear the route overlay.
export function buildActiveRoute(input: ActiveRouteInput): ActiveRouteGeometry | null {
  const next = isValid(input.nextWaypoint) ? input.nextWaypoint : null;
  if (!next) return null;

  const previous = isValid(input.previousWaypoint) ? input.previousWaypoint : null;
  const vessel = isValid(input.vessel) ? input.vessel : null;

  return {
    legs: previous ? [[previous, next]] : [],
    courseToSteer: vessel ? [vessel, next] : null,
    nextWaypoint: next,
    previousWaypoint: previous,
  };
}
