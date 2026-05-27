// SVG definition for the custom pixel paw cursor
const pawSVG = `
<svg viewBox="0 0 100 100" width="100%" height="100%">
  <g>
    <!-- Pads -->
    <ellipse cx="25" cy="35" rx="12" ry="16" fill="#FF8EAA" transform="rotate(-25 25 35)" />
    <ellipse cx="42" cy="20" rx="12" ry="16" fill="#FF8EAA" transform="rotate(-10 42 20)" />
    <ellipse cx="58" cy="20" rx="12" ry="16" fill="#FF8EAA" transform="rotate(10 58 20)" />
    <ellipse cx="75" cy="35" rx="12" ry="16" fill="#FF8EAA" transform="rotate(25 75 35)" />
    <!-- Main pad -->
    <path d="M 50 85 C 15 85, 10 55, 25 45 C 35 35, 50 48, 50 48 C 50 48, 65 35, 75 45 C 90 55, 85 85, 50 85 Z" fill="#FF8EAA" />
    <path d="M 50 72 C 30 72, 28 58, 35 52 C 40 45, 50 52, 50 52 C 50 52, 60 45, 65 52 C 72 58, 70 72, 50 72 Z" fill="#FFD166" />
  </g>
</svg>
`;

// Initialize Custom Cursor
const cursor = document.createElement('div');
cursor.classList.add('custom-cursor');
cursor.innerHTML = pawSVG;
document.body.appendChild(cursor);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Smooth follow for the main cursor
function updateCursor() {
  const dx = mouseX - cursorX;
  const dy = mouseY - cursorY;
  cursorX += dx * 0.4;
  cursorY += dy * 0.4;
  cursor.style.left = cursorX + 'px';
  cursor.style.top = cursorY + 'px';
  requestAnimationFrame(updateCursor);
}
updateCursor();

// Click contract effect (like pressing down a paw)
document.addEventListener('mousedown', () => cursor.classList.add('active'));
document.addEventListener('mouseup', () => cursor.classList.remove('active'));

// Trail effect (huellitas que se desvanecen lentamente y son tenues)
let lastTrailTime = 0;
let step = false; // Toggle left/right tilt

document.addEventListener('mousemove', (e) => {
  const now = Date.now();
  // Drop a footprint every 180ms to make it look like a walking trail
  if (now - lastTrailTime > 180) { 
    createTrail(e.clientX, e.clientY);
    lastTrailTime = now;
  }
});

function createTrail(x, y) {
  const trail = document.createElement('div');
  trail.classList.add('cursor-trail');
  trail.innerHTML = pawSVG;
  
  // Alternate tilt and offset to simulate a walk
  step = !step;
  const tilt = step ? 20 : -20;
  const offset = step ? 12 : -12;
  
  trail.style.left = (x + offset) + 'px';
  trail.style.top = y + 'px';
  
  // Apply the transform here, the animation handles scale and opacity
  trail.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
  
  document.body.appendChild(trail);
  
  // Remove element after 4 seconds (matches the CSS animation duration)
  setTimeout(() => {
    trail.remove();
  }, 4000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Scroll Reveal Animations
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      // Uncomment the line below if you only want the animation to trigger once
      // observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(element => {
  observer.observe(element);
});

// Header shrink on scroll
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('shrunk');
  } else {
    header.classList.remove('shrunk');
  }
});

// Appointment Form Handle
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = bookingForm.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = '¡Cita Reservada! 🐾';
    btn.style.backgroundColor = 'var(--text-dark)';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = 'var(--primary)';
      bookingForm.reset();
    }, 3000);
  });
}
