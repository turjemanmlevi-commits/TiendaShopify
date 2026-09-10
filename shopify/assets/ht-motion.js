(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let paused = false;
  if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
    subscribe(PUB_SUB_EVENTS.cartUpdate, ({ cartData } = {}) => {
      if (!Number.isInteger(cartData?.item_count) || cartData.item_count < 0) return;
      document.querySelectorAll('.ht-bag').forEach((bag) => {
        const badge = bag.querySelector('span');
        if (badge) badge.textContent = String(cartData.item_count);
        if (bag.dataset.htBagLabel) bag.setAttribute('aria-label', bag.dataset.htBagLabel.replace('__COUNT__', String(cartData.item_count)));
      });
    });
  }
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('ht-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' })
    : null;
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
    if (revealObserver) {
      container.querySelectorAll('.ht-product-grid, .ht-mood-grid').forEach((grid) => {
        grid.querySelectorAll(':scope > [data-ht-reveal]').forEach((element, index) => {
          element.style.setProperty('--ht-reveal-delay', `${(index % 4) * 70}ms`);
        });
      });
      container.querySelectorAll('[data-ht-reveal], .ht-guide-teaser__photo, .ht-guide-teaser__copy, .ht-editorial__photo').forEach((element) => {
        if (!element.classList.contains('ht-revealed')) revealObserver.observe(element);
      });
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
  document.addEventListener('focusin', (event) => {
    document.querySelectorAll('.ht-header details[open]').forEach((details) => {
      if (!details.contains(event.target)) details.open = false;
    });
  });
  document.addEventListener('shopify:section:load', (event) => init(event.target));
  document.addEventListener('shopify:section:unload', (event) => {
    event.target.querySelectorAll('[data-ht-reveal], .ht-guide-teaser__photo, .ht-guide-teaser__copy, .ht-editorial__photo').forEach((element) => revealObserver?.unobserve(element));
  });
  reduced.addEventListener('change', updateMotion);
  init();
})();
