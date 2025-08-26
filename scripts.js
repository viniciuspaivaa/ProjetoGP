$(function () {
  $('.hamburguer-menu').on('click', function () {
    $('.toggle').toggleClass('open');
    $('.nav-list').toggleClass('open');
  });

  AOS.init({
    easing: 'ease',
    duration: 1000,
  });
  // ====== Cardápio: busca/filtragem ======
  const $search = $('#menu-search');
  const $clear = $('#menu-clear');
  function filterMenu() {
    const term = ($search.val() || '').toString().trim().toLowerCase();
    const $items = $('#menu .row [data-item]');
    if (!term) { $items.removeClass('menu-item-hidden'); return; }
    $items.each(function(){
      const name = ($(this).data('name') || '').toString().toLowerCase();
      if (name.includes(term)) $(this).removeClass('menu-item-hidden');
      else $(this).addClass('menu-item-hidden');
    });
  }
  $search.on('input', filterMenu);
  $clear.on('click', function(){ $search.val(''); filterMenu(); $search.trigger('blur'); });

  // ====== Quick view simples (usa attributes de dados) ======
  $(document).on('click', '#menu [data-item] img, #menu [data-item] .menu-item-desc h2', function(){
    const $p = $(this).closest('[data-item]');
    const name = $p.data('name');
    const price = $p.data('price');
    const img = $p.data('img');
    const html = `
      <div class="menu-quickview-backdrop" style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px;">
        <div class="menu-quickview" role="dialog" aria-modal="true" style="max-width:720px;width:100%;background:#0e141b;border:1px solid #2a2f36;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,.35);overflow:hidden;color:#eef2f6;">
          <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;">
            <img src="${img}" alt="${name}" style="max-width:320px;width:100%;display:block;background:#fff;border-radius:8px;margin:16px;">
            <div style="flex:1;min-width:220px;padding:16px 16px 16px 0;">
              <h3 style="margin:0 0 10px 0;color:#c69963;">${name}</h3>
              <p style="margin:0 0 14px 0;color:#c2c7cf;">Preço sugerido: <strong style="color:#fff;">R$${price}</strong></p>
              <div class="menu-card-actions">
                <button class="menu-btn-sm" data-action="favorite">Favoritar</button>
                <button class="menu-btn-sm" data-action="close">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    $('body').append(html);
  });

  // Fechar quick view
  $(document).on('click', '.menu-quickview-backdrop, .menu-quickview [data-action="close"]', function(e){
    if (e.target !== this && !$(e.target).is('[data-action="close"]')) return;
    $('.menu-quickview-backdrop').remove();
  });
  $(document).on('keydown', function(e){ if (e.key === 'Escape') $('.menu-quickview-backdrop').remove(); });

  // Favoritar simples (localStorage)
  $(document).on('click', '.menu-quickview [data-action="favorite"]', function(){
    const $view = $(this).closest('.menu-quickview');
    const name = $view.find('h3').text();
    const key = 'menu_favs';
    const favs = JSON.parse(localStorage.getItem(key) || '[]');
    if (!favs.includes(name)) favs.push(name);
    localStorage.setItem(key, JSON.stringify(favs));
    $(this).text('Favorito ✓');
  });
});

