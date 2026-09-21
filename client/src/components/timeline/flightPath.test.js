import { flightArc, flightArcPoint, flightEase, flightPoint, greatCircleAngle, surfacePath } from './flightPath';

const shanghai = { lat: 31.2304, lon: 121.4737 };
const nyc = { lat: 40.7128, lon: -74.006 };
const dc = { lat: 38.9072, lon: -77.0369 };

test.each([[shanghai, nyc], [nyc, dc], [nyc, nyc]])('surface route has exact endpoints and finite, closely spaced coordinates', (start, end) => {
  const points = surfacePath(start, end);
  expect(points[0]).toEqual(start);
  expect(points[points.length - 1]).toEqual(end);
  points.forEach((point, index) => {
    expect(Number.isFinite(point.lat) && Number.isFinite(point.lon)).toBe(true);
    if (index) expect(greatCircleAngle(points[index - 1], point)).toBeLessThan(0.018);
  });
});

test('date-line crossing takes the short way around the globe', () => {
  const middle = flightPoint({ lat: 0, lon: 170 }, { lat: 0, lon: -170 }, 0.5);
  expect(Math.abs(middle.lon)).toBeCloseTo(180);
  expect(middle.lat).toBeCloseTo(0);
});

test('antipodal endpoints do not cause an invalid camera position', () => {
  const middle = flightPoint({ lat: 0, lon: 0 }, { lat: 0, lon: 180 }, 0.5);
  expect(Number.isFinite(middle.lat) && Number.isFinite(middle.lon)).toBe(true);
});

test.each([[shanghai, nyc], [nyc, dc]])('flight arc bows gently while landing at both endpoints', (start, end) => {
  const points = flightArc(start, end);
  expect(points[0].lat).toBeCloseTo(start.lat);
  expect(points[0].lon).toBeCloseTo(start.lon);
  expect(points.at(-1).lat).toBeCloseTo(end.lat);
  expect(points.at(-1).lon).toBeCloseTo(end.lon);
  expect(points[0].altitude).toBe(0.002);
  expect(points.at(-1).altitude).toBe(0.002);
  const midpoint = flightArcPoint(start, end, 0.5);
  expect(greatCircleAngle(midpoint, flightPoint(start, end, 0.5))).toBeGreaterThan(0);
  expect(midpoint.altitude).toBeGreaterThan(0.002);
  points.forEach((point) => expect(point.altitude).toBeLessThanOrEqual(0.0371));
});

test('flight easing is monotonic, with gentle departure and arrival', () => {
  expect(flightEase(-1)).toBe(0);
  expect(flightEase(2)).toBe(1);
  expect(flightEase(0.5)).toBeCloseTo(0.5);
  expect(flightEase(0.01)).toBeLessThan(0.00001);
  expect(1 - flightEase(0.99)).toBeLessThan(0.00001);
  for (let index = 1; index <= 100; index += 1) {
    expect(flightEase(index / 100)).toBeGreaterThanOrEqual(flightEase((index - 1) / 100));
  }
});

test('an interrupted flight preserves the moving marker altitude', () => {
  const current = flightArcPoint(shanghai, nyc, 0.4);
  expect(flightArcPoint(current, dc, 0).altitude).toBe(current.altitude);
});
