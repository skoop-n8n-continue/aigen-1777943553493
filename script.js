async function loadAppData() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load app data:', error);
    return null;
  }
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour12: false });
  document.getElementById('clock-time').textContent = timeString;
}

async function init() {
  // Set static date (set once on load)
  const now = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('date-display').textContent = now.toLocaleDateString('en-US', dateOptions);

  // START UNCONDITIONALLY - Do not gate inside show_clock boolean.
  setInterval(updateClock, 1000);
  updateClock();

  // Load configuration
  const data = await loadAppData();
  if (!data) return;

  const settings = data.sections.app_settings;

  // Apply all global data-driven styles BEFORE revealing app
  const root = document.documentElement;
  root.style.setProperty('--primary-color', settings.primary_color.value);
  root.style.setProperty('--header-text-color', settings.header_text_color.value);
  root.style.setProperty('--accent-color', settings.accent_color.value);
  root.style.setProperty('--ticker-bg-color', settings.ticker_bg_color.value);

  // Populate static fields for initial load
  document.querySelector('.ticker-content').textContent = settings.ticker_message.value;
  document.querySelector('.hero-banner h2').textContent = settings.hero_headline.value;
  document.querySelector('.hero-banner h2').style.color = settings.hero_text_color.value;
  document.querySelector('.hero-banner p').textContent = settings.hero_subtitle.value;
  document.querySelector('.hero-banner').style.backgroundImage = `url('${settings.hero_image.value}')`;

  // Handle Announcements Section
  const container = document.getElementById('announcements-container');
  // Set initial class for layout mode
  container.className = `announcements-container display_mode-${settings.display_mode.value}`;

  // Render cards unconditionally
  const announcements = data.sections.announcements?.value || [];

  announcements.forEach((ann, idx) => {
    // Preserve original array index for binding
    const item = { ...ann, _idx: idx };

    const card = document.createElement('div');
    card.className = 'announcement-card';

    // Set custom prop for per-card color
    card.style.setProperty('--card-color', item.card_color);
    // Add live binding for this style property
    card.setAttribute('data-bind-style', `--card-color:announcements.${item._idx}.card_color`);

    let imageHtml = '';
    if (item.card_image) {
      imageHtml = `
        <div class="card-image-wrap">
          <img data-bind-src="announcements.${item._idx}.card_image" src="${item.card_image}" alt="">
        </div>
      `;
    }

    card.innerHTML = `
      ${imageHtml}
      <div class="card-content">
        <h3 data-bind-text="announcements.${item._idx}.title">${item.title}</h3>
        <p data-bind-text="announcements.${item._idx}.body">${item.body}</p>
      </div>
    `;

    container.appendChild(card);
  });

  // Data applied, reveal the application
  document.getElementById('app-container').classList.add('loaded');
}

// Start application
init();