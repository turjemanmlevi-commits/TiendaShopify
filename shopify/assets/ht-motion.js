(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let paused = false;
  function updateMotion() {
    root.classList.toggle('ht-motion-paused', paused || reduced.matches);
    document.querySelectorAll('[data-ht-motion]').forEach((button) => {
      button.hidden = reduced.matches;
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', paused ? button.dataset.play : button.dataset.pause);
      button.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
    });
  }
  function init(container = document) {
    container.querySelectorAll('.ht-product-form').forEach((form) => {
      if (form.dataset.checkoutGuardReady) return;
      form.dataset.checkoutGuardReady = 'true';
      form.addEventListener('submit', (event) => {
        if (form.querySelector('[data-ht-add]')?.disabled) event.preventDefault();
      });
    });
    container.querySelectorAll('[data-ht-motion]').forEach((button) => {
      if (button.dataset.ready) return;
      button.dataset.ready = 'true';
      button.addEventListener('click', () => { paused = !paused; updateMotion(); });
    });
    container.querySelectorAll('[data-ht-variant]').forEach((select) => {
      if (select.dataset.ready) return;
      select.dataset.ready = 'true';
      select.addEventListener('change', () => {
        const option = select.selectedOptions[0];
        const form = select.closest('form');
        const section = form.closest('.ht-product');
        const button = form.querySelector('[data-ht-add]');
        const quantity = form.querySelector('[name="quantity"]');
        const accelerated = form.querySelector('[data-ht-accelerated]');
        const available = option.dataset.available === 'true';
        if (accelerated) {
          accelerated.hidden = !available;
          accelerated.inert = !available;
        }
        button.disabled = !available;
        button.textContent = available ? button.dataset.addLabel : button.dataset.soldLabel;
        section.querySelector('[data-ht-price]').textContent = option.dataset.price;
        form.querySelector('[data-ht-availability]').hidden = available;
        quantity.min = option.dataset.min || '1';
        quantity.step = option.dataset.step || '1';
        quantity.value = quantity.min;
        if (option.dataset.max) quantity.max = option.dataset.max;
        else quantity.removeAttribute('max');
        const url = new URL(window.location.href);
        url.searchParams.set('variant', option.value);
        history.replaceState(null, '', url);
      });
    });
    if ('IntersectionObserver' in window && !reduced.matches) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('ht-revealed');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      container.querySelectorAll('[data-ht-reveal]:not(.ht-revealed)').forEach((element) => observer.observe(element));
    }
    root.classList.add('ht-motion-ready');
    updateMotion();
  }
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.ht-header details[open]').forEach((details) => {
      if (details.contains(document.activeElement)) details.querySelector('summary').focus();
      details.open = false;
    });
  });
  document.addEventListener('click', (event) => {
    document.querySelectorAll('.ht-header details[open]').forEach((details) => {
      if (!details.contains(event.target)) details.open = false;
    });
  });
  document.addEventListener('shopify:section:load', (event) => init(event.target));
  reduced.addEventListener('change', updateMotion);
  init();
})();
