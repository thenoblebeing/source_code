// Theme configuration for the application
const theme = {
  colors: {
    primary: 'var(--terracotta)',
    primaryDark: 'var(--dark-terracotta)',
    secondary: 'var(--sage-green)',
    accent: 'var(--golden-sand)',
    
    background: 'var(--deep-charcoal)',
    backgroundAlt: 'var(--charcoal)',
    surface: 'var(--midnight-black)',
    
    text: 'var(--sandstone-beige)',
    textSecondary: 'var(--light-sand)',
    border: 'var(--dark-border)',
    
    error: '#e57373',
    success: '#81c784',
    warning: '#ffb74d',
    info: '#64b5f6',
    disabled: 'rgba(255, 255, 255, 0.3)'
  },
  
  fontSizes: {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem',
    xxlarge: '2rem'
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    pill: '50px',
    circle: '50%'
  },
  
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    large: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)',
    xl: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)'
  },
  
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease'
  },
  
  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '992px',
    lg: '1200px',
    xl: '1600px'
  }
};

export default theme;
