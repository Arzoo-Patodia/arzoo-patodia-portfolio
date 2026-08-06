/* ============================================================
   project_script.js — Interactive Booking & Checkout for Project Guidance
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
        prevMonthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (activeYear > realYear || (activeYear === realYear && activeMonth > realMonth)) {
                activeMonth--;
                if (activeMonth < 0) {
                    activeMonth = 11;
                    activeYear--;
                }
                renderCalendar(activeYear, activeMonth);
            }
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            activeMonth++;
            if (activeMonth > 11) {
                activeMonth = 0;
                activeYear++;
            }
            renderCalendar(activeYear, activeMonth);
        });
    }

    function renderCalendar(year, month) {
        // Update Title
        monthTitle.textContent = `${monthNames[month]} ${year}`;

        // Disable Prev Month if viewing current month
        if (prevMonthBtn) {
            const isCurrentMonth = (year === realYear && month === realMonth);
            prevMonthBtn.disabled = isCurrentMonth;
            prevMonthBtn.style.opacity = isCurrentMonth ? '0.3' : '1';
            prevMonthBtn.style.cursor = isCurrentMonth ? 'not-allowed' : 'pointer';
        }

        // Clear and build header
        calendarGrid.innerHTML = '';
        const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
        weekdays.forEach(day => {
            const header = document.createElement('div');
            header.className = 'weekday-header';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        // Get first day of month (Monday = 0 ... Sunday = 6)
        const firstDayIndex = new Date(year, month, 1).getDay();
        const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

        // Get number of days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Previous month padding cells
        for (let i = 0; i < adjustedFirstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell';
            calendarGrid.appendChild(emptyCell);
        }

        // Days of current month
        let autoSelectedCell = null;
        let autoSelectedDay = null;

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'day-cell';
            cell.textContent = day;

            // Check if day is today or in the future
            let isFutureOrToday = false;
            if (year > realYear) {
                isFutureOrToday = true;
            } else if (year === realYear && month > realMonth) {
                isFutureOrToday = true;
            } else if (year === realYear && month === realMonth && day >= realToday) {
                isFutureOrToday = true;
            }

            if (isFutureOrToday) {
                cell.classList.add('available');
                
                if (year === realYear && month === realMonth && day === realToday) {
                    cell.classList.add('today');
                }

                if (bookingData.date === day && activeMonth === month && activeYear === year) {
                    cell.classList.add('selected');
                }
                
                cell.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('.day-cell.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    cell.classList.add('selected');
                    selectDate(day);
                });

                if (!autoSelectedCell && (year === realYear && month === realMonth ? day === realToday : day === 1)) {
                    autoSelectedCell = cell;
                    autoSelectedDay = day;
                }
            } else {
                cell.disabled = true;
            }
            
            calendarGrid.appendChild(cell);
        }

        // Auto-select initial day & slot on page load if none selected yet
        if (!bookingData.date && autoSelectedCell && autoSelectedDay) {
            autoSelectedCell.classList.add('selected');
            selectDate(autoSelectedDay);
        }
    }

    // Available Time Slots for 45 min project guidance
    const availableSlots = [
        "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM",
        "04:00 PM", "05:00 PM"
    ];

    // Initial render
    renderCalendar(activeYear, activeMonth);

    // Handle Date Selection
    function selectDate(day) {
        bookingData.date = day;
        bookingData.time = null;

        // Render slots
        slotsGrid.innerHTML = '';
        availableSlots.forEach((slot, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'slot-btn';
            btn.textContent = slot;
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.slot-btn.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                btn.classList.add('selected');
                selectTime(slot);
            });

            slotsGrid.appendChild(btn);

            // Pre-select first time slot automatically for instant smooth UX
            if (index === 0) {
                btn.classList.add('selected');
                selectTime(slot);
            }
        });

        // Show slots section
        slotsSection.classList.add('active');
        slotsSection.style.display = 'block';
    }

    // Handle Time Selection
    function selectTime(time) {
        bookingData.time = time;
        actionBtn.disabled = false;
        actionBtn.innerHTML = 'Book Session <i data-lucide="arrow-right"></i>';
        lucide.createIcons();
    }

    // Stepper Navigation
    let currentStep = 'calendar'; // calendar -> form -> success

    actionBtn.addEventListener('click', () => {
        if (currentStep === 'calendar') {
            // Transition to Form step
            currentStep = 'form';
            dateSection.classList.remove('active');
            formSection.classList.add('active');
            
            actionBtn.innerHTML = 'Confirm Booking <i data-lucide="check"></i>';
            actionBtn.disabled = true; // disable until form is validated
            lucide.createIcons();

            validateForm();
        } else if (currentStep === 'form') {
            submitBooking();
        }
    });

    // Validate form inputs
    const formInputs = document.querySelectorAll('.form-input[required]');
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            validateForm();
        });
    });

    function validateForm() {
        let isValid = true;
        formInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
            }
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value.trim())) {
                    isValid = false;
                }
            }
        });
        actionBtn.disabled = !isValid;
    }

    // Submit Booking
    function submitBooking() {
        const nameInput = document.getElementById('book-name');
        const emailInput = document.getElementById('book-email');
        const notesInput = document.getElementById('book-notes');

        bookingData.name = nameInput.value.trim();
        bookingData.email = emailInput.value.trim();
        bookingData.notes = notesInput.value.trim();

        // Perform transition to Success screen
        currentStep = 'success';
        
        formSection.classList.remove('active');
        actionBtn.style.display = 'none';

        // Render Summary
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDate = new Date(activeYear, activeMonth, bookingData.date);
        const dayName = daysOfWeek[selectedDate.getDay()];
        const dateStr = `${dayName}, ${monthNames[activeMonth]} ${bookingData.date}, ${activeYear}`;
        const meetUrl = 'https://meet.google.com/orz-patd-meet';
        const dateNumStr = bookingData.date < 10 ? '0' + bookingData.date : '' + bookingData.date;
        const monthNumStr = (activeMonth + 1) < 10 ? '0' + (activeMonth + 1) : '' + (activeMonth + 1);
        const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Project Guidance Session with Arzoo Patodia')}&dates=${activeYear}${monthNumStr}${dateNumStr}T100000Z/${activeYear}${monthNumStr}${dateNumStr}T104500Z&details=${encodeURIComponent('Google Meet Link: ' + meetUrl)}&location=${encodeURIComponent(meetUrl)}`;

        // Dispatch automated email notification to Host (patodiaarzoo8@gmail.com) and Visitor
        sendBookingEmail('Project Guidance', bookingData, dateStr, bookingData.time, meetUrl);

        bookingSummary.innerHTML = `
            <div class="summary-row">
                <i data-lucide="calendar"></i>
                <span><strong>Date:</strong> ${dateStr}</span>
            </div>
            <div class="summary-row">
                <i data-lucide="clock"></i>
                <span><strong>Time:</strong> ${bookingData.time} (India Standard Time)</span>
            </div>
            <div class="summary-row">
                <i data-lucide="user"></i>
                <span><strong>Host Email:</strong> Arzoo Patodia (patodiaarzoo8@gmail.com)</span>
            </div>
            
            <div class="meet-callout-card" style="margin-top:1.25rem; padding:1.25rem; background:#e6f4ea; border:1px solid #10b981; border-radius:12px; text-align:center;">
                <h4 style="font-size:1rem; font-weight:800; color:#137333; margin-bottom:0.4rem;">
                    <i data-lucide="video" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;"></i>
                    Your Google Meet Room Link:
                </h4>
                <p style="font-size:0.88rem; color:#1e3a29; margin-bottom:1rem;">
                    Click below to join the video call directly or add it to your Google Calendar:
                </p>

                <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap; margin-bottom:1rem;">
                    <a href="${meetUrl}" target="_blank" rel="noopener" class="cta-btn" style="background:#10b981; color:#ffffff; text-decoration:none; font-size:0.9rem; padding:0.65rem 1.25rem; display:inline-flex; align-items:center; gap:6px;">
                        <i data-lucide="video" style="width:16px;height:16px;"></i> Join Google Meet Now
                    </a>
                    <button type="button" onclick="navigator.clipboard.writeText('${meetUrl}'); alert('Google Meet link copied to clipboard!');" style="padding:0.65rem 1rem; background:#ffffff; border:1px solid #10b981; color:#137333; border-radius:8px; font-size:0.9rem; font-weight:700; cursor:pointer;">
                        Copy Link
                    </button>
                </div>

                <a href="${gCalUrl}" target="_blank" rel="noopener" style="font-size:0.88rem; font-weight:700; color:#137333; text-decoration:underline; display:inline-flex; align-items:center; gap:4px;">
                    <i data-lucide="calendar-plus" style="width:16px;height:16px;"></i> Add Session to Google Calendar
                </a>

                <div style="font-size:0.82rem; color:#15803d; background:#ffffff; border:1px solid #bbf7d0; border-radius:8px; padding:0.5rem 0.75rem; margin-top:1rem; display:inline-flex; align-items:center; gap:6px;">
                    <i data-lucide="mail-check" style="width:16px;height:16px;"></i>
                    <span>Email notification sent to <strong>patodiaarzoo8@gmail.com</strong> & <strong>${bookingData.email}</strong></span>
                </div>
            </div>
        `;
        lucide.createIcons();

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
        const emailSubject = `New Booking: ${serviceTitle} with ${bookingData.name}`;
        const emailBody = `Hi Arzoo,\n\nA new 1:1 session has been booked on your portfolio!\n\n📌 Purpose: ${serviceTitle}\n👤 Visitor Name: ${bookingData.name}\n✉️ Visitor Email: ${bookingData.email}\n📅 Date: ${dateStr}\n⏰ Time: ${timeStr} (IST)\n💬 Discussion Notes: ${bookingData.notes || 'None'}\n\n📹 Google Meet Room Link: ${meetUrl}\n\nBest regards,\nPortfolio Booking System`;

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
                _replyto: bookingData.email,
                to_email: hostEmail,
                subject: emailSubject,
                message: emailBody,
                service_title: serviceTitle,
                visitor_name: bookingData.name,
                visitor_email: bookingData.email,
                date: dateStr,
                time: timeStr,
                google_meet_link: meetUrl
            })
        }).catch(err => console.log('Notification dispatch note:', err));
    }

    function launchConfetti() {
        const container = document.body;
        const colors = ['#6c63ff', '#db2777', '#059669', '#3b82f6', '#fbbf24', '#0d9488'];
        const numParticles = 80;

        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = Math.random() * 8 + 6 + 'px';
            particle.style.height = Math.random() * 8 + 6 + 'px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = '50%';
            particle.style.top = '40%';
            particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            particle.style.zIndex = '9999';
            particle.style.pointerEvents = 'none';
            container.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 12 + 6;
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
