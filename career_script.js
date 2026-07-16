/* ============================================================
   career_script.js — Interactive Booking & Checkout for Career Counselling
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Booking state
    let bookingData = {
        date: null,
        time: null,
        name: '',
        email: '',
        notes: ''
    };

    // Calendar generation variables
    const year = 2026;
    const month = 6; // July (0-indexed in JS Dates)
    const monthName = "July 2026";
    
    // Select DOM elements
    const calendarGrid = document.getElementById('calendar-grid');
    const monthTitle = document.getElementById('month-title');
    const slotsSection = document.getElementById('slots-section');
    const slotsGrid = document.getElementById('slots-grid');
    const actionBtn = document.getElementById('action-btn');
    const dateSection = document.getElementById('date-section');
    const formSection = document.getElementById('form-section');
    const successScreen = document.getElementById('success-screen');
    const bookingSummary = document.getElementById('booking-summary');
    const bookingForm = document.getElementById('booking-form');

    // Render calendar title
    monthTitle.textContent = monthName;

    // Generate Calendar Grid
    // Day of the week names starting from Monday
    const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    
    // Clear and build header
    calendarGrid.innerHTML = '';
    weekdays.forEach(day => {
        const header = document.createElement('div');
        header.className = 'weekday-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    // Get first day of July 2026
    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Get number of days in July
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill in blank cells for previous month padding
    for (let i = 0; i < adjustedFirstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell';
        calendarGrid.appendChild(emptyCell);
    }

    // Populate actual days of July 2026
    const today = 11; // Local time says July 11, 2026
    
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.textContent = day;

        // Calculate day of the week
        const curDate = new Date(year, month, day);
        const dayOfWeek = curDate.getDay(); // 0 = Sun, 6 = Sat

        // Available logic: 
        // 1. Must be weekday (not Sat/Sun, i.e., 1-5)
        // 2. Must be today or in the future (>= 11)
        const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6;
        const isFuture = day >= today;

        if (isWeekday && isFuture) {
            cell.classList.add('available');
            if (day === today) {
                cell.classList.add('today');
            }
            
            // Add click listener
            cell.addEventListener('click', () => {
                // Clear previous selection
                document.querySelectorAll('.day-cell.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                
                cell.classList.add('selected');
                selectDate(day);
            });
        }
        
        calendarGrid.appendChild(cell);
    }

    // Available Time Slots for 30 min counselling session (more frequent slots)
    const availableSlots = [
        "09:00 AM", "09:45 AM", "10:30 AM", "11:15 AM",
        "02:00 PM", "02:45 PM", "04:00 PM", "05:00 PM"
    ];

    // Handle Date Selection
    function selectDate(day) {
        bookingData.date = day;
        bookingData.time = null; // reset selected time
        
        actionBtn.disabled = true;
        actionBtn.innerHTML = 'Select a time slot <i data-lucide="arrow-right"></i>';
        lucide.createIcons();

        // Render slots
        slotsGrid.innerHTML = '';
        availableSlots.forEach(slot => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'slot-btn';
            btn.textContent = slot;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.slot-btn.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                btn.classList.add('selected');
                selectTime(slot);
            });

            slotsGrid.appendChild(btn);
        });

        // Show slots section
        slotsSection.classList.add('active');
        slotsSection.style.display = 'block';
        slotsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        const selectedDate = new Date(2026, 6, bookingData.date);
        const dayName = daysOfWeek[selectedDate.getDay()];
        const dateStr = `${dayName}, July ${bookingData.date}, 2026`;
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
                <i data-lucide="video"></i>
                <span><strong>Platform:</strong> Google Meet (Link sent to ${bookingData.email})</span>
            </div>
            <div class="summary-row">
                <i data-lucide="user"></i>
                <span><strong>Host:</strong> Arzoo Patodia</span>
            </div>
        `;
        lucide.createIcons();

        // Show success screen
        successScreen.classList.add('active');

        // Confetti explosion
        launchConfetti();
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
