'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const storeKey = 'rift-settings-v34';
  const defaults = { sound: true, effects: 'epic', reducedMotion: false };
  let settings = { ...defaults };
  try { settings = { ...defaults, ...JSON.parse(localStorage.getItem(storeKey) || '{}') }; } catch (_) {}

  const launcher = document.querySelector('.menu-settings');
  if (!launcher) return;

  const overlay = document.createElement('div');
  overlay.className = 'rf-settings-overlay';
  overlay.id = 'rfSettingsOverlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <section class="rf-settings-panel" role="dialog" aria-modal="true" aria-labelledby="rfSettingsTitle" aria-describedby="rfSettingsHint">
      <button class="rf-settings-close" type="button" aria-label="Fechar configurações">×</button>
      <div class="rf-settings-kicker">RIFT FIGHTERS / SISTEMA</div>
      <h2 id="rfSettingsTitle">CONFIGURAÇÕES</h2>
      <p id="rfSettingsHint">Ajuste a experiência da arena. Suas preferências ficam salvas neste aparelho.</p>
      <div class="rf-setting-row"><div><b>ÁUDIO DO JOGO</b><small>Música e efeitos sonoros</small></div><button type="button" data-setting="sound" class="rf-setting-toggle"></button></div>
      <div class="rf-setting-row"><div><b>EFEITOS VISUAIS</b><small>Intensidade das partículas e brilhos</small></div><button type="button" data-setting="effects" class="rf-setting-toggle"></button></div>
      <div class="rf-setting-row"><div><b>ANIMAÇÕES REDUZIDAS</b><small>Menos movimento nos menus</small></div><button type="button" data-setting="motion" class="rf-setting-toggle"></button></div>
      <div class="rf-settings-actions"><button type="button" class="rf-settings-fullscreen">⛶ TELA CHEIA</button><button type="button" class="rf-settings-reset">RESTAURAR PADRÕES</button></div>
      <div class="rf-settings-controls"><b>ATALHOS DE COMBATE</b><span><kbd>A</kbd> <kbd>D</kbd> mover</span><span><kbd>W</kbd> pular · <kbd>S</kbd> defender</span><span><kbd>Z</kbd> <kbd>X</kbd> <kbd>C</kbd> poderes · <kbd>V</kbd> especial</span><span><kbd>SHIFT</kbd> dash · <kbd>ESC</kbd> pausar</span></div>
      <small class="rf-settings-status" role="status" aria-live="polite"></small>
    </section>`;
  document.body.appendChild(overlay);

  const soundButton = $('sound');
  const effectsButton = $('effectsToggle');
  const soundHandler = soundButton?.onclick;
  const effectsHandler = effectsButton?.onclick;
  const status = overlay.querySelector('.rf-settings-status');
  const soundControl = overlay.querySelector('[data-setting="sound"]');
  const effectsControl = overlay.querySelector('[data-setting="effects"]');
  const motionControl = overlay.querySelector('[data-setting="motion"]');

  function save() { try { localStorage.setItem(storeKey, JSON.stringify(settings)); } catch (_) {} }
  function paint() {
    muted = !settings.sound;
    vfxIntensity = settings.effects === 'epic' ? 1 : .55;
    if (soundButton) soundButton.textContent = '♪ SOM ' + (settings.sound ? 'ON' : 'OFF');
    if (effectsButton) effectsButton.textContent = settings.effects === 'epic' ? '✦ EFEITOS: ÉPICO' : '✦ EFEITOS: LEVE';
    document.body.classList.toggle('rf-reduce-motion', settings.reducedMotion);
    soundControl.textContent = settings.sound ? 'LIGADO' : 'DESLIGADO';
    soundControl.setAttribute('aria-pressed', String(settings.sound));
    effectsControl.textContent = settings.effects === 'epic' ? 'ÉPICO' : 'LEVE';
    effectsControl.setAttribute('aria-pressed', String(settings.effects === 'epic'));
    motionControl.textContent = settings.reducedMotion ? 'LIGADO' : 'DESLIGADO';
    motionControl.setAttribute('aria-pressed', String(settings.reducedMotion));
    launcher.textContent = '⚙ CONFIGURAÇÕES';
  }
  function open() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.querySelector('.rf-settings-close').focus();
  }
  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    launcher.focus();
  }

  launcher.textContent = '⚙ CONFIGURAÇÕES';
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-controls', 'rfSettingsOverlay');
  launcher.onclick = open;
  overlay.querySelector('.rf-settings-close').onclick = close;
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('is-open')) { event.preventDefault(); close(); }
  });

  soundControl.onclick = () => {
    settings.sound = !settings.sound;
    if (soundHandler) soundHandler.call(soundButton);
    save(); paint(); status.textContent = 'Áudio atualizado.';
  };
  effectsControl.onclick = () => {
    settings.effects = settings.effects === 'epic' ? 'light' : 'epic';
    if (effectsHandler) effectsHandler.call(effectsButton);
    save(); paint(); status.textContent = 'Efeitos visuais atualizados.';
  };
  motionControl.onclick = () => {
    settings.reducedMotion = !settings.reducedMotion;
    save(); paint(); status.textContent = 'Preferência de animação atualizada.';
  };
  overlay.querySelector('.rf-settings-fullscreen').onclick = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else if (document.exitFullscreen) await document.exitFullscreen();
      status.textContent = document.fullscreenElement ? 'Tela cheia ativada.' : 'Tela cheia desativada.';
    } catch (_) { status.textContent = 'Seu navegador não permitiu a tela cheia. Tente pelo menu do navegador.'; }
  };
  overlay.querySelector('.rf-settings-reset').onclick = () => {
    settings = { ...defaults }; save(); paint(); status.textContent = 'Configurações restauradas.';
  };

  if (soundButton) soundButton.onclick = () => {
    if (soundHandler) soundHandler.call(soundButton);
    settings.sound = !muted; save(); paint();
  };
  if (effectsButton) effectsButton.onclick = () => {
    if (effectsHandler) effectsHandler.call(effectsButton);
    settings.effects = vfxIntensity === 1 ? 'epic' : 'light'; save(); paint();
  };
  paint();
})();
