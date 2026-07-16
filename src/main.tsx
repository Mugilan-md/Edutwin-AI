import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ─── Global 3D Interactive Card Tilt Effect ───
if (typeof window !== 'undefined') {
  // We use event delegation on document so it automatically works on dynamically rendered React cards
  document.addEventListener('mousemove', (e) => {
    const target = e.target as HTMLElement;
    const card = target.closest('.glass-card, .glass-card-strong, .stat-card') as HTMLElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse x position relative to card
    const y = e.clientY - rect.top;  // Mouse y position relative to card

    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    // Rotation values: max 3 degrees
    const rotateY = ((x - xc) / xc) * 3;
    const rotateX = -((y - yc) / yc) * 3;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    card.style.boxShadow = `0 20px 40px rgba(31, 58, 95, 0.08), 0 0 15px rgba(31, 58, 95, 0.12)`;
    card.style.borderColor = `rgba(31, 58, 95, 0.35)`;
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target as HTMLElement;
    const card = target.closest('.glass-card, .glass-card-strong, .stat-card') as HTMLElement;
    if (!card) return;

    // Reset styles smoothly back to default
    card.style.transform = '';
    card.style.boxShadow = '';
    card.style.borderColor = '';
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
