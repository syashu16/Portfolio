// Typed.js animated intro
new Typed('#typed', {
  strings: ['AI/ML Developer', 'Data Scientist', 'Researcher', 'Kaggle Competitor', 'Pythonista'],
  typeSpeed: 60,
  backSpeed: 35,
  loop: true
});

// Dark/Light mode toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fa fa-sun"></i>' : '<i class="fa fa-moon"></i>';
  localStorage.setItem('theme', newTheme);
});
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fa fa-sun"></i>' : '<i class="fa fa-moon"></i>';
  }
});

// Skill Radar Chart (Chart.js)
const radar = document.getElementById('skillRadar');
if (radar) {
  new Chart(radar, {
    type: 'radar',
    data: {
      labels: ['Python', 'ML', 'DL', 'NLP', 'DataViz', 'Web', 'Cloud'],
      datasets: [{
        label: 'Proficiency',
        data: [9, 8, 7, 7, 8, 7, 6],
        backgroundColor: 'rgba(58, 134, 255, 0.2)',
        borderColor: 'rgba(58, 134, 255, 1)'
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { r: { min: 0, max: 10, ticks: { stepSize: 2 } } }
    }
  });
}

// Project Gallery Filter
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.onclick = e => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.project-card').forEach(card => {
      card.style.display = filter === 'all' || card.dataset.type === filter ? '' : 'none';
    });
  };
});

// "Explain My Project" Button (AI-generated summary mock)
document.querySelectorAll('.explain-btn').forEach(btn => {
  btn.onclick = () => {
    const summary = btn.getAttribute('data-desc');
    const span = btn.parentElement.querySelector('.project-summary');
    span.innerText = 'AI Summary: ' + summary;
    btn.disabled = true;
    setTimeout(() => { btn.disabled = false; span.innerText = ''; }, 5000);
  };
});

// Model Playground (mock sentiment)
function runModelDemo() {
  const input = document.getElementById('model-input').value;
  const output = document.getElementById('model-output');
  if (!input.trim()) { output.innerText = "Please enter some text."; return; }
  // Simple demo: positive if text contains 'good' or 'great'
  if (/good|great|excellent|awesome/i.test(input)) output.innerText = "Sentiment: Positive 😀";
  else if (/bad|terrible|sad|poor/i.test(input)) output.innerText = "Sentiment: Negative 😞";
  else output.innerText = "Sentiment: Neutral 😐";
}

// Contact form (demo, no backend)
function handleContact(event) {
  event.preventDefault();
  document.getElementById('contact-success').innerText = "Thanks for reaching out! I'll reply soon.";
  event.target.reset();
  return false;
}