export function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const colors = ['#7c3aed', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];
  const count = 40;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const x = Math.random() * 100;
    const duration = 6 + Math.random() * 10;
    const delay = Math.random() * 8;
    const size = 1 + Math.random() * 4;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      left: ${x}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;

    container.appendChild(particle);
  }
}

export function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, idx * 60);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal, .stat-item').forEach((el) => {
    observer.observe(el);
  });

  return observer;
}

export function initCardStaggerAnimation() {
  const cards = document.querySelectorAll('.game-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.07}s`;
  });
}

export function initCardTiltEffect() {
  const cards = document.querySelectorAll('.game-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `translateY(-8px) scale(1.01) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

export function initStatCountUp() {
  const stats = document.querySelectorAll('.stat-number[data-target]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();

        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach((stat) => observer.observe(stat));
}

export function initFilterTabs(onFilter) {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      if (onFilter) onFilter(tab.dataset.genre);
    });
  });
}

export function initLogoHoverEffect() {
  const logo = document.querySelector('.logo-title');
  if (!logo) return;

  logo.addEventListener('mouseover', () => {
    logo.style.letterSpacing = '0px';
    logo.style.transition = 'letter-spacing 0.4s ease';
  });

  logo.addEventListener('mouseout', () => {
    logo.style.letterSpacing = '-2px';
  });
}
