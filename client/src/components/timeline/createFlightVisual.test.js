import { Scene } from 'three';
import createFlightVisual from './createFlightVisual';

// Keep this lifecycle/performance test independent of WebGL and Three's ESM
// runtime. The actual shader is verified in the browser.
jest.mock('three', () => {
  class Group {
    constructor() { this.children = []; }
    add(...children) { this.children.push(...children); }
    remove(child) { this.children = this.children.filter((item) => item !== child); }
  }
  class Geometry {
    constructor() { this.attributes = {}; }
    setAttribute(name, attribute) { this.attributes[name] = attribute; }
    dispose() {}
  }
  class Material {
    constructor(options) { Object.assign(this, options); }
    dispose() {}
  }
  class Object3D {
    constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
      this.position = { x: 0, y: 0, z: 0, set(x, y, z) { Object.assign(this, { x, y, z }); } };
    }
  }
  return {
    Scene: Group, Group, BufferGeometry: Geometry, SphereGeometry: Geometry,
    Mesh: Object3D, Line: Object3D, ShaderMaterial: Material, MeshBasicMaterial: Material,
    Color: class Color {},
    Float32BufferAttribute: class Attribute {
      constructor(array) { this.array = new Float32Array(array); this.version = 0; }
    },
  };
});

test('flight updates reuse geometry and dispose resources after finishing', () => {
  const scene = new Scene();
  const globe = {
    scene: () => scene,
    getCoords: (lat, lon, altitude) => ({ x: lat, y: lon, z: 100 * (1 + altitude) }),
  };
  const visual = createFlightVisual(globe, { lat: 31, lon: 121 }, { lat: 40, lon: -74 }, 1.9);
  const [line, marker] = scene.children[0].children;
  const positions = line.geometry.attributes.position.array;
  const disposeGeometry = jest.spyOn(line.geometry, 'dispose');
  const disposeMaterial = jest.spyOn(line.material, 'dispose');
  visual.update(0);
  const initialPosition = marker.position.x;
  for (let step = 1; step <= 60; step += 1) visual.update(step / 60);
  expect(line.geometry.attributes.position.array).toBe(positions);
  expect(line.geometry.attributes.position.version).toBe(0);
  expect(line.material.uniforms.head.value).toBe(1);
  expect(marker.position.x).not.toBe(initialPosition);
  visual.fade(0.5);
  expect(line.material.uniforms.opacity.value).toBe(0.5);
  visual.dispose();
  visual.dispose();
  expect(scene.children).toHaveLength(0);
  expect(disposeGeometry).toHaveBeenCalledTimes(1);
  expect(disposeMaterial).toHaveBeenCalledTimes(1);
});
