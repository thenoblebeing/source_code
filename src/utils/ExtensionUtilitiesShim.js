// This is a shim for three-mesh-bvh/src/utils/ExtensionUtilities.js
// It provides mock implementations without using BatchedMesh

// Mock implementation of functions that would normally use BatchedMesh
export const convertToArrayGeometry = (geometry) => {
  console.warn('Using mock convertToArrayGeometry - BatchedMesh compatibility fix');
  return geometry; // Just return the original geometry
};

export const copyBoneTransformations = (source, target) => {
  console.warn('Using mock copyBoneTransformations - BatchedMesh compatibility fix');
  // Do nothing - this is a stub
};

// Export any other functions that might be needed from the original file
export const getGroupMaterialIndicesAttribute = (geometry) => {
  return null; // Return a stub
};

export const getGroupCount = (geometry) => {
  return 1; // Return a default value
};

// Add other exported functions as needed
