// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });

    // Enhanced Typed.js
    if (document.getElementById('typed')) {
        new Typed('#typed', {
            strings: [
                'AI/ML Engineer',
                'Data Scientist', 
                'Research Scholar',
                'Python Developer',
                'Cloud Architect',
                'Problem Solver',
                'Kaggle Competitor',
                'Open Source Contributor'
            ],
            typeSpeed: 60,
            backSpeed: 35,
            loop: true,
            backDelay: 2000,
            startDelay: 500,
            showCursor: true,
            cursorChar: '|'
        });
    }

    // Initialize charts
    initializeCharts();
    
    // Initialize other features
    initializeSkillBars();
    initializeProjectFilters();
    initializeCodePlayground();
});

// Enhanced Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add transition class
        document.body.style.transition = 'all 0.3s ease';
        
        html.setAttribute('data-theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', newTheme);
        
        // Remove transition after animation
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    });

    // Load saved theme on page load
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Enhanced Navigation
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        navToggle.classList.toggle('active');
    });

    // Close nav when clicking on links (mobile)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show');
            navToggle.classList.remove('active');
        });
    });

    // Close nav when clicking outside (mobile)
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('show');
            navToggle.classList.remove('active');
        }
    });
}

// Enhanced smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Enhanced navbar scroll effects
let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar-glass');

if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Add/remove shadow based on scroll position
        if (currentScrollY > 10) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.boxShadow = '0 2px 8px rgba(60, 60, 130, 0.04)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
        
        // Hide/show navbar on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
}

// Initialize Charts
function initializeCharts() {
    // Skills Radar Chart
    const radar = document.getElementById('skillRadar');
    if (radar && typeof Chart !== 'undefined') {
        new Chart(radar, {
            type: 'radar',
            data: {
                labels: ['Python', 'Machine Learning', 'Data Analysis', 'Cloud Computing', 'Web Development', 'Research', 'Problem Solving'],
                datasets: [{
                    label: 'Proficiency Level',
                    data: [95, 90, 88, 85, 80, 92, 95],
                    backgroundColor: 'rgba(58, 134, 255, 0.2)',
                    borderColor: 'rgba(58, 134, 255, 1)',
                    pointBackgroundColor: 'rgba(58, 134, 255, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(58, 134, 255, 1)',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            display: false
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    }
                }
            }
        });
    }
}

// Initialize Skill Bars
function initializeSkillBars() {
    setTimeout(() => {
        document.querySelectorAll('.skill-progress').forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            if (progress) {
                bar.style.width = progress + '%';
            }
        });
    }, 1000);
}

// Initialize Project Filters
function initializeProjectFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            const projectCards = document.querySelectorAll('.project-card');
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.dataset.type === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    card.style.animation = 'fadeOut 0.3s ease forwards';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Enhanced "Explain My Project" Button
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('explain-btn') || e.target.closest('.explain-btn')) {
        const btn = e.target.classList.contains('explain-btn') ? e.target : e.target.closest('.explain-btn');
        const summary = btn.getAttribute('data-desc');
        
        let summaryElement = btn.parentElement.querySelector('.project-summary');
        
        if (!summaryElement) {
            summaryElement = document.createElement('div');
            summaryElement.className = 'project-summary';
            btn.parentElement.appendChild(summaryElement);
        }
        
        // Show loading state
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        
        // Simulate AI typing effect
        setTimeout(() => {
            typeText(summaryElement, 'AI Summary: ' + summary, 50);
            btn.innerHTML = '<i class="fas fa-robot"></i> AI Explain';
            
            // Reset after 8 seconds
            setTimeout(() => {
                summaryElement.innerHTML = '';
                btn.disabled = false;
            }, 8000);
        }, 1500);
    }
});

