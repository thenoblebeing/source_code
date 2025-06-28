import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import gsap from 'gsap';

const GlitchContainer = styled(motion.div)`
  position: relative;
  display: inline-block;
  font-family: 'Playfair Display', serif;
  text-align: center;
`;

const TextLayer = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  mix-blend-mode: difference;
  
  &.text-layer-1 {
    color: rgba(255, 0, 255, 0.8); /* Neon magenta */
    left: -2px;
  }
  
  &.text-layer-2 {
    color: rgba(0, 255, 255, 0.8); /* Neon cyan */
    left: 2px;
  }
`;

const MainText = styled.span`
  position: relative;
  z-index: 1;
  display: inline-block;
  color: var(--soft-gold);
  text-shadow: 0 0 10px rgba(212, 160, 23, 0.5);
`;

const GlitchText = ({ text, fontSize = '4rem', className = '', duration = 2.5 }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Store references to DOM elements to fix the exhaustive-deps warning
    const layer1 = layer1Ref.current;
    const layer2 = layer2Ref.current;
    const text = textRef.current;
    
    // Create glitch animation timeline
    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: duration
    });
    
    // Subtle constant movement
    gsap.to([layer1, layer2], {
      x: () => Math.random() * 4 - 2,
      y: () => Math.random() * 4 - 2,
      duration: 0.2,
      repeat: -1,
      yoyo: true,
      ease: "none"
    });
    
    // Glitch effect timeline
    tl.to(layer1, {
      x: -10,
      y: 2,
      opacity: 0.8,
      duration: 0.1,
      ease: "power1.inOut"
    }, 'glitch')
    .to(layer2, {
      x: 10,
      y: -2,
      opacity: 0.8, 
      duration: 0.1,
      ease: "power1.inOut"
    }, 'glitch')
    .to(text, {
      x: 2,
      y: -1,
      duration: 0.1,
      ease: "power1.inOut"
    }, 'glitch')
    .to([layer1, layer2, text], {
      x: 0,
      y: 0,
      opacity: 1,
      duration: 0.1,
      ease: "power1.inOut"
    })
    .to(layer1, {
      x: 15,
      y: -5,
      opacity: 0.8,
      duration: 0.08,
      delay: 0.2,
      ease: "power1.inOut"
    }, 'glitch2')
    .to(layer2, {
      x: -15,
      y: 5,
      opacity: 0.8,
      duration: 0.08,
      ease: "power1.inOut"
    }, 'glitch2')
    .to([layer1, layer2], {
      x: 0,
      y: 0,
      opacity: 1,
      duration: 0.08,
      ease: "power1.inOut"
    });
    
    return () => {
      tl.kill();
      gsap.killTweensOf([layer1, layer2, text]);
    };
  }, [duration]);

  return (
    <GlitchContainer 
      ref={containerRef}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{ fontSize }}
    >
      <TextLayer className="text-layer-1" ref={layer1Ref} aria-hidden="true">
        {text}
      </TextLayer>
      <MainText ref={textRef}>{text}</MainText>
      <TextLayer className="text-layer-2" ref={layer2Ref} aria-hidden="true">
        {text}
      </TextLayer>
    </GlitchContainer>
  );
};

export default GlitchText;
