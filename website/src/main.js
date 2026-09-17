import './style.css';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

inject();
injectSpeedInsights();

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Default to light unless saved as dark or system is dark (and nothing saved)
  // Actually, let's default to dark if nothing saved, since WhatsApp Web usually defaults to dark or system.
  // We'll set the initial theme based on what's saved or what the system prefers.
  let currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  // Apply initial theme
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Toggle button click handler
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  });
});