// Typing effect function
function typeText(element, text, speed) {
    element.innerHTML = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Enhanced Model Playground
window.runModelDemo = function() {
    const input = document.getElementById('model-input');
    const output = document.getElementById('model-output');
    
    if (!input || !output) return;
    
    const inputValue = input.value;
    
    if (!inputValue.trim()) {
        output.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please enter some text to analyze.';
        return;
    }
    
    // Show loading state
    output.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing your text...';
    
    // Simulate API call delay
    setTimeout(() => {
        let sentiment, emoji, confidence;
        
        // Enhanced sentiment analysis
        const positiveWords = ['good', 'great', 'excellent', 'awesome', 'amazing', 'fantastic', 'wonderful', 'love', 'perfect', 'outstanding'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'disappointing', 'poor', 'sad', 'angry'];
        
        const lowerInput = inputValue.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerInput.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerInput.includes(word)).length;
        
        if (positiveCount > negativeCount) {
            sentiment = 'Positive';
            emoji = '😊';
            confidence = Math.min(85 + (positiveCount * 5), 95);
        } else if (negativeCount > positiveCount) {
            sentiment = 'Negative';
            emoji = '😞';
            confidence = Math.min(85 + (negativeCount * 5), 95);
        } else {
            sentiment = 'Neutral';
            emoji = '😐';
            confidence = Math.floor(Math.random() * 20) + 70;
        }
        
        output.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 2rem;">${emoji}</span>
                <div>
                    <strong>Sentiment: ${sentiment}</strong><br>
                    <small>Confidence: ${confidence}%</small>
                </div>
            </div>
        `;
    }, 2000);
};

// Initialize Code Playground
function initializeCodePlayground() {
    const codeExamples = {
        'linear-regression': `# Linear Regression Demo
import numpy as np
from sklearn.linear_model import LinearRegression

# Sample data
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

# Create and train model
model = LinearRegression()
model.fit(X, y)

# Make prediction
prediction = model.predict([[6]])
print(f"Prediction for x=6: {prediction[0]:.2f}")`,

        'clustering': `# K-Means Clustering Demo
from sklearn.cluster import KMeans
import numpy as np

# Sample data
X = np.array([[1, 2], [1, 4], [1, 0],
              [10, 2], [10, 4], [10, 0]])

# Create and fit model
kmeans = KMeans(n_clusters=2, random_state=0)
kmeans.fit(X)

# Get cluster centers
centers = kmeans.cluster_centers_
print(f"Cluster centers: {centers}")`,

        'classification': `# Classification Demo
from sklearn.ensemble import RandomForestClassifier
import numpy as np

# Sample data
X = np.array([[0, 0], [1, 1], [2, 2], [3, 3]])
y = np.array([0, 1, 1, 0])

# Create and train model
clf = RandomForestClassifier(n_estimators=10)
clf.fit(X, y)

# Make prediction
prediction = clf.predict([[1.5, 1.5]])
print(f"Prediction: {prediction[0]}")`
    };

    // Algorithm selector functionality
    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Update code display
            const algo = btn.getAttribute('data-algo');
            const codeElement = document.getElementById('demo-code');
            if (codeElement && codeExamples[algo]) {
                codeElement.textContent = codeExamples[algo];
            }
        });
    });
}

// Enhanced code execution
window.runCodeDemo = function() {
    const resultArea = document.getElementById('code-result');
    const runBtn = document.querySelector('.run-btn');
    const activeAlgoBtn = document.querySelector('.algo-btn.active');
    
    if (!resultArea || !runBtn || !activeAlgoBtn) return;
    
    const activeAlgo = activeAlgoBtn.getAttribute('data-algo');
    
    // Show loading state
    runBtn.disabled = true;
    runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
    resultArea.innerHTML = '<i class="fas fa-cog fa-spin"></i> Executing code...';
    
    // Simulate code execution
    setTimeout(() => {
        let output = '';
        
        switch(activeAlgo) {
            case 'linear-regression':
                output = `<div class="code-success">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>Output:</strong><br>
                        Prediction for x=6: 12.00<br>
                        <small>Model R² Score: 1.00</small>
                    </div>
                </div>`;
                break;
            case 'clustering':
                output = `<div class="code-success">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>Output:</strong><br>
                        Cluster centers: [[1. 2.] [10. 2.]]<br>
                        <small>2 clusters identified</small>
                    </div>
                </div>`;
                break;
            case 'classification':
                output = `<div class="code-success">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>Output:</strong><br>
                        Prediction: 1<br>
                        <small>Confidence: 87%</small>
                    </div>
                </div>`;
                break;
        }
        
        resultArea.innerHTML = output;
        runBtn.disabled = false;
        runBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
    }, 2000);
};

// Enhanced Contact form
window.handleContact = function(event) {
    event.preventDefault();
    
    const form = event.target;
    const successDiv = document.getElementById('contact-success');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!form || !successDiv || !submitBtn) return false;
    
    // Get form data
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Basic validation
    if (!name || !email || !message) {
        successDiv.innerHTML = '<span style="color: red;">Please fill in all fields.</span>';
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        successDiv.innerHTML = '<span style="color: red;">Please enter a valid email address.</span>';
        return false;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Simulate form submission
    setTimeout(() => {
        successDiv.innerHTML = `
            <div style="color: var(--success); padding: 1rem; background: #f0f9ff; border-radius: 8px; margin-top: 1rem;">
                <i class="fas fa-check-circle"></i> 
                Thanks ${name}! Your message has been sent. I'll get back to you soon.
            </div>
        `;
        
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Message</span> <i class="fas fa-paper-plane"></i>';
        
        // Clear success message after 5 seconds
        setTimeout(() => {
            successDiv.innerHTML = '';
        }, 5000);
    }, 1500);
    
    return false;
};

// Create particles for hero section
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--primary);
            border-radius: 50%;
            opacity: 0.3;
            animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 2}s;
        `;
        particlesContainer.appendChild(particle);
    }
}

// Initialize particles
document.addEventListener('DOMContentLoaded', createParticles);

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        if (navToggle) navToggle.classList.remove('active');
    }
});

console.log('Portfolio JavaScript loaded successfully! 🚀');
