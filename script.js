// ----- 움직임 줄이기 설정이면 여기서 끝 -----
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

  const hero = document.getElementById('hero');
  const heroImg = hero.querySelector('img');
  const heroTitle = hero.querySelector('.title');
  const shelf = document.getElementById('shelf');
  const track = document.getElementById('track');
  const reveal = document.getElementById('reveal');
  const win = document.getElementById('window');
  const winImg = win.querySelector('video');
  const caption = document.getElementById('caption');

  // 구역 안에서 얼마나 스크롤했는지 0~1로 알려주는 함수
  function progress(section) {
    const total = section.offsetHeight - window.innerHeight;
    const done = window.scrollY - section.offsetTop;
    return Math.min(Math.max(done / total, 0), 1);
  }

  // 그림 줄 길이에 맞춰 구역 높이 정하기
  let distance = 0;
  function measure() {
    distance = Math.max(track.scrollWidth - window.innerWidth, 0);
    shelf.style.height = (distance + window.innerHeight * 1.2) + 'px';
  }

  function update() {
    // 1. 첫 화면: 확대 + 제목이 위로 사라짐
    const p1 = progress(hero);
    heroImg.style.transform = 'scale(' + (1 + p1 * 0.5) + ')';
    heroTitle.style.transform = 'translateY(' + (-p1 * 120) + 'px)';
    heroTitle.style.opacity = 1 - p1 * 1.4;

    // 2. 그림 줄: 아래로 스크롤하면 왼쪽으로 이동
    const p2 = progress(shelf);
    track.style.transform = 'translateX(' + (-p2 * distance) + 'px)';
    // 액자 안 그림은 반대로 살짝 움직여서 깊이감
    track.querySelectorAll('.drawing img').forEach(function (img) {
      img.style.transform = 'scale(1.15) translateX(' + ((p2 - 0.5) * 6) + '%)';
    });

    // 3. 마지막 그림: 가운데 작은 창 → 화면 가득
    const p3 = progress(reveal);
    const grow = Math.min(p3 / 0.7, 1);            // 70% 지점에서 다 커짐
    const ease = 1 - Math.pow(1 - grow, 3);         // 처음엔 빠르고 끝은 부드럽게
    const sideX = 32 * (1 - ease);
    const sideY = 22 * (1 - ease);
    win.style.clipPath = 'inset(' + sideY + '% ' + sideX + '% round ' + (12 * (1 - ease)) + 'px)';
    winImg.style.transform = 'scale(' + (1.3 - ease * 0.3) + ')';
    caption.style.opacity = Math.max((p3 - 0.6) / 0.25, 0);
  }

  // 스크롤할 때마다 화면 갱신 (너무 자주 계산하지 않게 묶어서)
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

  // ----- 그림 줄을 마우스로 잡아끌기 -----
  const shelfSticky = document.getElementById('shelf-sticky');
  let dragging = false, lastX = 0;
  shelfSticky.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return; // 폰은 그냥 스크롤로
    dragging = true; lastX = e.clientX;
    shelfSticky.classList.add('dragging');
  });
  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    // 왼쪽으로 끌면 = 아래로 스크롤 (그림이 왼쪽으로 흘러감)
    window.scrollBy(0, (lastX - e.clientX) * 1.5);
    lastX = e.clientX;
  });
  window.addEventListener('pointerup', function () {
    dragging = false;
    shelfSticky.classList.remove('dragging');
  });
}
  
