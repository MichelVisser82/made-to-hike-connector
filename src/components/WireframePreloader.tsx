import { useEffect } from 'react';

export function WireframePreloader() {
  useEffect(() => {
    // Load wireframe decisions on app startup
    const loadWireframeDecisions = () => {
      try {
        const savedDecisions = localStorage.getItem('madetohike-wireframe-decisions');
        if (savedDecisions) {
          const decisions = JSON.parse(savedDecisions);
          
          // Apply branding decisions to CSS custom properties
          if (decisions.branding) {
            const root = document.documentElement;
            
            if (decisions.branding.primaryColor) {
              // Convert hex to HSL for CSS custom properties
              const hex = decisions.branding.primaryColor;
              const r = parseInt(hex.slice(1, 3), 16) / 255;
              const g = parseInt(hex.slice(3, 5), 16) / 255;
              const b = parseInt(hex.slice(5, 7), 16) / 255;
              
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              const diff = max - min;
              const sum = max + min;
              
              let h = 0;
              if (diff !== 0) {
                if (max === r) h = ((g - b) / diff) % 6;
                else if (max === g) h = (b - r) / diff + 2;
                else h = (r - g) / diff + 4;
              }
              h = Math.round(h * 60);
              if (h < 0) h += 360;
              
              const l = Math.round((sum / 2) * 100);
              const s = Math.round((diff === 0 ? 0 : diff / (1 - Math.abs(2 * (sum / 2) - 1))) * 100);
              
              root.style.setProperty('--primary', `${h} ${s}% ${l}%`);
            }
          }
          
          // Apply layout decisions
          if (decisions.layout) {
            document.body.classList.remove('header-fixed', 'header-static', 'header-transparent');
            document.body.classList.add(`header-${decisions.layout.headerStyle}`);
            
            document.body.classList.remove('spacing-compact', 'spacing-comfortable', 'spacing-spacious');
            document.body.classList.add(`spacing-${decisions.layout.spacing}`);
          }
          
          console.log('Wireframe decisions loaded and applied:', decisions);
        }
      } catch (error) {
        console.error('Failed to load wireframe decisions:', error);
      }
    };

    // Load on component mount
    loadWireframeDecisions();

    // Listen for storage changes to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'madetohike-wireframe-decisions') {
        loadWireframeDecisions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
}