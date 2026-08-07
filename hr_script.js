/* ============================================================
   hr_script.js — Salary & HR Negotiation Booking & Checkout
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init('75rE5tllrTxk1fNla');
    }

    // Booking state
    let bookingData = {
        date: null,
        time: null,
        name: '',
        email: '',
        notes: ''
    };

    // Dynamic Calendar Generation based on real current date
    const realNow = new Date();
    const realYear = realNow.getFullYear();
    const realMonth = realNow.getMonth(); // 0-11
    const realToday = realNow.getDate();
    
    let activeYear = realYear;
    let activeMonth = realMonth;

    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    // Select DOM elements
    const calendarGrid = document.getElementById('calendar-grid');
    const monthTitle = document.getElementById('month-title');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const slotsSection = document.getElementById('slots-section');
    const slotsGrid = document.getElementById('slots-grid');
    const actionBtn = document.getElementById('action-btn');
    const dateSection = document.getElementById('date-section');
    const formSection = document.getElementById('form-section');
    const modalOverlay = document.getElementById('booking-modal-overlay');
    const bookingSummary = document.getElementById('booking-summary');
    const bookingForm = document.getElementById('booking-form');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalDoneBtn = document.getElementById('modal-done-btn');

    // Modal close handlers
    function closeModal() {
        if (modalOverlay) modalOverlay.classList.remove('active');
    }
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Month Navigation Listeners
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            if (activeMonth === realMonth && activeYear === realYear) return;
            activeMonth--;
            if (activeMonth < 0) {
                activeMonth = 11;
                activeYear--;
            }
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            activeMonth++;
            if (activeMonth > 11) {
                activeMonth = 0;
                activeYear++;
            }
            renderCalendar();
        });
    }

    // Initialize Calendar
    renderCalendar();

    function renderCalendar() {
        if (!calendarGrid || !monthTitle) return;

        monthTitle.textContent = `${monthNames[activeMonth]} ${activeYear}`;

        if (prevMonthBtn) {
            if (activeMonth === realMonth && activeYear === realYear) {
                prevMonthBtn.style.opacity = '0.3';
                prevMonthBtn.style.cursor = 'not-allowed';
            } else {
                prevMonthBtn.style.opacity = '1';
                prevMonthBtn.style.cursor = 'pointer';
            }
        }

        calendarGrid.innerHTML = '';

        // Add Weekday Headers
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            const dayHead = document.createElement('div');
            dayHead.className = 'calendar-day-head';
            dayHead.textContent = day;
            calendarGrid.appendChild(dayHead);
        });

        const firstDayIndex = new Date(activeYear, activeMonth, 1).getDay();
        const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();

        // Empty slots for alignment
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }

        // Render Day Cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('button');
            dayCell.type = 'button';
            dayCell.className = 'calendar-day';
            dayCell.textContent = day;

            const isPast = (activeYear < realYear) || 
                           (activeYear === realYear && activeMonth < realMonth) || 
                           (activeYear === realYear && activeMonth === realMonth && day < realToday);

            if (isPast) {
                dayCell.classList.add('disabled');
            } else {
                if (bookingData.date === day) {
                    dayCell.classList.add('selected');
                }
                dayCell.addEventListener('click', () => selectDate(day, dayCell));
            }

            calendarGrid.appendChild(dayCell);
        }
    }

    function selectDate(day, element) {
        document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');

        bookingData.date = day;
        bookingData.time = null;

        renderSlots();

        if (slotsSection) {
            slotsSection.style.display = 'block';
            slotsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        updateActionButtonState();
    }

    function renderSlots() {
        if (!slotsGrid) return;
        slotsGrid.innerHTML = '';

        // Available slots array
        const slots = [
            '10:00 AM', '11:30 AM', '02:00 PM', 
            '04:30 PM', '06:00 PM', '08:00 PM'
        ];

        slots.forEach(slotTime => {
            const slotBtn = document.createElement('button');
            slotBtn.type = 'button';
            slotBtn.className = 'slot-btn';
            slotBtn.textContent = slotTime;

            if (bookingData.time === slotTime) {
                slotBtn.classList.add('selected');
            }

            slotBtn.addEventListener('click', () => selectTime(slotTime, slotBtn));
            slotsGrid.appendChild(slotBtn);
        });
    }

    function selectTime(time, element) {
        document.querySelectorAll('.slot-btn').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');

        bookingData.time = time;
        updateActionButtonState();
    }

    function updateActionButtonState() {
        if (!actionBtn) return;

        if (dateSection && dateSection.classList.contains('active')) {
            if (bookingData.date && bookingData.time) {
                actionBtn.removeAttribute('disabled');
                actionBtn.innerHTML = `Next: Enter Details <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>`;
            } else {
                actionBtn.setAttribute('disabled', 'true');
                actionBtn.innerHTML = `Select date and time <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>`;
            }
        } else if (formSection && formSection.classList.contains('active')) {
            actionBtn.removeAttribute('disabled');
            actionBtn.innerHTML = `Confirm & Book Session <i data-lucide="check-circle" style="width:16px;height:16px;"></i>`;
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            if (dateSection && dateSection.classList.contains('active')) {
                if (bookingData.date && bookingData.time) {
                    dateSection.classList.remove('active');
                    formSection.classList.add('active');

                    updateActionButtonState();
                    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else if (formSection && formSection.classList.contains('active')) {
                submitBooking();
            }
        });
    }

    function submitBooking() {
        const nameInput = document.getElementById('book-name');
        const emailInput = document.getElementById('book-email');
        const notesInput = document.getElementById('book-notes');

        if (!nameInput || !nameInput.value.trim()) {
            alert('Please enter your full name.');
            if (nameInput) nameInput.focus();
            return;
        }

        if (!emailInput || !emailInput.value.trim() || !emailInput.value.includes('@')) {
            alert('Please enter a valid email address.');
            if (emailInput) emailInput.focus();
            return;
        }

        bookingData.name = nameInput.value.trim();
        bookingData.email = emailInput.value.trim();
        bookingData.notes = notesInput ? notesInput.value.trim() : '';

        // Render Summary
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDate = new Date(activeYear, activeMonth, bookingData.date);
        const dayName = daysOfWeek[selectedDate.getDay()];
        const dateStr = `${dayName}, ${monthNames[activeMonth]} ${bookingData.date}, ${activeYear}`;
        const meetUrl = 'https://meet.google.com/orz-patd-meet';
        const dateNumStr = bookingData.date < 10 ? '0' + bookingData.date : '' + bookingData.date;
        const monthNumStr = (activeMonth + 1) < 10 ? '0' + (activeMonth + 1) : '' + (activeMonth + 1);
        const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Salary & HR Negotiation Strategy with Arzoo Patodia')}&dates=${activeYear}${monthNumStr}${dateNumStr}T100000Z/${activeYear}${monthNumStr}${dateNumStr}T103000Z&details=${encodeURIComponent('Google Meet Link: ' + meetUrl)}&location=${encodeURIComponent(meetUrl)}`;

        // Dispatch automated email notification to Host (patodiaarzoo8@gmail.com) and Visitor
        sendBookingEmail('Salary & HR Negotiation', bookingData, dateStr, bookingData.time, meetUrl);

        if (bookingSummary) {
            bookingSummary.innerHTML = `
                <div class="summary-item">
                    <i data-lucide="video" style="color:var(--clr-accent); width:18px; height:18px;"></i>
                    <div>
                        <div style="font-size:0.75rem; color:var(--clr-text-secondary); font-weight:600; text-transform:uppercase;">Service</div>
                        <div style="font-weight:700; color:var(--clr-text-primary);">Salary & HR Negotiation (30 Min)</div>
                    </div>
                </div>

                <div class="summary-item">
                    <i data-lucide="calendar" style="color:var(--clr-accent); width:18px; height:18px;"></i>
                    <div>
                        <div style="font-size:0.75rem; color:var(--clr-text-secondary); font-weight:600; text-transform:uppercase;">Date & Time</div>
                        <div style="font-weight:700; color:var(--clr-text-primary);">${dateStr} at ${bookingData.time} IST</div>
                    </div>
                </div>

                <div class="summary-item">
                    <i data-lucide="user" style="color:var(--clr-accent); width:18px; height:18px;"></i>
                    <div>
                        <div style="font-size:0.75rem; color:var(--clr-text-secondary); font-weight:600; text-transform:uppercase;">Booked For</div>
                        <div style="font-weight:700; color:var(--clr-text-primary);">${bookingData.name} (${bookingData.email})</div>
                    </div>
                </div>

                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1rem; margin-top:1rem;">
                    <div style="font-size:0.8rem; color:var(--clr-text-secondary); margin-bottom:0.4rem;">Google Meet Video Room:</div>
                    <a href="${meetUrl}" target="_blank" rel="noopener" class="action-btn" style="padding:0.6rem 1rem; font-size:0.88rem; text-decoration:none; justify-content:center;">
                        <i data-lucide="video" style="width:16px;height:16px;"></i> Join Meeting Room
                    </a>
                </div>

                <div style="margin-top:1rem; text-align:center;">
                    <a href="${gCalUrl}" target="_blank" rel="noopener" style="font-size:0.88rem; font-weight:700; color:#137333; text-decoration:underline; display:inline-flex; align-items:center; gap:4px;">
                        <i data-lucide="calendar-plus" style="width:16px;height:16px;"></i> Add Session to Google Calendar
                    </a>

                    <div style="font-size:0.82rem; color:#15803d; background:#ffffff; border:1px solid #bbf7d0; border-radius:8px; padding:0.5rem 0.75rem; margin-top:1rem; display:inline-flex; align-items:center; gap:6px;">
                        <i data-lucide="mail-check" style="width:16px;height:16px;"></i>
                        <span>Email notification sent to <strong>patodiaarzoo8@gmail.com</strong> & <strong>${bookingData.email}</strong></span>
                    </div>
                </div>
            `;
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Open the Booking Confirmation Modal
        if (modalOverlay) {
            modalOverlay.classList.add('active');
        }

        // Confetti explosion
        launchConfetti();
    }

    // Helper: Dispatch Email Notification to Host & Visitor
    function sendBookingEmail(serviceTitle, bookingData, dateStr, timeStr, meetUrl) {
        const hostEmail = 'patodiaarzoo8@gmail.com';

        if (typeof emailjs !== 'undefined') {
            emailjs.send('service_emailtriggering', 'template_lxznjud', {
                to_email: hostEmail,
                visitor_email: bookingData.email,
                visitor_name: bookingData.name,
                service_title: serviceTitle,
                booking_date: dateStr,
                booking_time: timeStr,
                notes: bookingData.notes || 'None',
                meet_url: meetUrl
            }).catch(err => console.log('EmailJS note:', err));
        }

        fetch('https://formspree.io/f/mqazkbye', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service: serviceTitle,
                name: bookingData.name,
                email: bookingData.email,
                date: dateStr,
                time: timeStr,
                notes: bookingData.notes || 'None',
                meet_url: meetUrl
            })
        }).catch(err => console.log('Formspree note:', err));
    }

    // Confetti Animation Effect
    function launchConfetti() {
        const count = 40;
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = '-10px';
            particle.style.width = (Math.random() * 8 + 6) + 'px';
            particle.style.height = (Math.random() * 10 + 6) + 'px';
            particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            particle.style.position = 'fixed';
            particle.style.zIndex = '9999';
            particle.style.pointerEvents = 'none';

            document.body.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 6 + 4;
            let posX = 0;
            let posY = 0;
            let velX = Math.cos(angle) * velocity;
            let velY = Math.sin(angle) * velocity - 5;
            let gravity = 0.35;
            let opacity = 1;

            const update = () => {
                velY += gravity;
                posX += velX;
                posY += velY;
                opacity -= 0.015;

                particle.style.transform = `translate(${posX}px, ${posY}px) rotate(${posX * 2}deg)`;
                particle.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(update);
                } else {
                    particle.remove();
                }
            };

            requestAnimationFrame(update);
        }
    }
});
