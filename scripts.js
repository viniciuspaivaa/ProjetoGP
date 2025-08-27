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
    if (h === 'produtos-title') {
      const t = document.getElementById('produtos-title');
      if (t) setTimeout(() => t.focus(), 0);
    }
  });

  // Também ao carregar a página já com hash
  (function focusFromInitialHash(){
    // Se viemos do botão "Voltar à página inicial", focar diretamente no nav-home
    try {
      const flag = sessionStorage.getItem('focus_nav_home');
      if (flag === '1') {
        sessionStorage.removeItem('focus_nav_home');
        const homeLink = document.getElementById('nav-home');
        if (homeLink) setTimeout(() => homeLink.focus(), 120);
      }
    } catch {}
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
    } else if (h === 'produtos-title') {
      const t = document.getElementById('produtos-title');
      if (t) setTimeout(() => t.focus(), 100);
    }
  })();
  // Marcar intenção de focar a Home ao clicar no link de retorno
  $(document).on('click keydown', 'section[aria-label="Voltar à página inicial"] a[href="index.html#home"]', function(e){
    if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
      try { sessionStorage.setItem('focus_nav_home', '1'); } catch {}
    }
  });

  // Leitor de tela ao focar o link "Voltar à página inicial"
  $(document).on('focusin', 'section[aria-label="Voltar à página inicial"] a[href="index.html#home"]', function(){
    if (shouldSpeakFor(this)) {
  const msg = 'Voltar à página inicial. Pressione Enter para voltar para a página inicial.';
      announce(msg);
      speakText(msg);
    }
  });

  // Shift+Tab no link "Voltar" retorna para a barra de pesquisa
  $(document).on('keydown', 'section[aria-label="Voltar à página inicial"] a[href="index.html#home"]', function(e){
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const search = document.getElementById('menu-search');
      if (search) {
        search.focus();
        const msg = 'Retornando para a barra de pesquisa.';
        announce(msg);
        speakText(msg);
      }
    }
  });
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
  // Atualiza visibilidade/tabulação do botão Limpar conforme conteúdo da busca
  function updateClearFocusable() {
    const term = ($search.val() || '').toString().trim();
    if (term) {
      $clear.attr('tabindex', 0).removeAttr('aria-disabled');
    } else {
      $clear.attr('tabindex', -1).attr('aria-disabled', 'true');
    }
  }

  $search.on('input', function(){ filterMenu(); updateClearFocusable(); });
  $clear.on('click', function(){
    $search.val('');
    filterMenu();
    updateClearFocusable();
    // Feedback auditivo e foco de volta na busca
    const msg = 'Pesquisa limpa. Digite para pesquisar novamente.';
    announce(msg);
    speakText(msg);
    setTimeout(() => $search.focus(), 0);
  });
  // Anúncio ao focar o botão Limpar
  $(document).on('focusin', '#menu-clear', function(){
    if (shouldSpeakFor(this)) {
      const msg = 'Limpar a barra de pesquisa. Pressione Enter para limpar.';
      announce(msg);
      speakText(msg);
    }
  });
  // Inicializa estado do botão Limpar
  updateClearFocusable();

  // Acessibilidade: leitor na barra de pesquisa e leitura do primeiro item ao pressionar Enter
  $(document).on('focusin', '#menu-search', function(){
    if (shouldSpeakFor(this)) {
      const msg = 'Barra de pesquisa, deseja pesquisar algum produto? Apenas digite.';
      announce(msg);
      speakText(msg);
    }
  });

  function focusAndReadFirstVisibleProduct(preferredCat) {
    // Montar ordem de categorias a tentar
    const visibleCats = [];
    if (!$('#menu-doces').is('[hidden]')) visibleCats.push('doces');
    if (!$('#menu-paes').is('[hidden]')) visibleCats.push('paes');
    let order = [];
    const activeCat = preferredCat || ($('.menu-cat-btn.active').data('cat') || getActiveCategoryId());
    if (visibleCats.includes(activeCat)) order.push(activeCat);
    order = order.concat(visibleCats.filter(c => !order.includes(c)));
    if (!order.length) order = [activeCat];

    for (let i = 0; i < order.length; i++) {
      const cat = order[i];
      const $container = getCategoryContainer(cat);
      if (!$container.length) continue;
      const $item = $container.find('[data-item]:not(.menu-item-hidden)').first();
      if (!$item.length) continue;
      // Tentar clicar no botão "Ler texto"
      let $btn = $item.find('.btn').filter(function(){
        return ($(this).text() || '').trim().toLowerCase().startsWith('ler texto');
      }).first();
      if (!$btn.length) $btn = $item.find('.btn').first();
      if ($btn.length) {
        $btn.focus();
        try { window.speechSynthesis.cancel(); } catch {}
        setTimeout(() => { try { $btn.trigger('click'); } catch {} }, 60);
        return true;
      }
      // Fallback: título
      const $title = $item.find('h2').first();
      if ($title.length) {
        $title.attr('tabindex', 0).focus();
        try { window.speechSynthesis.cancel(); } catch {}
        speakCardDetailsFromEl($title.get(0));
        return true;
      }
    }
    return false;
  }

  $(document).on('keydown', '#menu-search', function(e){
    if (e.key === 'Enter') {
      e.preventDefault();
      // Aplicar filtro atual e ler o primeiro item disponível
      filterMenu();
      // Evitar redirecionamentos de Tab automáticos configurados por seleção de categoria
      try { window.__pendingFocusToFirstProduct = false; window.__autoReadFirst = false; } catch {}
      const ok = focusAndReadFirstVisibleProduct();
      if (!ok) {
        const msg = 'Nenhum produto encontrado para sua pesquisa.';
        announce(msg);
        speakText(msg);
      }
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Se a busca estiver vazia, pular diretamente para "Voltar à página inicial"
      const term = ($search.val() || '').toString().trim();
      if (!term) {
        e.preventDefault();
        const backLink = document.querySelector('section[aria-label="Voltar à página inicial"] a[href="index.html#home"]')
          || document.querySelector('a[href="index.html#home"]');
        if (backLink) {
          backLink.focus();
        }
      }
    }
  });

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
  // Marcar que o próximo Tab deve ir ao primeiro produto da categoria
  try {
    window.__lastSelectedCat = cat;
    window.__pendingFocusToFirstProduct = true;
    window.__autoReadFirst = true;
    window.__firstProductBtn = null;
  } catch {}

  // Leitura imediata do primeiro produto da categoria selecionada
  // Pequeno atraso para garantir DOM atualizado e AOS recalculado
  setTimeout(() => {
    try {
      const activeCat = cat;
      // Tentar focar o botão "Ler texto" do primeiro card
      let first = focusFirstProductBtn(activeCat);
      if (first) {
        // Evitar auto-read duplicado do handler de foco
        window.__autoReadFirst = false;
        window.__firstProductBtn = first;
        try { window.speechSynthesis.cancel(); } catch {}
        // Acionar a leitura imediatamente
        setTimeout(() => { try { first.click(); } catch {} }, 50);
        // Já direcionamos o foco manualmente, não precisamos do Tab especial
        window.__pendingFocusToFirstProduct = false;
        return;
      }
      // Fallback: sem botão de leitura, focar o primeiro título e falar os detalhes
      first = focusFirstProduct(activeCat);
      if (first) {
        window.__pendingFocusToFirstProduct = false;
        try { window.speechSynthesis.cancel(); } catch {}
        speakCardDetailsFromEl(first);
      }
    } catch {}
  }, 250);
  });

  // Selecionar categoria com Enter ou Espaço
  $(document).on('keydown', '.menu-cat-btn', function(e){
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
    // Shift+Tab: volta para o tab anterior
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const $tabs = $('.menu-cat-btn');
      const idx = $tabs.index(this);
      let prevIdx = idx - 1;
      if (prevIdx < 0) prevIdx = $tabs.length - 1;
      $tabs.eq(prevIdx).focus();
    }
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

  // ====== Acessibilidade: Controle do Leitor de Voz (ícone semelhante ao de visão) ======
  const voiceKey = 'voice_reader_enabled';
  function isVoiceEnabled() {
    try {
      const v = localStorage.getItem(voiceKey);
  // Desativado por padrão quando ainda não há preferência salva
  return v === null ? false : v === '1';
    } catch { return true; }
  }
  function setVoiceEnabled(on) {
    try { localStorage.setItem(voiceKey, on ? '1' : '0'); } catch {}
    const btn = document.getElementById('voice-toggle');
    if (btn) btn.setAttribute('aria-label', `Leitor de voz: ${on ? 'ativado' : 'desativado'}`);
    const status = document.getElementById('voice-status');
    if (status) status.textContent = on ? 'Ativado' : 'Desativado';
    if (!on) { try { window.speechSynthesis.cancel(); } catch {} }
  }
  function ensureVoiceControl() {
    if (document.getElementById('voice-toggle')) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'voice-widget';
    wrapper.innerHTML = `
      <button id=\"voice-toggle\" title=\"Leitor de voz\" aria-haspopup=\"true\" aria-expanded=\"false\" style=\"position:fixed;bottom:24px;right:90px;z-index:9999;background:#fff;color:#101D2C;border:2px solid #c69963;border-radius:50%;width:54px;height:54px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:1.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;\">🔊</button>
      <div id=\"voice-popover\" role=\"dialog\" aria-label=\"Configurações do leitor de voz\" style=\"position:fixed;bottom:86px;right:90px;z-index:9999;background:#ffffff;border:1px solid #c69963;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.18);padding:12px 12px;min-width:240px;display:none;\">
        <h4 style=\"margin:4px 0 8px 0;font-size:1rem;color:#101D2C;\">Leitor de voz</h4>
        <p id=\"voice-desc\" style=\"margin:0 0 8px 0;font-size:.9rem;color:#333;\">Ative a fala por voz ao navegar. Não afeta leitores de tela.</p>
        <p style=\"margin:0 0 10px 0;\">Status: <strong id=\"voice-status\"></strong></p>
        <div style=\"display:flex;gap:8px;\">
          <button id=\"voice-enable\" class=\"menu-btn-sm\" style=\"flex:1;\">Ativar</button>
          <button id=\"voice-disable\" class=\"menu-btn-sm\" style=\"flex:1;\">Desativar</button>
          <button id=\"voice-close\" class=\"menu-btn-sm\" style=\"flex:1;\">Fechar</button>
        </div>
      </div>`;
    document.body.appendChild(wrapper);

    const toggle = document.getElementById('voice-toggle');
    const pop = document.getElementById('voice-popover');
    const enableBtn = document.getElementById('voice-enable');
    const disableBtn = document.getElementById('voice-disable');
    const closeBtn = document.getElementById('voice-close');

    // Inicializa estado visual/aria
    setVoiceEnabled(isVoiceEnabled());

    toggle.addEventListener('click', () => {
      const show = pop.style.display !== 'block';
      pop.style.display = show ? 'block' : 'none';
      toggle.setAttribute('aria-expanded', show);
      if (show) enableBtn.focus();
    });
    enableBtn.addEventListener('click', () => {
      setVoiceEnabled(true);
      // Apresentação do guia Ronaldo ao ativar
      announce('Leitor de voz ativado.');
      speakText('Olá, eu sou o Ronaldo, seu guia de voz. Vou ler instruções e conteúdos para facilitar sua navegação. Para parar uma fala, pressione ESC.');
    });
    disableBtn.addEventListener('click', () => {
      setVoiceEnabled(false);
      announce('Leitor de voz desativado.');
      // speakText ficará silenciado após desativar
    });
    closeBtn.addEventListener('click', () => {
      pop.style.display = 'none';
      toggle.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { pop.style.display = 'none'; toggle.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('click', (e) => {
      if (!pop.contains(e.target) && e.target !== toggle) {
        pop.style.display = 'none'; toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  // Inicializar controle do leitor de voz
  ensureVoiceControl();

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
    // Respeita o estado do leitor de voz
    if (!isVoiceEnabled()) { return; }
    try { synth.cancel(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = 1;
    u.pitch = 1;
    // Força a voz pt-BR se disponível
    const voices = synth.getVoices();
    const ptVoice = voices.find(v => v.lang === 'pt-BR');
    if (ptVoice) u.voice = ptVoice;
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

  // ====== Leitura automática: itens do menu de navegação ao receber foco ======
  function readNavItem(el) {
    const label = (el?.textContent || '').trim();
    if (!label) return;
  const isHome = (el && el.id === 'nav-home') || label.toLowerCase() === 'página inicial';
  const text = isHome ? `${label}.` : `${label}. Pressione Enter para ir para ${label.toLowerCase()}.`;
    announce(text);
    speakText(text);
  }

  $(document).on('focusin', 'nav .nav-link', function(){
    if (shouldSpeakFor(this)) readNavItem(this);
  });

  // Após selecionar categoria, enviar o próximo Tab para o primeiro produto
  function focusFirstProductBtn(cat) {
    const containerId = cat === 'paes' ? '#menu-paes' : '#menu-doces';
    const $container = $(containerId);
    if (!$container.length || $container.is('[hidden]')) return null;
    // Preferir o botão "Ler texto" do primeiro card
    let $btn = $container.find('.card-produto .btn').filter(function(){
      return ($(this).text() || '').trim().toLowerCase().startsWith('ler texto');
    }).first();
    if (!$btn.length) $btn = $container.find('.card-produto .btn').first();
    if ($btn.length) { $btn.focus(); return $btn.get(0); }
    return null;
  }
  $(document).on('keydown', '.menu-cat-btn', function(e){
    if (e.key === 'Tab' && !e.shiftKey && window.__pendingFocusToFirstProduct) {
      const isActive = $(this).hasClass('active') || $(this).attr('aria-selected') === 'true';
      if (isActive) {
        e.preventDefault();
        const cat = window.__lastSelectedCat || $(this).data('cat');
  const first = focusFirstProductBtn(cat);
  try { window.__firstProductBtn = first || window.__firstProductBtn; } catch {}
        window.__pendingFocusToFirstProduct = false;
      }
    }
  });

  // Ao focar o botão "Ler texto" de um card, anunciar nome e instrução
  $(document).on('focusin', '.card-produto .btn', function(){
    const label = ($(this).text() || '').trim().toLowerCase();
    if (!label.startsWith('ler texto')) return; // apenas no botão de leitura
    const $card = $(this).closest('.card-produto');
    const name = ($card.find('h2').first().text() || '').trim();
    if (!name) return;
    if (shouldSpeakFor(this)) {
      const text = `${name}. Gostaria de saber os detalhes do produto? Pressione Enter para ouvir os detalhes.`;
      announce(text);
      speakText(text);
    }
    // Se veio de uma seleção de categoria, aciona leitura automática após breve pausa
    try {
      if (window.__autoReadFirst && this === window.__firstProductBtn) {
        clearTimeout(window.__autoReadTimeout);
        window.__autoReadTimeout = setTimeout(() => {
          if (document.activeElement === this) { this.click(); }
          window.__autoReadFirst = false;
        }, 1200);
      }
    } catch {}
  });

  $(document).on('focusout', '.card-produto .btn', function(){ try { clearTimeout(window.__autoReadTimeout); } catch {} });

  // Quando estiver no último produto e pressionar Tab, voltar para as categorias
  $(document).on('keydown', '.card-produto .btn, .card-produto h2[tabindex="0"]', function(e){
    if (e.key === 'Tab' && !e.shiftKey) {
      // Se for botão, só consideramos o de "Ler texto"
      if (this.matches('.btn')) {
        const label = (this.textContent || '').trim().toLowerCase();
        if (!label.startsWith('ler texto')) return; // ignora outros botões (ex.: Vídeo)
      }
      const cat = getActiveCategoryId();
      const { list } = ensureProductFocusables(cat);
      if (list.length && this === list.last().get(0)) {
        e.preventDefault();
        const firstCat = document.querySelector('.menu-cats-inner .menu-cat-btn');
        if (firstCat) {
          firstCat.focus();
          announce('Retornando às categorias.');
          speakText('Retornando às categorias.');
        }
      }
    }
  });

  // Loop de foco no menu: Tab no último volta ao primeiro; Shift+Tab no primeiro volta ao último
  $(document).on('keydown', '#nav-find-store', function(e){
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const first = document.getElementById('nav-home');
      if (first) first.focus();
    }
  });
  $(document).on('keydown', '#nav-home', function(e){
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const last = document.getElementById('nav-find-store');
      if (last) last.focus();
    }
  });

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

  function readProdutosTitle() {
    const title = (document.getElementById('produtos-title')?.textContent || '').trim();
    if (!title) return;
  const text = `${title}. Qual você gostaria de experimentar hoje? Doces ou Pães? Pressione Tab para navegar pelos filtros e produtos.`;
    announce(text);
    speakText(text);
  }

  // ====== Produtos: utilitários de foco e leitura ======
  function getActiveCategoryId() {
    if ($('#menu-paes').length && !$('#menu-paes').is('[hidden]')) return 'paes';
    return 'doces';
  }
  function getCategoryContainer(cat) {
    return cat === 'paes' ? $('#menu-paes') : $('#menu-doces');
  }
  function ensureProductFocusables(cat) {
    const $container = getCategoryContainer(cat);
    if (!$container.length) return { list: $(), type: 'none' };
    // Preferir botões "Ler texto"
    let $list = $container.find('.card-produto .btn').filter(function(){
      return ($(this).text() || '').trim().toLowerCase().startsWith('ler texto');
    });
    if ($list.length) return { list: $list, type: 'button' };
    // Fallback: tornar títulos focáveis
    const $titles = $container.find('.card-produto h2');
    $titles.attr('tabindex', 0);
    return { list: $titles, type: 'title' };
  }
  function focusFirstProduct(cat) {
    const { list } = ensureProductFocusables(cat);
    const $first = list.first();
    if ($first.length) { $first.focus(); return $first.get(0); }
    return null;
  }
  function speakCardDetailsFromEl(el) {
    const $card = $(el).closest('.card-produto');
    if (!$card.length) return;
    const name = ($card.find('h2').first().text() || '').trim();
    const price = ($card.find('h6').first().text() || '').trim();
    const desc = ($card.find('p').first().text() || '').trim();
    const datas = ($card.find('.datas').text() || '').trim();
    const parts = [];
    if (name) parts.push(name + '.');
    if (price) parts.push(price + '.');
    if (desc) parts.push(desc);
    if (datas) parts.push(datas);
    const text = parts.join(' ');
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

  // Leitura automática: título da página de produtos
  $(document).on('keydown', '#produtos-title', function(e){ if (e.key === 'Enter') readProdutosTitle(); });
  $(document).on('focusin', '#produtos-title', function(){ if (shouldSpeakFor(this)) readProdutosTitle(); });

  // Leitor nas abas Doces / Pães (foco e seleção)
  function readCategoryFocus(el){
    const label = (el?.textContent || '').trim();
    if (!label) return;
    const text = `Categoria: ${label}. Pressione Enter para selecionar.`;
    announce(text);
    speakText(text);
  }
  function readCategorySelected(){
    const $active = $('.menu-cat-btn.active');
    const label = ($active.text() || '').trim();
    if (!label) return;
    const text = `Categoria selecionada: ${label}.`;
    announce(text);
    speakText(text);
  }
  $(document).on('focusin', '.menu-cat-btn', function(){ if (shouldSpeakFor(this)) readCategoryFocus(this); });
  $(document).on('click', '.menu-cat-btn', function(){ setTimeout(readCategorySelected, 0); });

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
  window.location.href = 'produtos.html#produtos-title';
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

