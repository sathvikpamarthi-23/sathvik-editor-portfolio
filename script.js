/* ============================================
   PORTFOLIO DATA & STATE MANAGEMENT
   ============================================ */

const DEFAULT_PROJECTS = [
    {
        id: 1,
        title: "Indus AI Showcase",
        description: "A cinematic AI showcase of the Indus Valley civilization with stunning visual effects and professional color grading.",
        category: "AI Showcase",
        tools: "Premiere Pro, After Effects",
        duration: "YouTube",
        thumbnail: "https://img.youtube.com/vi/sSPFZ2zGRws/hqdefault.jpg",
        video: "https://www.youtube.com/embed/sSPFZ2zGRws"
    },
    {
        id: 2,
        title: "Color Grading Showcase",
        description: "Professional color grading, mood enhancement, and color correction showcase in Premiere Pro and DaVinci Resolve.",
        category: "Post Production",
        tools: "Premiere Pro, DaVinci Resolve",
        duration: "YouTube",
        thumbnail: "https://img.youtube.com/vi/abOx_K9N6r0/hqdefault.jpg",
        video: "https://www.youtube.com/embed/abOx_K9N6r0"
    },
    {
        id: 3,
        title: "Sathvik's Reel",
        description: "A dynamic motion graphics reel showcasing professional video editing, kinetic typography, and visual storytelling.",
        category: "Portfolio Reel",
        tools: "After Effects, Premiere Pro",
        duration: "YouTube",
        thumbnail: "https://img.youtube.com/vi/GBx1BbfpSOo/hqdefault.jpg",
        video: "https://www.youtube.com/embed/GBx1BbfpSOo"
    },
    {
        id: 4,
        title: "Gemini AI Showcase",
        description: "A fast-paced promotional video showcasing cutting-edge AI technology with modern motion graphics.",
        category: "Promotional",
        tools: "After Effects, Premiere Pro",
        duration: "YouTube",
        thumbnail: "https://img.youtube.com/vi/1Zy6mo5QRZE/hqdefault.jpg",
        video: "https://www.youtube.com/embed/1Zy6mo5QRZE"
    }
];

let portfolioData = [];
let currentVideoIndex = 0;

/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    loadPortfolioData();
    initCustomCursor();
    initScrollProgress();
    initPortfolioGrid();
    initModal();
    initAdminPanel();
    initFormHandling();
    initScrollAnimations();
    initKeyboardShortcuts();
    initDockNavigation();
    initTestimonialsCarousel();
    removePreloader();
});

/* ============================================
   TESTIMONIALS CAROUSEL
   ============================================ */

function initTestimonialsCarousel() {
    const track = document.querySelector('.testimonials-track');
    if (!track) return;
    
    // Clone all cards and append them for seamless infinite scroll
    const cards = track.querySelectorAll('.testimonial-card');
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
}

/* ============================================
   PORTFOLIO DATA MANAGEMENT
   ============================================ */

function loadPortfolioData() {
    // Always refresh default 4 projects so user gets exact YouTube embeds
    portfolioData = [...DEFAULT_PROJECTS];
    savePortfolioData();
}

function savePortfolioData() {
    localStorage.setItem('portfolioProjects', JSON.stringify(portfolioData));
}

function addProject(project) {
    const newProject = {
        id: Date.now(),
        ...project
    };
    portfolioData.push(newProject);
    savePortfolioData();
    return newProject;
}

function deleteProject(id) {
    portfolioData = portfolioData.filter(p => p.id !== id);
    savePortfolioData();
}

/* ============================================
   PORTFOLIO GRID RENDERING
   ============================================ */

function initPortfolioGrid() {
    renderPortfolioCards();
    updateLoadMoreButton();
}

function renderPortfolioCards(showAll = true) {
    const grid = document.getElementById('portfolioGrid');
    const itemsToShow = portfolioData.length;
    
    // Clear existing cards
    grid.innerHTML = '';
    
    for (let i = 0; i < itemsToShow; i++) {
        const project = portfolioData[i];
        const card = createPortfolioCard(project, i);
        grid.appendChild(card);
    }
}

