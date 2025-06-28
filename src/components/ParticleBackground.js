import React from 'react';

// Simplified ParticleBackground that doesn't use Three.js
const ParticleBackground = () => {
  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'linear-gradient(135deg, #8a9a5b30 0%, #e2725b30 50%, #d4a01740 100%)',
        opacity: 0.7
      }}
    />
  );
};

export default ParticleBackground;
