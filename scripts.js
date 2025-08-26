$(function () {
  // Garante um contêiner raiz para aplicar filtros sem afetar o body
  function ensureVisionRoot() {
    if (document.getElementById('vision-root')) return;
    const root = document.createElement('div');
    root.id = 'vision-root';
    // Move todos os nós existentes do body para dentro do root
    while (document.body.firstChild) {
      root.appendChild(document.body.firstChild);
    }
    document.body.appendChild(root);
  }

  ensureVisionRoot();

  $('.hamburguer-menu').on('click', function () {
    $('.toggle').toggleClass('open');
    $('.nav-list').toggleClass('open');
  });

  AOS.init({
    easing: 'ease',
    duration: 1000,
    once: false, // permite reexecutar ao voltar para a seção
    mirror: true, // anima ao rolar para cima também
    offset: 24,
  });

  // Animações no Cardápio (Doces e Pães)
  function initMenuAOS() {
    const $menu = $('#menu');
    if (!$menu.length) return;

    const $imgs = $menu.find('[data-item] img');
    $imgs.each(function (i) {
      const $el = $(this);
      if (!$el.attr('data-aos')) $el.attr('data-aos', 'zoom-in');
      if (!$el.attr('data-aos-delay')) $el.attr('data-aos-delay', (i % 6) * 80);
      $el.attr('data-aos-anchor-placement', 'center-bottom');
    });

    const $descs = $menu.find('[data-item] .menu-item-desc');
    $descs.each(function (i) {
      const $el = $(this);
      if (!$el.attr('data-aos')) $el.attr('data-aos', i % 2 ? 'fade-left' : 'fade-right');
      if (!$el.attr('data-aos-delay')) $el.attr('data-aos-delay', ((i % 6) * 80) + 60);
      $el.attr('data-aos-anchor-placement', 'center-bottom');
    });

    try { (AOS.refreshHard ? AOS.refreshHard() : AOS.refresh()); } catch {}
  }

  // Inicializa as animações do cardápio
  initMenuAOS();

  // Recalcula AOS ao navegar por âncoras (ex.: #home, #about, #menu, #chefs)
  window.addEventListener('hashchange', () => {
    try { (AOS.refreshHard ? AOS.refreshHard() : AOS.refresh()); } catch {}
    // Dar foco quando vier das âncoras específicas
    const h = location.hash.replace('#','');
    if (h === 'info-hours') {
      const t = document.getElementById('info-hours-title');
      if (t) setTimeout(() => t.focus(), 0);
    }
    if (h === 'info-contact') {
      const t = document.getElementById('info-contact-title');
      if (t) setTimeout(() => t.focus(), 0);
    }
    if (h === 'about-title') {
      const t = document.getElementById('about-title');
      if (t) setTimeout(() => t.focus(), 0);
    }
    if (h === 'chefs-title') {
      const t = document.getElementById('chefs-title');
      if (t) setTimeout(() => t.focus(), 0);
    }
  });

  // Também ao carregar a página já com hash
  (function focusFromInitialHash(){
    const h = location.hash.replace('#','');
    if (h === 'info-hours') {
      const t = document.getElementById('info-hours-title');
      if (t) setTimeout(() => t.focus(), 100);
    } else if (h === 'info-contact') {
      const t = document.getElementById('info-contact-title');
      if (t) setTimeout(() => t.focus(), 100);
    } else if (h === 'about-title') {
      const t = document.getElementById('about-title');
      if (t) setTimeout(() => t.focus(), 100);
    } else if (h === 'chefs-title') {
      const t = document.getElementById('chefs-title');
      if (t) setTimeout(() => t.focus(), 100);
    }
  })();
  // ====== Cardápio: busca/filtragem ======
  const $search = $('#menu-search');
  const $clear = $('#menu-clear');
  function filterMenu() {
    const term = ($search.val() || '').toString().trim().toLowerCase();
    const $items = $('#menu [data-item]');
    const $doces = $('#menu-doces');
    const $paes = $('#menu-paes');
    let docesHas = false, paesHas = false;
    if (!term) {
      $items.removeClass('menu-item-hidden');
      // restaura visibilidade conforme aba ativa
      const activeCat = $('.menu-cat-btn.active').data('cat');
      if (activeCat === 'paes') { $doces.attr('hidden',''); $paes.removeAttr('hidden'); }
      else { $paes.attr('hidden',''); $doces.removeAttr('hidden'); }
      return;
    }
    $items.each(function(){
      const $it = $(this);
      const name = ($it.data('name') || '').toString().toLowerCase();
      const match = name.includes(term);
      $it.toggleClass('menu-item-hidden', !match);
      if (match) {
        if ($it.closest('#menu-doces').length) docesHas = true;
        if ($it.closest('#menu-paes').length) paesHas = true;
      }
    });
    // Mostrar categorias que possuem resultados, esconder as sem resultados
    if (docesHas) $doces.removeAttr('hidden'); else $doces.attr('hidden','');
    if (paesHas) $paes.removeAttr('hidden'); else $paes.attr('hidden','');
  }
  $search.on('input', filterMenu);
  $clear.on('click', function(){ $search.val(''); filterMenu(); $search.trigger('blur'); });

  // Alternância de categorias Doces/Pães
  $(document).on('click', '.menu-cat-btn', function(){
    const cat = $(this).data('cat');
    $('.menu-cat-btn').removeClass('active').attr('aria-selected','false');
    $(this).addClass('active').attr('aria-selected','true');
    // alterna as categorias
    if (cat === 'paes') {
      $('#menu-doces').attr('hidden', '');
      $('#menu-paes').removeAttr('hidden');
    } else {
      $('#menu-paes').attr('hidden', '');
      $('#menu-doces').removeAttr('hidden');
    }
  // ao trocar de aba, se houver termo, apenas alterna visibilidade mantendo o filtro
  const term = ($search.val() || '').toString().trim();
  if (term) filterMenu(); else try { $('#menu-clear').trigger('click'); } catch {}
  // Recalcular AOS ao alternar de aba
  try { (AOS.refreshHard ? AOS.refreshHard() : AOS.refresh()); } catch {}
  });

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

  // ====== Acessibilidade: seletor de modo de visão ======
  // Modos: 'tricromatico' (padrão), 'dicromatico' (simulado) e 'acromatico' (PB)
  const visionKey = 'vision_mode';
  const modes = [
    { id: 'tricromatico', label: 'Tricromático' },
    { id: 'dicromatico', label: 'Dicromático' },
    { id: 'acromatico', label: 'Acromático' }
  ];
  const modeDescriptions = {
    tricromatico: 'O mais comum: leve dificuldade em distinguir vermelho, verde e azul e suas tonalidades (anômalo).',
    dicromatico: 'Identifica apenas duas das três cores primárias (vermelho, verde, azul), com confusões mais marcantes.',
    acromatico: 'Mais raro: visão em preto, branco e tons de cinza (ausência de percepção de cores).'
  };

  function applyVisionMode(mode) {
    const body = document.body;
    body.classList.remove('vision-tricromatico', 'vision-dicromatico', 'vision-acromatico');
    // Tricromático é o padrão (sem filtro). Só aplicamos classe para os outros modos.
    if (mode === 'dicromatico') body.classList.add('vision-dicromatico');
    else if (mode === 'acromatico') body.classList.add('vision-acromatico');
    else mode = 'tricromatico';
    try { localStorage.setItem(visionKey, mode); } catch {}
    const btn = document.getElementById('vision-toggle');
    const select = document.getElementById('vision-select');
    if (btn) btn.setAttribute('aria-label', `Modo de visão: ${mode}`);
    if (select && select.value !== mode) select.value = mode;
    const desc = document.getElementById('vision-desc');
    if (desc) {
      desc.textContent = modeDescriptions[mode] || '';
    }
  }

  function ensureVisionControl() {
    if (document.getElementById('vision-toggle')) return; // já inserido
    const wrapper = document.createElement('div');
    wrapper.id = 'vision-widget';
  wrapper.innerHTML = `
      <button id="vision-toggle" title="Acessibilidade de visão" aria-haspopup="true" aria-expanded="false" style="position:fixed;bottom:24px;right:24px;z-index:9999;background:#fff;color:#101D2C;border:2px solid #c69963;border-radius:50%;width:54px;height:54px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:1.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">🌈</button>
      <div id="vision-popover" role="dialog" aria-label="Selecionar modo de visão" style="position:fixed;bottom:86px;right:24px;z-index:9999;background:#ffffff;border:1px solid #c69963;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.18);padding:12px 12px;min-width:220px;display:none;">
        <label for="vision-select" style="display:block;font-weight:600;color:#101D2C;margin-bottom:8px;">Modo de visão</label>
        <select id="vision-select" style="width:100%;height:38px;border:1px solid #c69963;border-radius:8px;padding:0 8px;">
          <option value="tricromatico">Tricromático (padrão)</option>
          <option value="dicromatico">Dicromático (simulado)</option>
          <option value="acromatico">Acromático (P&B)</option>
        </select>
        <p id="vision-desc" aria-live="polite" style="margin:8px 0 0 0;font-size:.9rem;color:#333;max-width:28ch;"></p>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button id="vision-apply" class="menu-btn-sm" style="flex:1;">Aplicar</button>
          <button id="vision-close" class="menu-btn-sm" style="flex:1;">Fechar</button>
        </div>
      </div>`;
    document.body.appendChild(wrapper);

    const toggle = document.getElementById('vision-toggle');
    const pop = document.getElementById('vision-popover');
    const select = document.getElementById('vision-select');
    const applyBtn = document.getElementById('vision-apply');
    const closeBtn = document.getElementById('vision-close');

    toggle.addEventListener('click', () => {
      const show = pop.style.display !== 'block';
      pop.style.display = show ? 'block' : 'none';
      toggle.setAttribute('aria-expanded', show);
      if (show) select.focus();
    });
    function updateDesc() { const d = document.getElementById('vision-desc'); if (d) d.textContent = modeDescriptions[select.value] || ''; }
    select.addEventListener('change', updateDesc);
    applyBtn.addEventListener('click', () => applyVisionMode(select.value));
    closeBtn.addEventListener('click', () => { pop.style.display = 'none'; toggle.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { pop.style.display = 'none'; toggle.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('click', (e) => {
      if (!pop.contains(e.target) && e.target !== toggle) {
        pop.style.display = 'none'; toggle.setAttribute('aria-expanded', 'false');
      }
    });
    // Inicializa descrição baseada no valor selecioando
    updateDesc();
  }

  // Inicializar com preferência salva ou padrão
  try {
    let saved = localStorage.getItem(visionKey) || 'tricromatico';
    if (saved === 'normal') saved = 'tricromatico'; // migração de versão anterior
    applyVisionMode(saved);
  } catch { applyVisionMode('tricromatico'); }
  ensureVisionControl();

  // ====== Acessibilidade: Leitura automática dos Chefs (Tab + Enter) ======
  function ensureLiveRegion() {
    let live = document.getElementById('sr-live-region');
    if (!live) {
      live = document.createElement('div');
      live.id = 'sr-live-region';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      live.style.position = 'absolute';
      live.style.left = '-9999px';
      live.style.width = '1px';
      live.style.height = '1px';
      live.style.overflow = 'hidden';
      document.body.appendChild(live);
    }
    return live;
  }

  function announce(text) {
    const live = ensureLiveRegion();
    // limpa e atualiza para forçar anúncio
    live.textContent = '';
    setTimeout(() => { live.textContent = text; }, 10);
  }

  function speakText(text) {
    const synth = window.speechSynthesis;
    if (!synth) { return; }
    try { synth.cancel(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = 1;
    u.pitch = 1;
    try { synth.speak(u); } catch {}
  }

  // Controle simples para evitar leituras duplicadas imediatas no mesmo elemento
  let lastSpokenEl = null;
  let lastSpokenAt = 0;
  function shouldSpeakFor(el) {
    const now = Date.now();
    if (lastSpokenEl === el && (now - lastSpokenAt) < 800) return false;
    lastSpokenEl = el;
    lastSpokenAt = now;
    return true;
  }

  // Helpers de leitura por seção
  function readChefsSection() {
    const parts = [];
    $('#chefs .card-body').each(function(){
      const name = ($(this).find('h2').text() || '').trim();
      const spec = ($(this).find('h6').text() || '').trim();
      const desc = ($(this).find('p').text() || '').trim();
      if (name) parts.push(`Chef ${name}.`);
      if (spec) parts.push(`${spec}.`);
      if (desc) parts.push(`${desc}`);
    });
    const text = parts.join(' ');
    if (text) { announce(text); speakText(text); }
  }

  function readAboutSection() {
    const parts = ['Nossa História.'];
    const desc = ($('#about').find('p').first().text() || '').trim();
    if (desc) parts.push(desc);
    const text = parts.join(' ');
    if (text) { announce(text); speakText(text); }
  }

  function readInfoHours() {
    const title = (document.getElementById('info-hours-title')?.textContent || 'Horário de Funcionamento').trim();
    const hours = (document.getElementById('info-hours-text')?.textContent || '').trim();
    const text = [title + '.', hours].filter(Boolean).join(' ');
    if (text) { announce(text); speakText(text); }
  }

  function readInfoContact() {
    const title = (document.getElementById('info-contact-title')?.textContent || 'Entre em Contato').trim();
    const phone = (document.getElementById('contact-phone')?.textContent || '').trim();
    const email = (document.getElementById('contact-email')?.textContent || '').trim();
    const text = [title + '.', phone + '.', email + '.'].filter(Boolean).join(' ');
    if (text) { announce(text); speakText(text); }
  }

  $(document).on('keydown', '#chefs-title', function(e){ if (e.key === 'Enter') readChefsSection(); });
  $(document).on('focusin', '#chefs-title', function(){ if (shouldSpeakFor(this)) readChefsSection(); });

  // Leitura automática da seção "Nossa História"
  $(document).on('keydown', '#about-title', function(e){ if (e.key === 'Enter') readAboutSection(); });
  $(document).on('focusin', '#about-title', function(){ if (shouldSpeakFor(this)) readAboutSection(); });

  // Leitura automática: Horário de Funcionamento (Enter no título)
  $(document).on('keydown', '#info-hours-title', function(e){ if (e.key === 'Enter') readInfoHours(); });
  $(document).on('focusin', '#info-hours-title', function(){ if (shouldSpeakFor(this)) readInfoHours(); });

  // Leitura automática: Entre em Contato (Enter no título)
  $(document).on('keydown', '#info-contact-title', function(e){ if (e.key === 'Enter') readInfoContact(); });
  $(document).on('focusin', '#info-contact-title', function(){ if (shouldSpeakFor(this)) readInfoContact(); });

  // Permitir parar a leitura com ESC
  $(document).on('keydown', function(e){
    if (e.key === 'Escape') {
      try { window.speechSynthesis.cancel(); } catch {}
      const live = document.getElementById('sr-live-region');
      if (live) live.textContent = '';
    }
  });

  // ====== Acessibilidade: Enter no link "Cardápio" do cabeçalho vai para Produtos ======
  // Mantemos o clique de mouse rolando para #menu, mas se o usuário navegar por foco (Tab)
  // e pressionar Enter, redirecionamos para a página de produtos.
  $(document).on('keydown', 'a.nav-link[href="#menu"]', function(e){
    if (e.key === 'Enter') {
      e.preventDefault();
      window.location.href = 'produtos.html';
    }
  });

  // ====== Acessibilidade: preservar e restaurar foco com Shift+Tab ======
  let lastNavLinkId = null;
  // Ao clicar em Nossos horários/Contato, marca origem
  $(document).on('click keydown', '#nav-info-hours, #nav-info-contact', function(e){
    // Se for Enter ou clique do mouse, registra
    if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
      lastNavLinkId = this.id;
    }
  });
  function restoreFocusToNav() {
    if (!lastNavLinkId) return;
    const el = document.getElementById(lastNavLinkId);
    if (el) el.focus();
  }
  // No título focado, Shift+Tab retorna para o link do menu que trouxe até aqui
  $(document).on('keydown', '#info-hours-title, #info-contact-title, #about-title, #chefs-title', function(e){
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      restoreFocusToNav();
    }
  });
});

