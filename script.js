/* ============================================================
   script.js — Micro-interactions & scroll-reveal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Lucide icons (SVG replacement for <i data-lucide="…">)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Scroll-reveal: observe elements with class .reveal
    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger the animation slightly for each card
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 80);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers — show everything immediately
        revealElements.forEach(el => el.classList.add('visible'));
    }

    // 3. Animate stat numbers (count-up effect)
    const statNumbers = document.querySelectorAll('.stat__number');
    statNumbers.forEach(el => {
        const text = el.textContent.trim();
        const match = text.match(/^(\d+)(.*)$/);

        if (match) {
            const target = parseInt(match[1], 10);
            const suffix = match[2]; // e.g., "+"
            const duration = 1200; // ms
            const startTime = performance.now();

            el.textContent = '0' + suffix;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);

                el.textContent = current + suffix;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }
    });

    // 4. Service cards — add staggered reveal
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ${i * 0.08}s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s ${i * 0.08}s cubic-bezier(0.4, 0, 0.2, 1)`;
    });

    // Observe the services section
    const servicesSection = document.getElementById('services-section');
    if (servicesSection && 'IntersectionObserver' in window) {
        const servicesObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    serviceCards.forEach(card => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                    servicesObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        servicesObserver.observe(servicesSection);
    } else {
        serviceCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }

    // 5. Skill tags — subtle stagger on appear
    const skillTags = document.querySelectorAll('.skills__tag');
    skillTags.forEach((tag, i) => {
        tag.style.opacity = '0';
        tag.style.transform = 'scale(0.85)';
        tag.style.transition = `opacity 0.4s ${i * 0.04}s ease, transform 0.4s ${i * 0.04}s ease`;
    });

    const skillsSection = document.getElementById('skills-section');
    if (skillsSection && 'IntersectionObserver' in window) {
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillTags.forEach(tag => {
                        tag.style.opacity = '1';
                        tag.style.transform = 'scale(1)';
                    });
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        skillsObserver.observe(skillsSection);
    } else {
        skillTags.forEach(tag => {
            tag.style.opacity = '1';
            tag.style.transform = 'scale(1)';
        });
    }

});
