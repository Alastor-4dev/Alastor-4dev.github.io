const pawSVG = `<svg viewBox="0 0 100 100" width="100%" height="100%">
  <g filter="drop-shadow(2px 2px 0px rgba(0,0,0,0.2))">
    <ellipse cx="25" cy="35" rx="10" ry="14" fill="var(--secondary)" transform="rotate(-25 25 35)" />
    <ellipse cx="42" cy="20" rx="10" ry="14" fill="var(--secondary)" transform="rotate(-10 42 20)" />
    <ellipse cx="58" cy="20" rx="10" ry="14" fill="var(--secondary)" transform="rotate(10 58 20)" />
    <ellipse cx="75" cy="35" rx="10" ry="14" fill="var(--secondary)" transform="rotate(25 75 35)" />
    <path d="M 50 85 C 15 85, 10 55, 25 45 C 35 35, 50 48, 50 48 C 50 48, 65 35, 75 45 C 90 55, 85 85, 50 85 Z" fill="var(--secondary)" />
    <path d="M 50 72 C 30 72, 28 58, 35 52 C 40 45, 50 52, 50 52 C 50 52, 60 45, 65 52 C 72 58, 70 72, 50 72 Z" fill="#FFD166" />
  </g>
</svg>`;

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

// Smooth follow
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

// Click contract effect (agarrar algo)
document.addEventListener('mousedown', () => {
  cursor.classList.add('active');
});
document.addEventListener('mouseup', () => {
  cursor.classList.remove('active');
});

// Trail effect (estela de huellitas)
let lastTrailTime = 0;
let step = 0; // Para alternar la inclinación de la huella

document.addEventListener('mousemove', (e) => {
  const now = Date.now();
  // Solo crear huella si se ha movido lo suficiente (tiempo o distancia)
  if (now - lastTrailTime > 60) { 
    createTrail(e.clientX, e.clientY);
    lastTrailTime = now;
  }
});

function createTrail(x, y) {
  const trail = document.createElement('div');
  trail.classList.add('cursor-trail');
  trail.innerHTML = pawSVG;
  
  // Alternar inclinación y posición para simular pisadas (izquierda/derecha)
  step = !step;
  const tilt = step ? 15 : -15;
  const offset = step ? 15 : -15;
  
  trail.style.left = (x + offset) + 'px';
  trail.style.top = y + 'px';
  trail.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
  
  document.body.appendChild(trail);
  
  setTimeout(() => {
    trail.remove();
  }, 600);
}


// --- Existing Logic ---

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

// Appointment Form Handling
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const petName = bookingForm.querySelector('input[placeholder="Nombre de tu Mascota"]').value;
    const card = bookingForm.closest('.appointment-card');
    
    card.style.opacity = '0';
    setTimeout(() => {
      card.innerHTML = `
        <div class="success-message">
          <div class="icon" style="font-size: 4rem; margin-bottom: 1rem;">✨🐾✨</div>
          <h2 style="font-family: var(--font-pixel); color: var(--primary);">¡Guau! ¡Excelente!</h2>
          <p style="font-size: 1.2rem;">Hemos recibido la solicitud para <strong>${petName}</strong>. Nos pondremos en contacto contigo muy pronto para confirmar tu cita.</p>
          <button class="btn-primary" onclick="location.reload()" style="margin-top: 1rem;">Agendar otra mascota</button>
        </div>
      `;
      card.style.opacity = '1';
    }, 300);
  });
}

// Scroll Reveal Animation
const observerOptions = {
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal');
    }
  });
}, observerOptions);

document.querySelectorAll('.service-card, .appointment-card, .section-title').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  observer.observe(el);
});

// Add a class for revealing
const style = document.createElement('style');
style.textContent = `
  .reveal {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

console.log('Patitas Felices JS Loaded! 🐾');
