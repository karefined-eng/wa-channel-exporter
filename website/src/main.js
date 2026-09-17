import './style.css';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

inject();
injectSpeedInsights();

document.addEventListener('DOMContentLoaded', () => {
  // Always set dark theme for the new premium UI
  document.documentElement.setAttribute('data-theme', 'dark');
  
  // Spotlight effect for glass cards
  const cards = document.querySelectorAll('.glass-card');
  
  cards.forEach(card => {
    // Add the spotlight element inside the card
    const spotlight = document.createElement('div');
    spotlight.classList.add('spotlight');
    card.appendChild(spotlight);
    
    // Track mouse movement
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});
