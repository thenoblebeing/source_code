import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Import fonts */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  /* Global Styles for TheNobleBeing - Futuristic Theme */
  :root {
    /* Enhanced color palette */
    --terracotta: #F05E40; /* Brighter terracotta */
    --sage-green: #90C290; /* Brighter sage green */
    --soft-gold: #FFCC33; /* Brighter gold */
    --deep-charcoal: #121212; /* Darker charcoal for more contrast */
    --sandstone-beige: #E8D9C0; /* Slightly brighter beige */
    --neon-magenta: #FF00FF;
    --neon-cyan: #00FFFF;
    --bronze: #CD7F32; /* Brighter bronze */
    --white: #FFFFFF;
    
    /* New futuristic palette additions */
    --dark-bg: #0A0A0A; /* Very dark background */
    --dark-surface: #1A1A1A; /* Slightly lighter surface */
    --dark-card: #222222; /* Card background */
    --glass-bg: rgba(30, 30, 30, 0.8); /* Glass morphism background */
    --glass-border: rgba(255, 255, 255, 0.1); /* Glass border */
    --glass-highlight: rgba(255, 255, 255, 0.05); /* Glass highlight */
    --text-primary: rgba(255, 255, 255, 0.9); /* Primary text */
    --text-secondary: rgba(255, 255, 255, 0.6); /* Secondary text */
    --accent-gradient: linear-gradient(90deg, var(--neon-magenta), var(--neon-cyan)); /* Accent gradient */
    --earth-gradient: linear-gradient(90deg, var(--terracotta), var(--sage-green)); /* Earth gradient */
    --gold-glow: 0 0 15px rgba(255, 204, 51, 0.7); /* Gold glow effect */
    --neon-glow: 0 0 15px rgba(255, 0, 255, 0.7); /* Neon glow effect */
    
    /* Misc variables */
    --standard-border-radius: 12px;
    --card-border-radius: 16px;
    --button-border-radius: 50px;
    --standard-transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: var(--dark-bg);
    color: var(--text-primary);
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5 {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  a {
    color: var(--sage-green);
    text-decoration: none;
    transition: var(--standard-transition);
  }

  a:hover {
    color: var(--soft-gold);
    text-decoration: underline;
  }
`;

export default GlobalStyles;
