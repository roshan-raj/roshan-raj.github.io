// Loader
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1000);
});

// Custom Cursor (desktop only)
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');

if (window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        setTimeout(() => {
            cursorFollower.style.left = e.clientX - 10 + 'px';
            cursorFollower.style.top = e.clientY - 10 + 'px';
        }, 100);
    });

    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
        cursorFollower.style.transform = 'scale(0.8)';
    });

    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
        cursorFollower.style.transform = 'scale(1)';
    });

    // Hover effect on links
    const links = document.querySelectorAll('a, button');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursorFollower.style.transform = 'scale(1.5)';
        });
        link.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursorFollower.style.transform = 'scale(1)';
        });
    });
}

// Particle Effect
const particlesContainer = document.getElementById('particles');
const particleCount = 50;

for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = 15 + Math.random() * 10 + 's';
    particlesContainer.appendChild(particle);
}

// Smooth scrolling for navigation links
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

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');

    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.transform = `translateY(${scrolled * -0.2}px)`;
    }
});

// Add dynamic year to footer
document.querySelector('footer p').innerHTML = `&copy; ${new Date().getFullYear()} Roshan Raj. Built with passion and code.`;

// Project card tilt effect
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Typing effect for hero title
const heroTitle = document.querySelector('.hero h1');
const titleText = heroTitle.textContent;
heroTitle.textContent = '';
let titleIndex = 0;

function typeTitle() {
    if (titleIndex < titleText.length) {
        heroTitle.textContent += titleText.charAt(titleIndex);
        titleIndex++;
        setTimeout(typeTitle, 100);
    }
}

setTimeout(typeTitle, 1500);

// Skill tags random movement
const skillTags = document.querySelectorAll('.skill-tag');
skillTags.forEach((tag, index) => {
    tag.addEventListener('mouseenter', () => {
        const randomX = (Math.random() - 0.5) * 10;
        const randomY = (Math.random() - 0.5) * 10;
        tag.style.transform = `translate(${randomX}px, ${randomY}px) scale(1.1)`;
    });
});

// Smooth reveal animations for sections
const revealElements = document.querySelectorAll('.section-title, .about-text p, .project-card, .contact-link');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    revealObserver.observe(el);
});

// Load and display projects
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">
                ${project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
            </div>
            <div class="project-links">
                <a href="${project.githubUrl}" target="_blank" class="project-link">
                    View Code
                </a>
            </div>
        </div>
    `;
    return card;
}

function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    const data = [
        {
            "title": "Alumni Connect",
            "description": "A comprehensive web application enabling seamless communication between current students and alumni. Built with modern web technologies to foster university community connections.",
            "technologies": ["TypeScript", "MEAN Stack", "MongoDB", "Angular"],
            "githubUrl": "https://github.com/roshan-raj/Alumni-Connect"
        },
        {
            "title": "Blockchain Visualization",
            "description": "Computer Graphics project demonstrating the working of blockchain technology with visual proof-of-work implementation. Educational tool for understanding blockchain concepts.",
            "technologies": ["C++", "Computer Graphics", "Blockchain"],
            "githubUrl": "https://github.com/roshan-raj/Computer-Graphic-Project-on-working-of-Blockchain"
        },
        {
            "title": "Shop Management System",
            "description": "E-commerce platform where shopkeepers can list products and customers can purchase with home delivery or in-store pickup options. Complete retail solution.",
            "technologies": ["Full Stack", "E-commerce", "Database"],
            "githubUrl": "https://github.com/roshan-raj/Shop-Management-System"
        },
        {
            "title": "Weather Application",
            "description": "Real-time weather application using OpenWeatherMap API. Displays temperature, country information, and location details with a clean, intuitive interface.",
            "technologies": ["JavaScript", "API Integration", "OpenWeatherMap"],
            "githubUrl": "https://github.com/roshan-raj"
        },
        {
            "title": "Car Rental Management",
            "description": "Online car rental management system with comprehensive booking, inventory management, and customer tracking features. Built for efficiency and scalability.",
            "technologies": ["PHP", "MySQL", "Web Application"],
            "githubUrl": "https://github.com/roshan-raj"
        },
        {
            "title": "NodeJS Blockchain",
            "description": "Simple yet comprehensive implementation showcasing blockchain creation and proof-of-work algorithm. Perfect for understanding blockchain fundamentals.",
            "technologies": ["JavaScript", "Node.js", "Blockchain"],
            "githubUrl": "https://github.com/roshan-raj/NodeJS-BlockChain"
        }
    ];
    projectsGrid.innerHTML = ''; // Clear any existing content
    data.forEach((project, index) => {
        const card = createProjectCard(project);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        projectsGrid.appendChild(card);

        // Stagger the animations
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Initialize projects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // loadProjects();

    // Retry loading if initial load fails
    window.addEventListener('online', () => {
        if (document.getElementById('projectsGrid').querySelector('.error-message')) {
            loadProjects();
        }
    });
});

// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = themeToggle.querySelector('.sun-icon');
const moonIcon = themeToggle.querySelector('.moon-icon');

// Check for saved theme preference, otherwise use system preference
const getThemePreference = () => {
    if (localStorage.getItem('theme')) {
        return localStorage.getItem('theme');
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Set theme on load
document.documentElement.setAttribute('data-theme', getThemePreference());
updateThemeIcon(getThemePreference());

// Toggle theme
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Update icon based on theme
function updateThemeIcon(theme) {
    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

// Watch for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
    }
});