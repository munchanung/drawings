// 0~1 사이로 자르기
function clamp01(v) { return Math.min(Math.max(v, 0), 1); }
// a~b 구간에서 0→1로 바뀌는 값
function between(p, a, b) { return clamp01((p - a) / (b - a)); }
// 끝으로 갈수록 부드럽게
function ease(t) { return 1 - Math.pow(1 - t, 3); }

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ----- 마우스를 따라오는 빛 -----
window.addEventListener('pointermove', function (e) {
  document.documentElement.style.setProperty('--mx', e.clientX + 'px');
  document.documentElement.style.setProperty('--my', e.clientY + 'px');
});

// ----- 지금 어느 방에 있는지 안내판 바꾸기 -----
const sign = document.getElementById('sign');
const rooms = document.querySelectorAll('[data-room]');
function updateSign() {
  const mid = window.innerHeight / 2;
  rooms.forEach(function (room) {
    const r = room.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid && sign.textContent !== room.dataset.room) {
      sign.style.opacity = 0;
      setTimeout(function () { sign.textContent = room.dataset.room; sign.style.opacity = 1; }, 200);
    }
  });
}

if (!reduce) {
  const entrance = document.getElementById('entrance');
  const entTitle = document.getElementById('ent-title');
  const pool = document.getElementById('pool');
  const entWork = document.getElementById('ent-work');
  const entLabel = document.getElementById('ent-label');
  const hint = document.getElementById('hint');

  const hall = document.getElementById('hall');
  const track = document.getElementById('track');
  const works = track.querySelectorAll('.work');

  const lines = document.querySelectorAll('.statement span');

  const reveal = document.getElementById('reveal');
  const win = document.getElementById('window');
  const video = win.querySelector('video');
  const caption = document.getElementById('caption');

  // 구역 안에서 얼마나 스크롤했는지 0~1
  function progress(section) {
    const total = section.offsetHeight - window.innerHeight;
    return clamp01((window.scrollY - section.offsetTop) / total);
  }

  // 전시실 벽 길이에 맞춰 구역 높이 정하기
  let distance = 0;
  function measure() {
    distance = Math.max(track.scrollWidth - window.innerWidth, 0);
    hall.style.height = (distance + window.innerHeight * 1.3) + 'px';
  }

  function update() {
    const vw = window.innerWidth, vh = window.innerHeight;

    // 1. 입구: 제목이 사라지고 → 조명이 켜지고 → 첫 작품이 나타남
    const p1 = progress(entrance);
    const t = between(p1, 0.05, 0.3);
    entTitle.style.opacity = 1 - t;
    entTitle.style.transform = 'translateY(' + (-t * 60) + 'px) scale(' + (1 - t * 0.06) + ')';
    hint.style.opacity = 1 - between(p1, 0, 0.08);
    pool.style.opacity = ease(between(p1, 0.25, 0.5));
    const w = ease(between(p1, 0.32, 0.62));
    entWork.style.opacity = w;
    entWork.style.transform = 'translate(-50%, -50%) scale(' + (0.9 + w * 0.1) + ')';
    entWork.style.filter = 'brightness(' + (0.4 + w * 0.6) + ')';
    entLabel.style.opacity = between(p1, 0.62, 0.8);

    // 2. 전시실: 옆으로 이동 + 가운데 온 작품에만 조명이 환하게
    const p2 = progress(hall);
    track.style.transform = 'translateX(' + (-p2 * distance) + 'px)';
    works.forEach(function (work) {
      const img = work.querySelector('img');
      const r = img.getBoundingClientRect();
      const off = Math.abs(r.left + r.width / 2 - vw / 2) / (vw * 0.55);
      const lit = ease(1 - clamp01(off));
      work.querySelector('.light').style.opacity = 0.15 + lit * 0.85;
      img.style.filter = 'brightness(' + (0.22 + lit * 0.78) + ')';
      work.querySelector('.label').style.opacity = 0.15 + lit * 0.85;
    });

    // 3. 작가의 말: 화면 가운데 온 문장만 밝게
    lines.forEach(function (line) {
      const r = line.getBoundingClientRect();
      const off = Math.abs(r.top + r.height / 2 - vh / 2) / (vh * 0.3);
      line.style.opacity = 0.14 + (1 - clamp01(off)) * 0.86;
    });

    // 4. 작업실: 가운데 작은 창 → 화면 가득
    const p3 = progress(reveal);
    const g = ease(clamp01(p3 / 0.7));
    win.style.clipPath = 'inset(' + (24 * (1 - g)) + '% ' + (34 * (1 - g)) + '%)';
    video.style.transform = 'scale(' + (1.3 - g * 0.3) + ')';
    caption.style.opacity = between(p3, 0.6, 0.85);

    updateSign();
  }

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }
  }, { passive: true });
  window.addEventListener('resize', function () { measure(); update(); });
  window.addEventListener('load', function () { measure(); update(); });
  measure();
  update();

  // ----- 전시실 벽을 마우스로 잡아끌기 -----
  const hallSticky = document.getElementById('hall-sticky');
  let dragging = false, lastX = 0;
  hallSticky.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    dragging = true; lastX = e.clientX;
    hallSticky.classList.add('dragging');
  });
  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    window.scrollBy(0, (lastX - e.clientX) * 1.5);
    lastX = e.clientX;
  });
  window.addEventListener('pointerup', function () {
    dragging = false;
    hallSticky.classList.remove('dragging');
  });
} else {
  window.addEventListener('scroll', updateSign, { passive: true });
}
