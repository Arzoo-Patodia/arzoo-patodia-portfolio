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

    // ── WALL OF LOVE INTERACTIVE REVIEW SUBMISSION ─────────────────────────────
    const openReviewModalBtn = document.getElementById('open-review-modal-btn');
    const reviewModalOverlay = document.getElementById('review-modal-overlay');
    const reviewModalCloseBtn = document.getElementById('review-modal-close-btn');
    const reviewForm = document.getElementById('review-submission-form');
    const menteeReviewsGrid = document.getElementById('mentee-reviews-grid');

    if (typeof emailjs !== 'undefined') {
        emailjs.init('75rE5tllrTxk1fNla');
    }

    // Load saved custom reviews from localStorage
    loadCustomReviews();

    if (openReviewModalBtn && reviewModalOverlay) {
        openReviewModalBtn.addEventListener('click', () => {
            reviewModalOverlay.classList.add('active');
        });
    }

    function closeReviewModal() {
        if (reviewModalOverlay) reviewModalOverlay.classList.remove('active');
    }

    if (reviewModalCloseBtn) reviewModalCloseBtn.addEventListener('click', closeReviewModal);
    if (reviewModalOverlay) {
        reviewModalOverlay.addEventListener('click', (e) => {
            if (e.target === reviewModalOverlay) closeReviewModal();
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('rev-name').value.trim();
            const role = document.getElementById('rev-role').value.trim();
            const rating = document.getElementById('rev-rating').value;
            const message = document.getElementById('rev-message').value.trim();

            if (!name || !role || !message) {
                alert('Please fill in all required fields!');
                return;
            }

            const stars = '★'.repeat(parseInt(rating, 10));
            const initial = name.charAt(0).toUpperCase();

            const newReview = {
                name,
                role,
                stars,
                message,
                date: new Date().toLocaleDateString()
            };

            // 1. Send Email Notification to Host
            if (typeof emailjs !== 'undefined') {
                emailjs.send('service_emailtriggering', 'template_lxznjud', {
                    to_email: 'patodiaarzoo8@gmail.com',
                    visitor_name: name,
                    service_title: `New Wall of Love Review (${stars})`,
                    notes: `Role: ${role}\nMessage: ${message}`
                }).catch(err => console.log('EmailJS review note:', err));
            }

            // 2. Save locally & render on page
            saveAndRenderReview(newReview);

            // Reset & Close
            reviewForm.reset();
            closeReviewModal();

            alert('🎉 Thank you for your review! It has been posted to the Wall of Love.');
        });
    }

    function saveAndRenderReview(review) {
        let reviews = JSON.parse(localStorage.getItem('arzoo_custom_reviews') || '[]');
        reviews.unshift(review);
        localStorage.setItem('arzoo_custom_reviews', JSON.stringify(reviews));

        renderReviewCard(review, true);
    }

    function loadCustomReviews() {
        let reviews = JSON.parse(localStorage.getItem('arzoo_custom_reviews') || '[]');
        reviews.forEach(rev => renderReviewCard(rev, false));
    }

    function renderReviewCard(review, isNew) {
        if (!menteeReviewsGrid) return;

        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.style.cssText = 'background:var(--clr-bg-card); border:1px solid var(--clr-border); border-radius:16px; padding:1.25rem; box-shadow:var(--shadow-md); display:flex; flex-direction:column; justify-content:space-between; animation: fadeIn 0.4s ease;';

        const initial = review.name.charAt(0).toUpperCase();

        card.innerHTML = `
            <div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.6rem;">
                    <div style="color:#fbbf24; font-size:0.9rem;">${review.stars}</div>
                    <span style="font-size:0.7rem; font-weight:700; color:#10b981; background:rgba(16,185,129,0.12); padding:0.2rem 0.5rem; border-radius:999px; border:1px solid rgba(16,185,129,0.3); display:inline-flex; align-items:center; gap:3px;">
                        <i data-lucide="sparkles" style="width:12px;height:12px;"></i> ${isNew ? 'Just Added' : 'Verified Mentee'}
                    </span>
                </div>
                <p style="font-size:0.88rem; color:var(--clr-text-primary); line-height:1.5; font-style:italic;">
                    "${escapeHtml(review.message)}"
                </p>
            </div>
            <div style="margin-top:1.2rem; display:flex; align-items:center; gap:10px; border-top:1px solid var(--clr-border); padding-top:0.8rem;">
                <div style="width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#10b981); color:#fff; font-weight:800; display:flex; align-items:center; justify-content:center; font-size:0.85rem; box-shadow:0 2px 8px rgba(99,102,241,0.3);">${initial}</div>
                <div>
                    <div style="font-size:0.85rem; font-weight:700; color:var(--clr-text-primary);">${escapeHtml(review.name)}</div>
                    <div style="font-size:0.75rem; color:var(--clr-text-secondary);">${escapeHtml(review.role)}</div>
                </div>
            </div>
        `;

        if (isNew) {
            menteeReviewsGrid.prepend(card);
        } else {
            menteeReviewsGrid.appendChild(card);
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
});
