// ===== GLOBAL VARIABLES =====
let allRats = [];
let filteredRats = [];
let currentTheme = localStorage.getItem('theme') || 'light';

// ===== UTILITY FUNCTIONS =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const animateNumber = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
};

// ===== LOADING SCREEN =====
const hideLoadingScreen = () => {
    const loadingScreen = $('#loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 1500);
    }
};

// ===== THEME MANAGEMENT =====
const initTheme = () => {
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
        const themeIcon = $('.theme-icon');
        if (themeIcon) themeIcon.textContent = '☀️';
    }
};

const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        $('.theme-icon').textContent = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        $('.theme-icon').textContent = '🌙';
    }
};

// ===== STATUS CLASS =====
function statusClass(stav) {
    switch (stav.toLowerCase()) {
        case "volný": return "volny";
        case "rezervace": return "rezervace";
        case "adoptován":
        case "adoptovan":
            return "adoptovan";
        default: return "jiny";
    }
}

// ===== LOAD RATS =====
async function nactiPotkany() {
    try {
        const res = await fetch('data/potkani.json');
        if (!res.ok) throw new Error('Nepodařilo se načíst data potkanů');
        const potkani = await res.json();

        allRats = potkani;
        filteredRats = potkani;

        updateRatsDisplay(potkani);
        updateCounts(potkani);
        animateStats();
        hideLoadingScreen();
    } catch (error) {
        console.error('Chyba při načítání potkanů:', error);
        showToast('Nepodařilo se načíst data potkanů. Zkuste to prosím později.', 'error');
        hideLoadingScreen();
    }
}

