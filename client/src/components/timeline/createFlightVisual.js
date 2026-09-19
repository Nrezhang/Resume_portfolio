import { BufferGeometry, Color, Float32BufferAttribute, Group, Line, Mesh, MeshBasicMaterial, ShaderMaterial, SphereGeometry } from 'three';
import { flightArcPoint } from './flightPath';

// Build once per destination. Animation only changes shader uniforms and the
// marker transform, never the route geometry or Globe.GL data layers.
export default function createFlightVisual(globe, start, end, angle) {
  const segments = 512;
  const coordinates = [];
  const distances = [];
  for (let index = 0; index <= segments; index += 1) {
    const point = flightArcPoint(start, end, index / segments);
    const position = globe.getCoords(point.lat, point.lon, point.altitude);
    coordinates.push(position.x, position.y, position.z);
    distances.push(index / segments);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(coordinates, 3));
  geometry.setAttribute('routeProgress', new Float32BufferAttribute(distances, 1));
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      head: { value: 0 }, tail: { value: 0 }, opacity: { value: 1 },
      color: { value: new Color('#f2d663') },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute float routeProgress;
      varying float progress;
      void main() {
        progress = routeProgress;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <logdepthbuf_pars_fragment>
      uniform float head;
      uniform float tail;
      uniform float opacity;
      uniform vec3 color;
      varying float progress;
      void main() {
        if (progress > head || progress < tail) discard;
        float fade = smoothstep(tail, tail + min(0.035, (head - tail) * 0.4) + 0.00001, progress);
        gl_FragColor = vec4(color, opacity * fade);
        #include <logdepthbuf_fragment>
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const line = new Line(geometry, material);
  const markerGeometry = new SphereGeometry(0.35, 12, 8);
  const markerMaterial = new MeshBasicMaterial({ color: '#fff9da', transparent: true, depthWrite: false });
  const marker = new Mesh(markerGeometry, markerMaterial);
  const group = new Group();
  group.add(line, marker);
  globe.scene().add(group);
  let disposed = false;

  return {
    update(progress) {
      material.uniforms.head.value = progress;
      material.uniforms.tail.value = Math.max(0, progress - Math.min(1, 0.45 / angle));
      const point = flightArcPoint(start, end, progress);
      const position = globe.getCoords(point.lat, point.lon, point.altitude + 0.002);
      marker.position.set(position.x, position.y, position.z);
      return point;
    },
    fade(opacity) {
      material.uniforms.opacity.value = opacity;
      markerMaterial.opacity = opacity;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      globe.scene().remove(group);
      geometry.dispose();
      material.dispose();
      markerGeometry.dispose();
      markerMaterial.dispose();
    },
  };
}
