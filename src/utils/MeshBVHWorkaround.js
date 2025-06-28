// Empty workaround file - Three.js functionality disabled

// Export empty objects/classes to avoid import errors
export const MeshBVH = class {};
export const StaticGeometryGenerator = class {};

// Export a mock THREE object without importing the actual library
const mockTHREE = {
  // Add minimal mock properties needed by the app
  Vector3: class { constructor() {} },
  Matrix4: class { constructor() {} },
  Mesh: class { constructor() {} },
  // Add more mock classes as needed
};

export default mockTHREE;