// ===== UPDATE RATS DISPLAY =====
function updateRatsDisplay(potkani) {
    const listMimina = $('#mimina-list');
    const listDospeli = $('#dospeli-list');
    const listSeniori = $('#seniori-list');

    if (!listMimina || !listDospeli || !listSeniori) return;

    listMimina.innerHTML = '';
    listDospeli.innerHTML = '';
    listSeniori.innerHTML = '';

    potkani.forEach((potkan, index) => {
        const card = document.createElement('div');
        card.className = 'rat-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="rat-image-container">
                <img class="rat-image" src="${potkan.foto}" alt="${potkan.jmeno}" loading="lazy">
            </div>
            <div class="rat-info">
                <h3 class="rat-name">${potkan.jmeno}</h3>
                <span class="rat-status ${statusClass(potkan.stav)}">${potkan.stav}</span>
                <div class="rat-details">
                    <div class="rat-detail">
                        <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>${potkan.vek} ${potkan.jednotka}</span>
                    </div>
                    <div class="rat-detail">
                        ${potkan.pohlavi.toLowerCase().includes('samec')
                            ? `<svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="18.5" cy="5.5" r="3.5"/>
                                <line x1="22" y1="2" x2="15" y2="9"/>
                                <line x1="22" y1="2" x2="18" y2="6"/>
                                <line x1="22" y1="2" x2="22" y2="6"/>
                               </svg>`
                            : `<svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="8" r="7"/>
                                <polyline points="8.21,13.89 7,23 17,23 15.79,13.88"/>
                               </svg>`
                        }
                        <span>${potkan.pohlavi}</span>
                    </div>
                    <div class="rat-detail">
                        <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>${potkan.lokace}</span>
                    </div>
                </div>
                <p class="rat-description">${potkan.popis}</p>
                <div class="rat-actions">
                    <button class="btn btn-small btn-primary" onclick="otevriLightbox('${potkan.foto}', '${potkan.jmeno}', '${potkan.popis}')">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span>Zobrazit</span>
                    </button>
                </div>
            </div>
        `;

        // Event listener pro obrázek
        const img = card.querySelector('.rat-image');
        img.addEventListener('click', () => {
            otevriLightbox(potkan.foto, potkan.jmeno, potkan.popis);
        });

        // Error handling pro obrázky
        img.addEventListener('error', () => {
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA4NEM2OC44MzY2IDg0IDc2IDc2LjgzNjYgNzYgNjhDNzYgNTkuMTYzNCA2OC44MzY2IDUyIDYwIDUyQzUxLjE2MzQgNTIgNDQgNTkuMTYzNCA0NCA2OEM0NCA3Ni44MzY2IDUxLjE2MzQgODQgNjAgODRaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
            img.alt = 'Obrázek se nepodařilo načíst';
        });

        // Přidání do správné kategorie
        if (potkan.vek_kategorie === 'mimina') {
            listMimina.appendChild(card);
        } else if (potkan.vek_kategorie === 'dospeli') {
            listDospeli.appendChild(card);
        } else {
            listSeniori.appendChild(card);
        }
    });

    // Zobrazit zprávu pokud nejsou žádní potkani
    if (potkani.length === 0) {
        showEmptyState();
    }
}

// ===== EMPTY STATE =====
function showEmptyState() {
    const sections = ['mimina-list', 'dospeli-list', 'seniori-list'];
    sections.forEach(sectionId => {
        const section = $(`#${sectionId}`);
        if (section && section.children.length === 0) {
            section.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🐭</div>
                    <h3>Žádní potkani</h3>
                    <p>V této kategorii momentálně nejsou žádní potkani k adopci.</p>
                </div>
            `;
        }
    });
}

// ===== UPDATE COUNTS =====
function updateCounts(potkani) {
    const miminaCount = potkani.filter(p => p.vek_kategorie === 'mimina').length;
    const dospeliCount = potkani.filter(p => p.vek_kategorie === 'dospeli').length;
    const senioriCount = potkani.filter(p => p.vek_kategorie === 'seniori').length;

    const miminaCountEl = $('#mimina-count');
    const dospeliCountEl = $('#dospeli-count');
    const senioriCountEl = $('#seniori-count');

    if (miminaCountEl) miminaCountEl.textContent = `${miminaCount} ${miminaCount === 1 ? 'potkan' : 'potkanů'}`;
    if (dospeliCountEl) dospeliCountEl.textContent = `${dospeliCount} ${dospeliCount === 1 ? 'potkan' : 'potkanů'}`;
    if (senioriCountEl) senioriCountEl.textContent = `${senioriCount} ${senioriCount === 1 ? 'potkan' : 'potkanů'}`;
}

// ===== ANIMATE STATS =====
function animateStats() {
    const statNumbers = $$('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.dataset.count);
        if (target) {
            animateNumber(stat, target);
        }
    });
}

// ===== LIGHTBOX =====
function otevriLightbox(src, alt, popis = '') {
    const lb = $('#lightbox');
    const lbImg = $('#lightboxImg');
    const lbInfo = $('#lightboxInfo');
    
    if (!lb || !lbImg) return;

    lbImg.src = src;
    lbImg.alt = alt;
    
    if (lbInfo) {
        lbInfo.innerHTML = `
            <h3>${alt}</h3>
            <p>${popis}</p>
        `;
    }
    
    lb.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function zavriLightbox() {
    const lb = $('#lightbox');
    if (!lb) return;
    
    lb.classList.remove('show');
    document.body.style.overflow = '';
    
    setTimeout(() => {
        const lbImg = $('#lightboxImg');
        const lbInfo = $('#lightboxInfo');
        if (lbImg) lbImg.src = '';
        if (lbInfo) lbInfo.innerHTML = '';
    }, 300);
}

// ===== FILTERING =====
function filterRats() {
    const searchInput = $('#searchInput');
    const statusFilter = $('#statusFilter');
    const genderFilter = $('#genderFilter');

    if (!searchInput || !statusFilter || !genderFilter) return;

    const searchTerm = searchInput.value.toLowerCase().trim();
    const statusValue = statusFilter.value;
    const genderValue = genderFilter.value;

    filteredRats = allRats.filter(rat => {
        const matchesName = rat.jmeno.toLowerCase().includes(searchTerm) || 
                           rat.popis.toLowerCase().includes(searchTerm);
        const matchesStatus = statusValue ? statusClass(rat.stav) === statusValue : true;
        const matchesGender = genderValue ? rat.pohlavi.toLowerCase().includes(genderValue) : true;
        
        return matchesName && matchesStatus && matchesGender;
    });

    updateRatsDisplay(filteredRats);
    updateCounts(filteredRats);

    // Zobrazit počet výsledků
    const totalResults = filteredRats.length;
    showToast(`Nalezeno ${totalResults} ${totalResults === 1 ? 'potkan' : 'potkanů'}`, 'info');
}

// ===== CLEAR FILTERS =====
function clearFilters() {
    const searchInput = $('#searchInput');
    const statusFilter = $('#statusFilter');
    const genderFilter = $('#genderFilter');

    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (genderFilter) genderFilter.value = '';

    filteredRats = allRats;
    updateRatsDisplay(filteredRats);
    updateCounts(filteredRats);
    
    showToast('Filtry byly vymazány', 'info');
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info', duration = 5000) {
    const container = $('#toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-message">
                <div class="toast-text">${message}</div>
            </div>
            <button class="toast-close" aria-label="Zavřít upozornění">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove
    const autoRemove = setTimeout(() => {
        removeToast(toast);
    }, duration);

    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeToast(toast);
    });
}

function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    const navLinks = $('#navLinks');
    const mobileMenuBtn = $('#mobileMenuBtn');
    
    if (!navLinks || !mobileMenuBtn) return;

    navLinks.classList.toggle('show');
    mobileMenuBtn.classList.toggle('active');
}

// ===== SMOOTH SCROLLING =====
function smoothScrollTo(target) {
    const element = $(target);
    if (!element) return;

    const offsetTop = element.offsetTop - 80; // Account for fixed navbar
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
}

// ===== CONTACT FORM =====
function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Simulate form submission
    showToast('Zpráva byla odeslána! Brzy se vám ozveme.', 'success');
    form.reset();
}

// ===== MODAL FUNCTIONS =====
function showModal(type) {
    const modals = {
        'adoption-guide': {
            title: 'Průvodce adopcí',
            content: `
                <h3>Jak adoptovat potkana?</h3>
                <ol>
                    <li>Vyberte si potkana z naší nabídky</li>
                    <li>Kontaktujte nás přes email nebo Facebook</li>
                    <li>Domluvte si schůzku a seznámení</li>
                    <li>Připravte si vybavení pro potkana</li>
                    <li>Podepište adopční smlouvu</li>
                </ol>
            `
        },
        'care-guide': {
            title: 'Péče o potkany',
            content: `
                <h3>Základní péče</h3>
                <ul>
                    <li>Kvalitní krmivo a čerstvá voda</li>
                    <li>Prostorná klec s vybavením</li>
                    <li>Pravidelné veterinární kontroly</li>
                    <li>Denní venčení a hraní</li>
                    <li>Společnost dalších potkanů</li>
                </ul>
            `
        },
        'faq': {
            title: 'Často kladené otázky',
            content: `
                <h3>Nejčastější dotazy</h3>
                <p><strong>Q:</strong> Kolik stojí adopce?</p>
                <p><strong>A:</strong> Adopce je zdarma, požadujeme pouze příspěvek na veterinární péči.</p>
                
                <p><strong>Q:</strong> Můžu adoptovat jen jednoho potkana?</p>
                <p><strong>A:</strong> Potkani jsou společenští tvorové, doporučujeme adopci minimálně dvou.</p>
            `
        }
    };

    const modal = modals[type];
    if (!modal) return;

    showToast(modal.title, 'info');
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    // Load rats
    nactiPotkany();

    // Lightbox events
    const lightboxClose = $('#lightboxClose');
    const lightbox = $('#lightbox');
    
    if (lightboxClose) {
        lightboxClose.addEventListener('click', zavriLightbox);
    }
    
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) zavriLightbox();
        });
    }

    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            zavriLightbox();
        }
    });

    // Theme toggle
    const themeToggle = $('#darkModeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Mobile menu
    const mobileMenuBtn = $('#mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Search and filters
    const searchInput = $('#searchInput');
    const statusFilter = $('#statusFilter');
    const genderFilter = $('#genderFilter');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterRats, 300));
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterRats);
    }
    
    if (genderFilter) {
        genderFilter.addEventListener('change', filterRats);
    }

    // Back to top button
    const backToTopBtn = $('#backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', debounce(() => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }, 100));

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = $$('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            if (target.startsWith('#')) {
                smoothScrollTo(target);
                
                // Close mobile menu if open
                const navLinksContainer = $('#navLinks');
                const mobileMenuBtn = $('#mobileMenuBtn');
                if (navLinksContainer && navLinksContainer.classList.contains('show')) {
                    navLinksContainer.classList.remove('show');
                    mobileMenuBtn.classList.remove('active');
                }
            }
        });
    });

    // Contact form
    const contactForm = $('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = $$('.rat-card, .section-header, .hero-content');
    animatedElements.forEach(el => observer.observe(el));
});

// ===== GLOBAL FUNCTIONS =====
window.otevriLightbox = otevriLightbox;
window.zavriLightbox = zavriLightbox;
window.showModal = showModal;
window.clearFilters = clearFilters;