function getYouTubeId(url) {
    if (!url) return '';
    const match = url.match(/(?:embed\/|v=|vi\/|youtu\.be\/|\/v\/)([^#&?]*)/);
    return (match && match[1]) ? match[1] : '';
}

function createPortfolioCard(project, index) {
    const card = document.createElement('div');
    card.className = 'portfolio-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    let thumbUrl = project.thumbnail;
    if (!thumbUrl && project.video) {
        const ytId = getYouTubeId(project.video);
        if (ytId) {
            thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
    }

    const mediaContent = (project.video && project.video.endsWith('.mp4'))
        ? `<video class="portfolio-video-preview" src="${project.video}#t=0.5" preload="metadata" muted playsinline></video>`
        : `<img src="${thumbUrl || 'https://via.placeholder.com/500x300?text=' + encodeURIComponent(project.title)}" alt="${project.title}">`;

    card.innerHTML = `
        <div class="portfolio-thumbnail">
            ${mediaContent}
            <div class="portfolio-play-button" title="Play Video">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6,4 20,12 6,20"></polygon>
                </svg>
            </div>
        </div>
        <div class="portfolio-content">
            <div class="portfolio-category">${project.category}</div>
            <h3 class="portfolio-title">${project.title}</h3>
            <p class="portfolio-description">${project.description}</p>
            <div class="portfolio-meta">
                <span>${project.tools}</span>
                <span>${project.duration || 'YouTube'}</span>
            </div>
        </div>
    `;
    
    // Video preview play on hover (for mp4)
    const videoEl = card.querySelector('video');
    if (videoEl) {
        card.addEventListener('mouseenter', () => {
            videoEl.play().catch(() => {});
        });
        card.addEventListener('mouseleave', () => {
            videoEl.pause();
            videoEl.currentTime = 0.5;
        });
    }

    card.addEventListener('click', () => openVideoModal(project));
    return card;
}

function updateLoadMoreButton() {
    const btn = document.getElementById('loadMoreBtn');
    const grid = document.getElementById('portfolioGrid');
    const cardCount = grid.querySelectorAll('.portfolio-card').length;
    
    if (cardCount < portfolioData.length) {
        btn.style.display = 'block';
        btn.onclick = loadMoreProjects;
    } else {
        btn.style.display = 'none';
    }
}

function loadMoreProjects() {
    const grid = document.getElementById('portfolioGrid');
    const currentCards = grid.querySelectorAll('.portfolio-card').length;
    const nextBatch = Math.min(currentCards + 3, portfolioData.length);
    
    // Add new cards with staggered animation
    for (let i = currentCards; i < nextBatch; i++) {
        const project = portfolioData[i];
        const card = createPortfolioCard(project, i);
        grid.appendChild(card);
    }
    
    updateLoadMoreButton();
}

/* ============================================
   CUSTOM CURSOR
   ============================================ */

function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorTrail = document.querySelector('.cursor-trail');
    
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
        
        // Cursor trail
        if (Math.random() > 0.8) {
            const trail = cursorTrail.cloneNode(true);
            trail.style.left = mouseX + 'px';
            trail.style.top = mouseY + 'px';
            trail.style.opacity = '0.6';
            document.body.appendChild(trail);
            
            setTimeout(() => {
                trail.style.transition = 'opacity 0.5s ease-out';
                trail.style.opacity = '0';
                setTimeout(() => trail.remove(), 500);
            }, 0);
        }
    });
    
    // Cursor expand on buttons
    const buttons = document.querySelectorAll('.btn, .dock-item, .skill-tag, a');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => cursor.classList.add('active'));
        btn.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
    
    // Hide cursor on page leave
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

/* ============================================
   SCROLL PROGRESS BAR
   ============================================ */

function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    
    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / scrollHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

/* ============================================
   PRELOADER
   ============================================ */

function removePreloader() {
    const preloader = document.querySelector('.preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        preloader.style.pointerEvents = 'none';
    }, 2000);
}

/* ============================================
   MODAL VIDEO PLAYER
   ============================================ */

function initModal() {
    const modal = document.getElementById('videoModal');
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    });
}

