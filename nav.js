(() => {
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.menu');
  if (!nav || !menu) return;

  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.textContent = open ? '×' : '☰';
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  document.addEventListener('click', event => {
    if (nav.classList.contains('open') && !nav.contains(event.target)) setMenu(false);
  });
})();
