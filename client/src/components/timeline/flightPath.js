const radians = (value) => value * Math.PI / 180;
const degrees = (value) => value * 180 / Math.PI;

// Zero velocity and acceleration at departure and arrival.
export function flightEase(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function greatCircleAngle(start, end) {
  const lat1 = radians(start.lat);
  const lat2 = radians(end.lat);
  const h = Math.sin((lat2 - lat1) / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(radians(end.lon - start.lon) / 2) ** 2;
  return 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, h))));
}

// Spherical interpolation follows the shortest route, including the date line.
export function flightPoint(start, end, progress) {
  if (progress <= 0) return { ...start };
  if (progress >= 1) return { ...end };
  const vector = ({ lat, lon }) => [Math.cos(radians(lat)) * Math.cos(radians(lon)), Math.cos(radians(lat)) * Math.sin(radians(lon)), Math.sin(radians(lat))];
  const a = vector(start);
  const b = vector(end);
  const angle = greatCircleAngle(start, end);
  if (angle < 0.000001) return { ...end };
  const cosine = Math.cos(angle);
  let tangent = b.map((value, i) => value - a[i] * cosine);
  let length = Math.hypot(...tangent);
  if (length < 0.000001) {
    tangent = Math.abs(a[2]) < 0.9 ? [-a[1], a[0], 0] : [0, -a[2], a[1]];
    length = Math.hypot(...tangent);
  }
  const point = a.map((value, i) => value * Math.cos(angle * progress) + tangent[i] / length * Math.sin(angle * progress));
  return { lat: degrees(Math.atan2(point[2], Math.hypot(point[0], point[1]))), lon: degrees(Math.atan2(point[1], point[0])) };
}

export function surfacePath(start, end) {
  const segments = Math.max(16, Math.ceil(greatCircleAngle(start, end) * 180 / Math.PI));
  return Array.from({ length: segments + 1 }, (_, index) => flightPoint(start, end, index / segments));
}

// A small sideways bow makes the flight read as an arch from the moving
// camera; a low lift keeps it close to the globe rather than towering above it.
export function flightArcPoint(start, end, progress) {
  const point = flightPoint(start, end, progress);
  const angle = greatCircleAngle(start, end);
  const vector = ({ lat, lon }) => [Math.cos(radians(lat)) * Math.cos(radians(lon)), Math.cos(radians(lat)) * Math.sin(radians(lon)), Math.sin(radians(lat))];
  const a = vector(start);
  const b = vector(end);
  const normal = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const length = Math.hypot(...normal);
  const envelope = progress <= 0 || progress >= 1 ? 0 : Math.sin(Math.PI * progress);
  const bow = Math.min(0.14, angle * 0.14) * envelope;
  const v = vector(point).map((value, index) => value * Math.cos(bow) + (length > 0.000001 ? normal[index] / length * Math.sin(bow) : 0));
  return {
    lat: degrees(Math.atan2(v[2], Math.hypot(v[0], v[1]))),
    lon: degrees(Math.atan2(v[1], v[0])),
    altitude: (start.altitude ?? 0.002) * (1 - progress) + (end.altitude ?? 0.002) * progress
      + Math.min(0.035, angle * 0.06) * envelope ** 2,
  };
}

export function flightArc(start, end) {
  const segments = Math.max(32, Math.ceil(greatCircleAngle(start, end) * 180 / Math.PI));
  return Array.from({ length: segments + 1 }, (_, index) => flightArcPoint(start, end, index / segments));
}