function openVideoModal(project) {
    const modal = document.getElementById('videoModal');
    const container = document.getElementById('modalVideoContainer');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalCategory = document.getElementById('modalCategory');
    const modalTools = document.getElementById('modalTools');
    const modalDuration = document.getElementById('modalDuration');
    
    modalTitle.textContent = project.title;
    modalDescription.textContent = project.description;
    modalCategory.textContent = project.category;
    modalTools.textContent = project.tools;
    modalDuration.textContent = project.duration || 'YouTube';
    
    const isYouTube = project.video && (project.video.includes('youtube.com') || project.video.includes('youtu.be'));

    if (isYouTube) {
        let embedUrl = project.video;
        if (!embedUrl.includes('autoplay=')) {
            embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
        }
        container.innerHTML = `
            <iframe src="${embedUrl}" title="${project.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="video-player"></iframe>
        `;
    } else {
        container.innerHTML = `
            <video id="modalVideo" controls autoplay class="video-player">
                <source src="${project.video}" type="video/mp4">
            </video>
        `;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const container = document.getElementById('modalVideoContainer');
    
    modal.classList.remove('active');
    if (container) {
        container.innerHTML = '';
    }
    document.body.style.overflow = 'auto';
}

document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target.id === 'videoModal') {
        closeVideoModal();
    }
});

/* ============================================
   FORM HANDLING
   ============================================ */

function initFormHandling() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('contactSubmitBtn');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Message';
        if (submitBtn) {
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
        }

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Save locally as backup
        let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        messages.push({
            ...data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('contactMessages', JSON.stringify(messages));

        try {
            const response = await fetch('https://formsubmit.co/ajax/sathvikpamarthi23@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    _subject: `Portfolio Inquiry: ${data.subject || 'New Project'}`,
                    project_title: data.subject,
                    message: data.message,
                    _template: 'table'
                })
            });

            if (response.ok) {
                showToast('Message sent! I\'ll reply to your email shortly.', 'success');
                contactForm.reset();
            } else {
                throw new Error('FormSubmit endpoint error');
            }
        } catch (err) {
            // Fallback: Open mailto link if offline or request blocked
            const mailtoUrl = `mailto:sathvikpamarthi23@gmail.com?subject=${encodeURIComponent(data.subject || 'Project Inquiry')}&body=${encodeURIComponent(`Hi Sathvik,\n\nName: ${data.name}\nEmail: ${data.email}\n\n${data.message}`)}`;
            window.location.href = mailtoUrl;
            showToast('Opening email client to send message...', 'info');
            contactForm.reset();
        } finally {
            if (submitBtn) {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        }
    });
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `slideInUp 0.6s ease-out forwards`;
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.portfolio-card, .service-card, .skill-category, .testimonial-card').forEach(el => {
        observer.observe(el);
    });
}

/* ============================================
   KEYBOARD SHORTCUTS
   ============================================ */

let adminKeySequence = '';

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Admin panel shortcut: 1913
        adminKeySequence += e.key;
        
        if (adminKeySequence.includes('1913')) {
            toggleAdminPanel();
            adminKeySequence = '';
        }
        
        // Reset sequence if too long or invalid
        if (adminKeySequence.length > 4 || !/[0-9]/.test(e.key)) {
            adminKeySequence = e.key;
        }
    });
}

/* ============================================
   ADMIN PANEL
   ============================================ */

function initAdminPanel() {
    const adminForm = document.getElementById('adminForm');
    
    adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('adminTitle').value;
        const description = document.getElementById('adminDescription').value;
        const category = document.getElementById('adminCategory').value;
        const tools = document.getElementById('adminTools').value;
        const duration = document.getElementById('adminDuration').value;
        const thumbnail = document.getElementById('adminThumbnail').value;
        const video = document.getElementById('adminVideo').value;
        
        if (!title || !video) {
            showToast('Title and Video URL are required', 'error');
            return;
        }
        
        addProject({
            title,
            description,
            category,
            tools,
            duration,
            thumbnail: thumbnail || 'https://via.placeholder.com/500x300',
            video
        });
        
        showToast('Project added successfully!', 'success');
        adminForm.reset();
        updateAdminProjectsList();
        renderPortfolioCards();
        updateLoadMoreButton();
    });
    
    updateAdminProjectsList();
}

function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.toggle('active');
    showToast('Admin panel ' + (adminPanel.classList.contains('active') ? 'opened' : 'closed'), 'info');
}

function closeAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.remove('active');
}

