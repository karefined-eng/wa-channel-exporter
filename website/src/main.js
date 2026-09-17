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
    // Track mouse movement
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Intersection Observer for Scroll Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Run once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-up, .text-gradient-reveal').forEach(el => {
    observer.observe(el);
  });
});
