import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ═══════════════════════════════════════════════════════
//  EDUTWIN AI — DASHBOARD 3D EFFECT ENGINE
//  Effects active on dashboard pages only (not login)
//  1. Enhanced Hover & Tilt with gloss shine overlay
//  2. Scroll-Based Parallax (stat numbers float at diff speeds)
//  3. Scroll-Reveal Entrance (IntersectionObserver stagger)
//  4. Faux 3D depth classes auto-applied to stat/glass cards
// ═══════════════════════════════════════════════════════

if (typeof window !== 'undefined') {

  // ── Helper: is current page a dashboard? ──
  const isDashboard = () => !['/', '/login', '/register'].includes(window.location.pathname);

  // ─────────────────────────────────────────────────────
  // 1. ENHANCED HOVER TILT + GLOSS SHINE
  //    Applies to .glass-card, .glass-card-strong, .stat-card
  //    On dashboard pages only
  // ─────────────────────────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    if (!isDashboard()) return;

    const target = e.target as HTMLElement;
    const card = target.closest('.glass-card, .glass-card-strong, .stat-card') as HTMLElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width  / 2;
    const yc = rect.height / 2;

    // Rotation — max ±5 degrees (more dramatic than login's ±3)
    const rotateY =  ((x - xc) / xc) * 5;
    const rotateX = -((y - yc) / yc) * 5;

    // Dynamic gloss highlight that follows mouse
    const glowX = Math.round((x / rect.width)  * 100);
    const glowY = Math.round((y / rect.height) * 100);

    card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease, border-color 0.08s ease';
    card.style.transform  = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.01)`;
    card.style.boxShadow  = `
      0 24px 48px rgba(255, 0, 21, 0.10),
      0 0 20px rgba(255, 0, 21, 0.12),
      inset 0 1px 0 rgba(255,248,231,0.3)
    `;
    card.style.borderColor = `rgba(255, 0, 21, 0.4)`;
    // CSS variable for gloss spot (picked up by shine-card::before if present)
    card.style.setProperty('--glow-x', `${glowX}%`);
    card.style.setProperty('--glow-y', `${glowY}%`);
    card.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,248,231,0.12) 0%, transparent 60%), #ffffff`;
  });

  document.addEventListener('mouseleave', (e) => {
    const target = e.target as HTMLElement;
    const card = target.closest('.glass-card, .glass-card-strong, .stat-card') as HTMLElement;
    if (!card) return;
    card.style.transition   = 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, background 0.35s ease';
    card.style.transform    = '';
    card.style.boxShadow    = '';
    card.style.borderColor  = '';
    card.style.background   = '';
  }, true);


  // ─────────────────────────────────────────────────────
  // 2. SCROLL-BASED PARALLAX
  //    Elements with .parallax-slow, .parallax-mid, .parallax-fast
  //    move at different speeds relative to scroll
  // ─────────────────────────────────────────────────────
  const parallaxRates: Record<string, number> = {
    'parallax-slow': 0.04,
    'parallax-mid':  0.08,
    'parallax-fast': 0.14,
  };

  let ticking = false;
  const handleParallax = () => {
    if (!isDashboard()) return;
    const scrollY = window.scrollY;
    Object.entries(parallaxRates).forEach(([cls, rate]) => {
      document.querySelectorAll<HTMLElement>(`.${cls}`).forEach((el, i) => {
        // Alternate direction for alternating elements
        const dir = i % 2 === 0 ? 1 : -1;
        el.style.transform = `translateY(${scrollY * rate * dir}px)`;
      });
    });
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { handleParallax(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });


  // ─────────────────────────────────────────────────────
  // 3. SCROLL-REVEAL ENTRANCE
  //    Watches any element with .scroll-hidden
  //    and adds .scroll-visible when it enters viewport
  //    with staggered delay for children in a group
  // ─────────────────────────────────────────────────────
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-visible');
          revealObserver.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  // Auto-register glass-cards as scroll-reveal targets on dashboard pages
  const registerScrollCards = () => {
    if (!isDashboard()) return;
    const cards = document.querySelectorAll<HTMLElement>(
      '.glass-card, .glass-card-strong, .stat-card'
    );
    cards.forEach((card, i) => {
      if (!card.classList.contains('scroll-hidden')) {
        card.classList.add('scroll-hidden');
        // Stagger delay based on index (cap at delay-6)
        const d = Math.min(i % 6 + 1, 6);
        card.classList.add(`delay-${d}`);
      }
      revealObserver.observe(card);
    });
  };

  // ─────────────────────────────────────────────────────
  // 4. AUTO-APPLY FAUX-3D + SHINE to stat-cards on dashboard
  // ─────────────────────────────────────────────────────
  const applyFaux3D = () => {
    if (!isDashboard()) return;
    document.querySelectorAll<HTMLElement>('.stat-card').forEach((card) => {
      card.classList.add('faux-3d', 'shine-card');
    });
  };

  // ─────────────────────────────────────────────────────
  // 5. RE-RUN ON ROUTE CHANGE (React SPA navigation)
  //    Uses MutationObserver to detect DOM updates
  // ─────────────────────────────────────────────────────
  let lastPath = window.location.pathname;

  const mutObs = new MutationObserver(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      // Small debounce so React has time to render the new page
      setTimeout(() => {
        applyFaux3D();
        registerScrollCards();
      }, 120);
    }
  });

  mutObs.observe(document.body, { childList: true, subtree: true });

  // Run once on initial load
  window.addEventListener('load', () => {
    applyFaux3D();
    registerScrollCards();
  });

  // Also run after a short delay to catch React's first render
  setTimeout(() => {
    applyFaux3D();
    registerScrollCards();
  }, 300);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