function updateAdminProjectsList() {
    const list = document.getElementById('adminProjectsList');
    list.innerHTML = '';
    
    portfolioData.forEach(project => {
        const item = document.createElement('div');
        item.className = 'admin-project-item';
        item.innerHTML = `
            <span>${project.title}</span>
            <button type="button" onclick="deleteAndUpdateAdmin(${project.id})">Delete</button>
        `;
        list.appendChild(item);
    });
}

function deleteAndUpdateAdmin(id) {
    if (confirm('Delete this project?')) {
        deleteProject(id);
        updateAdminProjectsList();
        renderPortfolioCards();
        updateLoadMoreButton();
        showToast('Project deleted', 'success');
    }
}

/* ============================================
   DOCK NAVIGATION
   ============================================ */

function initDockNavigation() {
    const dockItems = document.querySelectorAll('.dock-item');
    
    // Smooth scroll to sections
    dockItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const href = item.getAttribute('href');
            const section = document.querySelector(href);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* ============================================
   TOAST NOTIFICATIONS
   ============================================ */

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    // Add type-based styling
    if (type === 'success') {
        toast.style.borderLeft = '4px solid #10b981';
    } else if (type === 'error') {
        toast.style.borderLeft = '4px solid #ef4444';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/* ============================================
   SMOOTH SCROLL BEHAVIOR
   ============================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* ============================================
   ADVANCED ANIMATIONS & EFFECTS
   ============================================ */

// Parallax effect on scroll
window.addEventListener('scroll', () => {
    const parallaxElements = document.querySelectorAll('.aurora-blob');
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach((el, index) => {
        const speed = 0.3 + index * 0.1;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Card tilt effect on hover
document.querySelectorAll('.portfolio-card, .service-card, .testimonial-card, .stat-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Mouse glow effect
document.addEventListener('mousemove', (e) => {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create subtle glow effect
        const distance = Math.sqrt(
            Math.pow(x - rect.width / 2, 2) + 
            Math.pow(y - rect.height / 2, 2)
        );
        
        const maxDistance = Math.sqrt(
            Math.pow(rect.width / 2, 2) + 
            Math.pow(rect.height / 2, 2)
        );
        
        const intensity = 1 - (distance / maxDistance);
        
        if (intensity > 0.1) {
            section.style.backgroundImage = `
                radial-gradient(
                    circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%,
                    rgba(0, 217, 255, ${intensity * 0.05}) 0%,
                    transparent 50%
                )
            `;
        }
    });
});

// Intersection Observer for lazy loading
const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                lazyLoadObserver.unobserve(img);
            }
        }
    });
}, { rootMargin: '50px' });

document.querySelectorAll('img[data-src]').forEach(img => {
    lazyLoadObserver.observe(img);
});

/* ============================================
   PERFORMANCE OPTIMIZATIONS
   ============================================ */

// Throttle scroll events for better performance
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            // Update scroll-dependent animations here
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// Enable GPU acceleration for animations
document.querySelectorAll('.aurora-blob, .portfolio-card, .service-card').forEach(el => {
    el.style.willChange = 'transform';
});

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// Smooth ease functions
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ============================================
   ACCESSIBILITY ENHANCEMENTS
   ============================================ */

// Focus management
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// Skip to main content link
const skipLink = document.createElement('a');
skipLink.href = '#portfolio';
skipLink.textContent = 'Skip to main content';
skipLink.style.cssText = `
    position: absolute;
    left: -9999px;
    z-index: 10001;
`;
document.body.appendChild(skipLink);

/* ============================================
   PAGE VISIBILITY API
   ============================================ */

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations and videos when tab is not visible
        const video = document.getElementById('modalVideo');
        if (video) video.pause();
    } else {
        // Resume when tab becomes visible
    }
});

/* ============================================
   PERFORMANCE MONITORING
   ============================================ */

if (window.performance && window.performance.mark) {
    window.performance.mark('page-start');
    
    window.addEventListener('load', () => {
        window.performance.mark('page-end');
        window.performance.measure('page-load', 'page-start', 'page-end');
    });
}

console.log('%c🎬 Welcome to Sathvik Pamarthi Portfolio', 'font-size: 20px; color: #00D9FF; font-weight: bold;');
console.log('%cPress 1-9-1-3 to unlock admin panel', 'font-size: 14px; color: #8B5CF6;');
