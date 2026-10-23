
'use strict';

/* ---------- Photo collection: 17 images ---------- */
const photos = [
  {
    title: 'Misty Forest',
    category: 'Nature',
    h: 750,
    image: 'photo-1448375240586-882707db888b'
  },
  {
    title: 'Ocean Waves',
    category: 'Water',
    h: 500,
    image: 'photo-1500375592092-40eb2168fd21'
  },
  {
    title: 'Creative Workspace',
    category: 'Workspace',
    h: 600,
    image: 'photo-1497366754035-f200968a6e72'
  },
  {
    title: 'Mountain Escape',
    category: 'Nature',
    h: 650,
    image: 'photo-1464822759023-fed622ff2c3b'
  },
  {
    title: 'Blue Ocean',
    category: 'Water',
    h: 700,
    image: 'photo-1518837695005-2083093ee35b'
  },
  {
    title: 'Minimal Desk',
    category: 'Workspace',
    h: 480,
    image: 'photo-1498050108023-c5249f4df085'
  },
  {
    title: 'Green Paradise',
    category: 'Nature',
    h: 620,
    image: 'photo-1441974231531-c6227db76b6e'
  },
  {
    title: 'Tropical Beach',
    category: 'Water',
    h: 550,
    image: 'photo-1507525428034-b723cf961d3e'
  },
  {
    title: 'Modern Office',
    category: 'Workspace',
    h: 650,
    image: 'photo-1497366216548-37526070297c'
  },
  {
    title: 'Forest Trail',
    category: 'Nature',
    h: 700,
    image: 'photo-1473448912268-2022ce9509d8'
  },
  {
    title: 'Peaceful Lake',
    category: 'Water',
    h: 600,
    image: 'photo-1470770841072-f978cf4d019e'
  },
  {
    title: 'Coffee Moments',
    category: 'Workspace',
    h: 500,
    image: 'photo-1495474472287-4d71bcdd2085'
  },
  {
    title: 'Golden Mountains',
    category: 'Nature',
    h: 680,
    image: 'photo-1500530855697-b586d89ba3ee'
  },
  {
    title: 'Beautiful Coast',
    category: 'Water',
    h: 470,
    image: 'photo-1519046904884-53103b34b206'
  },
  {
    title: 'Design Studio',
    category: 'Workspace',
    h: 600,
    image: 'photo-1497366811353-6870744d04b2'
  },
  {
    title: 'Autumn Forest',
    category: 'Nature',
    h: 560,
    image: 'photo-1502082553048-f009c37129b9'
  }
].map(photo => ({
  ...photo,
  thumb: `https://images.unsplash.com/${photo.image}?auto=format&fit=crop&w=650&h=${photo.h}&q=80`,
  full: `https://images.unsplash.com/${photo.image}?auto=format&fit=max&w=1600&q=85`
}));

/* ---------- HTML elements ---------- */
const $ = id => document.getElementById(id);

const gallery = $('gallery');
const filtersEl = $('filters');
const countEl = $('count');

const lightbox = $('lightbox');
const lbImg = $('lbImg');
const lbCaption = $('lbCaption');
const lbCount = $('lbCount');

let activeCategory = 'All';
let visible = [];
let current = 0;
let lastFocused = null;
let swapTimer;

/* ---------- Create photo cards ---------- */
const cards = photos.map((photo, i) => {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'card';
  button.style.setProperty('--i', i);
  button.style.aspectRatio = `600 / ${photo.h}`;
  button.setAttribute('aria-label', `Open ${photo.title}`);

  const img = document.createElement('img');
  img.src = photo.thumb;
  img.alt = photo.title;
  img.loading = 'lazy';
  img.decoding = 'async';

  const label = document.createElement('span');
  label.className = 'label';
  label.append(document.createTextNode(photo.title));

  const category = document.createElement('small');
  category.textContent = photo.category;
  label.appendChild(category);

  button.append(img, label);
  button.addEventListener('click', () => openLightbox(photo));

  gallery.appendChild(button);
  return button;
});

/* ---------- Category filters ---------- */
const categories = [
  'All',
  ...new Set(photos.map(photo => photo.category))
];

categories.forEach(category => {
  const button = document.createElement('button');

  button.type = 'button';
  button.className =
    'filter-btn' + (category === 'All' ? ' active' : '');
  button.textContent = category;
  button.setAttribute(
    'aria-pressed',
    category === 'All' ? 'true' : 'false'
  );

  button.addEventListener('click', () => {
    applyFilter(category, button);
  });

  filtersEl.appendChild(button);
});

/* ---------- Filter gallery ---------- */
function getVisible() {
  return photos.filter(photo =>
    activeCategory === 'All' ||
    photo.category === activeCategory
  );
}

function updateCount() {
  const total = getVisible().length;
  countEl.textContent = `${total} photo${total === 1 ? '' : 's'}`;
}

function applyFilter(category, selectedButton) {
  if (category === activeCategory) return;

  activeCategory = category;

  filtersEl.querySelectorAll('.filter-btn').forEach(button => {
    const active = button === selectedButton;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  gallery.classList.add('fading');

  setTimeout(() => {
    cards.forEach((card, index) => {
      card.hidden = !(
        category === 'All' ||
        photos[index].category === category
      );
    });

    gallery.classList.remove('fading');
    updateCount();
  }, 200);
}

updateCount();

/* ---------- Full-screen photo viewer ---------- */
function openLightbox(photo) {
  visible = getVisible();
  current = visible.indexOf(photo);

  if (current < 0) return;

  lastFocused = document.activeElement;

  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');

  show(current, false);
  $('lbClose').focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');

  clearTimeout(swapTimer);
  lbImg.classList.remove('swapping');

  if (lastFocused) lastFocused.focus();
}

function show(index, animate = true) {
  if (!visible.length) return;

  current = (index + visible.length) % visible.length;

  const photo = visible[current];

  clearTimeout(swapTimer);

  function updateImage() {
    lbImg.onload = () => {
      lbImg.classList.remove('swapping');
    };

    lbImg.onerror = () => {
      lbImg.classList.remove('swapping');
      lbCaption.textContent = photo.title + ' (image unavailable)';
    };

    lbImg.src = photo.full;
    lbImg.alt = photo.title;
    lbCaption.textContent = photo.title;
    lbCount.textContent = `${current + 1} / ${visible.length}`;

    /* Preload neighbouring photos */
    [current - 1, current + 1].forEach(i => {
      const adjacent = visible[
        (i + visible.length) % visible.length
      ];

      const preload = new Image();
      preload.src = adjacent.thumb;
    });
  }

  if (animate) {
    lbImg.classList.add('swapping');
    swapTimer = setTimeout(updateImage, 150);
  } else {
    updateImage();
  }
}

function next() {
  show(current + 1);
}

function prev() {
  show(current - 1);
}

/* ---------- Viewer buttons ---------- */
$('lbNext').addEventListener('click', next);
$('lbPrev').addEventListener('click', prev);
$('lbClose').addEventListener('click', closeLightbox);

/* Close by clicking the dark background */
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});

/* Keyboard navigation */
document.addEventListener('keydown', event => {
  if (!lightbox.classList.contains('open')) return;

  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowRight') next();
  if (event.key === 'ArrowLeft') prev();
});

/* Swipe navigation on mobile */
let startX = 0;

lightbox.addEventListener('touchstart', event => {
  startX = event.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener('touchend', event => {
  const distance = event.changedTouches[0].clientX - startX;

  if (Math.abs(distance) > 50) {
    if (distance < 0) next();
    else prev();
  }
}, { passive: true });
