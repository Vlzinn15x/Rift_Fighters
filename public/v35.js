'use strict';
/* Rift Fighters V35: incremental, offline-safe campaign, adaptive CPU and progression.
   Built on the original V34 game, artwork and engine. No third-party services. */
(() => {
  const el = (id) => document.getElementById(id);
  const STORAGE = 'rift-v35-progress';
  const bosses = [
    {name:'SENTINELA DO TROVÃO', epithet:'O TESTE DA VELOCIDADE', fighter:0, mult:1.28, reward:140, color:'#55ecd5', desc:'Dash relâmpago e pressão em curta distância.'},
    {name:'IMPERATRIZ DAS BRASAS', epithet:'CORAÇÃO INCANDESCENTE', fighter:1, mult:1.42, reward:200, color:'#ff9462', desc:'Projéteis, explosões e zonas de fogo.'},
    {name:'TITÃ DA RUÍNA', epithet:'A ARENA VAI TREMER', fighter:4, mult:1.62, reward:275, color:'#f6cc7b', desc:'Armadura pesada, golpes e terremotos.'},
    {name:'SOMBRA DO ABISMO', epithet:'NÃO HÁ ONDE SE ESCONDER', fighter:7, mult:1.78, reward:370, color:'#c89aff', desc:'Teleporte, ataques rápidos e invocações.'},
    {name:'GUARDIÃO DA FENDA', epithet:'CONFRONTO FINAL', fighter:10, mult:1.95, reward:550, color:'#ffb36b', desc:'Combos com espada, Bankai e especial supremo.'}
  ];
  const auras = [
    {id:'classic', name:'ORIGINAL', color:'#81e5ef', price:0, description:'A energia original da Fenda.'},
    {id:'crimson', name:'CARMESIM', color:'#ff5275', price:140, description:'Rastro vermelho de combate.'},
    {id:'glacier', name:'GLACIAL', color:'#74d7ff', price:220, description:'Círculos de energia azul.'},
    {id:'solar', name:'SOLAR', color:'#ffd16d', price:300, description:'Pulso dourado na arena.'},
    {id:'void', name:'ABISSAL', color:'#c18aff', price:480, description:'Aura violeta das sombras.'}
  ];
  const sanitize = raw => {
    const n = (v,min,max) => Math.max(min,Math.min(max,Number.isFinite(+v)?Math.floor(+v):min));
    const wins = Array.isArray(raw?.bossWins) ? bosses.map((_,i)=>Boolean(raw.bossWins[i])) : bosses.map(()=>false);
    let unlocked = n(raw?.unlocked || 1,1,bosses.length);
    const inferred = wins.reduce((a,v,i)=>v?Math.max(a,Math.min(bosses.length,i+2)):a,1);
    unlocked = Math.max(unlocked,inferred);
    const owned = Array.isArray(raw?.owned) ? raw.owned.filter(id=>auras.some(a=>a.id===id)) : [];
    const equipped=auras.some(a=>a.id===raw?.equipped&&(a.price===0||owned.includes(a.id))) ? raw.equipped : 'classic';
    return {coins:n(raw?.coins,0,1e8),unlocked,bossWins:wins,owned:[...new Set(['classic',...owned])],equipped,
      bestCombo:n(raw?.bestCombo,0,999),totalDamage:n(raw?.totalDamage,0,1e8)};
  };
  let progress;
  try { progress=sanitize(JSON.parse(localStorage.getItem(STORAGE)||'null')); }
  catch { progress=sanitize(null); }
  let bossIndex=-1;
  let bossPendingLaunch=false;
  let postMatchBoss=-1;
  const store = () => { try {localStorage.setItem(STORAGE,JSON.stringify(progress));return true;} catch {return false;} };
  const note = (id, message) => {const target=el(id);if(target)target.textContent=message;};
  const pageHeading = (eyebrow,title,lead) => `<div class="v35-heading"><label>${eyebrow}</label><h1>${title}</h1><p>${lead}</p></div>`;

  // Standalone subpages: old navigation stays intact, including every V34 mode.
  const nav=document.querySelector('.rf-header nav');
  for (const [name,title] of [['bosses','BOSSES'],['shop','LOJA']]) {
    const b=document.createElement('button');b.type='button';b.dataset.page=name;b.textContent=title;
    b.addEventListener('click',()=>showPage(name));nav.append(b);
  }
  const bossPage=document.createElement('section');bossPage.id='v35BossPage';bossPage.className='rf-page hidden v35-page';
  bossPage.innerHTML=pageHeading('CAMPANHA / CINCO DESAFIOS','CAMINHO DOS BOSSES','Enfrente cinco chefões em ordem. Cada vitória abre o próximo desafio e rende moedas.')+
    '<div class="v35-boss-grid" id="v35BossGrid"></div><div class="v35-notice" id="v35BossNotice" role="status" aria-live="polite"></div>';
  const shopPage=document.createElement('section');shopPage.id='v35ShopPage';shopPage.className='rf-page hidden v35-page';
  shopPage.innerHTML=pageHeading('COLEÇÃO / RECOMPENSAS','LOJA DA FENDA','Use moedas de duelos e bosses para adquirir auras visuais. Os 11 lutadores originais continuam disponíveis.')+
    '<div class="v35-wallet">◉ <b id="v35Coins">0</b><small>MOEDAS DA FENDA</small></div><div class="v35-shop-grid" id="v35ShopGrid"></div><p class="v35-notice" id="v35ShopNotice" role="status" aria-live="polite"></p>';
  document.querySelector('main').append(bossPage,shopPage);
  const oldShowPage=showPage;
  showPage=function(page){oldShowPage(page);bossPage.classList.toggle('hidden',page!=='bosses');shopPage.classList.toggle('hidden',page!=='shop');
    if(page==='bosses')paintBosses();if(page==='shop')paintShop();
    nav.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));};
  window.showPage=showPage;
  const homeQuickbar=document.createElement('div');homeQuickbar.className='v35-quickbar';
  document.querySelector('.home-stage').append(homeQuickbar);
  const addHome=(title,page,glyph)=>{const b=document.createElement('button');b.className='v35-quick-link';b.type='button';
    b.innerHTML=`<span aria-hidden="true">${glyph}</span> ${title}`;b.onclick=()=>showPage(page);homeQuickbar.append(b);};
  addHome('BOSSES','bosses','✦');addHome('LOJA','shop','◉');

  const paintBosses=()=>{
    el('v35BossGrid').innerHTML=bosses.map((b,i)=>{
      const accessible=i<progress.unlocked, completed=progress.bossWins[i];
      return `<article class="v35-boss-card ${accessible?'':'v35-locked'}" style="--boss:${b.color}">
      <div class="v35-boss-top"><span>DESAFIO 0${i+1} / 05</span><b>${completed?'VENCIDO ✓':accessible?'DISPONÍVEL':'BLOQUEADO'}</b></div>
      <div class="v35-boss-icon" aria-hidden="true">${['ϟ','♨','◆','◈','✦'][i]}</div><label>${b.epithet}</label><h2>${b.name}</h2><p>${b.desc}</p>
      <div class="v35-boss-end"><span>◉ +${b.reward} MOEDAS / 1ª VITÓRIA</span><button type="button" data-boss="${i}" ${accessible?'':'disabled'}>${accessible?'DESAFIAR →':'VENÇA O ANTERIOR'}</button></div></article>`;
    }).join('');
    bossPage.querySelectorAll('[data-boss]').forEach(b=>b.onclick=()=>startBoss(+b.dataset.boss));
  };
  const paintShop=()=>{
    note('v35Coins',String(progress.coins));
    el('v35ShopGrid').innerHTML=auras.map(a=>{
      const owned=progress.owned.includes(a.id),active=progress.equipped===a.id;
      return `<article class="v35-shop-card" style="--aura:${a.color}"><div class="v35-aura-preview" aria-hidden="true"><i></i><span>✦</span></div>
      <label>VISUAL / SEM BÔNUS DE DANO</label><h2>${a.name}</h2><p>${a.description}</p>
      <button type="button" data-aura="${a.id}" ${active?'disabled':''}>${active?'EQUIPADA ✓':owned?'EQUIPAR':`COMPRAR · ◉ ${a.price}`}</button></article>`;
    }).join('');
    shopPage.querySelectorAll('[data-aura]').forEach(b=>b.onclick=()=>buyAura(b.dataset.aura));
  };
  function buyAura(id){
    const aura=auras.find(a=>a.id===id);if(!aura)return;
    if(!progress.owned.includes(id)){
      if(progress.coins<aura.price){note('v35ShopNotice',`Você precisa de mais ${aura.price-progress.coins} moedas. Conclua duelos ou a campanha.`);return;}
      const snapshot=JSON.stringify(progress);
      progress.coins-=aura.price;progress.owned.push(id);progress.equipped=id;
      if(!store()){progress=sanitize(JSON.parse(snapshot));note('v35ShopNotice','Não foi possível salvar a compra. Confira o armazenamento do navegador.');return;}
      note('v35ShopNotice',`${aura.name} comprada e equipada!`);
    } else {progress.equipped=id;if(!store())note('v35ShopNotice','Aura equipada apenas nesta sessão: armazenamento indisponível.');else note('v35ShopNotice',`${aura.name} equipada.`);}
    paintShop();
  }

  const oldBegin=begin;
  begin=function(){if(!bossPendingLaunch)bossIndex=-1;return oldBegin();};
  const oldNewRound=newRound;
  newRound=function(){oldNewRound();
    if(bossIndex<0||window.training||window.net?.active)return;
    const boss=bosses[bossIndex],enemy=fighters[1];
    enemy.r={...enemy.r,name:boss.name,hp:Math.round(enemy.r.hp*boss.mult),speed:Math.round(enemy.r.speed*(1+.025*bossIndex))};
    enemy.hp=enemy.r.hp;enemy.en=100;enemy.rift=15;enemy.v35Boss=true;enemy.v35Phase=1;enemy.v35Move=0;enemy.v35Think=.45;
    el('matchLabel').textContent=`BOSS 0${bossIndex+1} / ${boss.name}`;
    bossHud.hidden=false;bossHud.querySelector('strong').textContent=boss.name;bossHud.querySelector('small').textContent='FASE 1 / 3';
  };
  const oldRollSolo=rollSolo;
  rollSolo=function(){bossIndex=-1;bossPendingLaunch=false;bossHud.hidden=true;return oldRollSolo();};
  const oldStartTraining=startTraining;
  startTraining=function(){bossIndex=-1;bossPendingLaunch=false;bossHud.hidden=true;return oldStartTraining();};
  const oldMenu=menu;
  menu=function(){const leavingBoss=bossIndex>=0;bossIndex=-1;bossPendingLaunch=false;bossHud.hidden=true;const result=oldMenu();if(leavingBoss&&!window.net?.active)showPage('bosses');return result;};
  function startBoss(i){
    if(!Number.isInteger(i)||i<0||i>=progress.unlocked||i>=bosses.length)return;
    if(!artReady){note('v35BossNotice','A arte ainda está carregando. Tente novamente após a tela inicial.');return;}
    if(window.net?.code){note('v35BossNotice','Saia da sala online para jogar a campanha.');return;}
    bossIndex=i;postMatchBoss=-1;bossPendingLaunch=true;window.training=false;
    el('rival').value=String(bosses[i].fighter);
    begin();bossPendingLaunch=false;
    // begin() invokes newRound(), which already applies the boss modifier.
    banner=`BOSS 0${i+1}: ${bosses[i].name}`;bannerTime=1.7;
  }
  const bossHud=document.createElement('div');bossHud.id='v35BossHud';bossHud.hidden=true;
  bossHud.innerHTML='<span>BATALHA CONTRA CHEFE</span><strong></strong><small>FASE 1 / 3</small><div class="v35-boss-cast" hidden><b>PREPARANDO PODER</b><i></i></div>';
  document.querySelector('#fight .arena').append(bossHud);
  const castDisplay=bossHud.querySelector('.v35-boss-cast');
  function updateBossPhase(enemy,player){
    if(bossIndex<0||!enemy.v35Boss)return;
    const ratio=enemy.hp/enemy.r.hp;
    const phase=ratio<=.27?3:ratio<=.63?2:1;
    if(enemy.v35Phase!==phase){enemy.v35Phase=phase;enemy.en=Math.min(100,enemy.en+22);enemy.rift=Math.min(100,enemy.rift+20);
      spectacle('charge',enemy.x,enemy.y-34,enemy.id,.9,90);
      banner=`FASE ${phase} / ${bosses[bossIndex].name}`;bannerTime=1.25;}
    bossHud.querySelector('small').textContent=`FASE ${phase} / 3 · VIDA ${Math.ceil(Math.max(0,enemy.hp))}`;
    bossHud.style.setProperty('--bossColor',bosses[bossIndex].color);
  }

  // CPU no longer makes a random decision every frame. It plays by distance,
  // configurable reaction time and readable skill wind-ups, and respects cooldowns.
  function aiTick(enemy,player,dt,difficulty){
    if(enemy.hp<=0||player.hp<=0||mode!=='fight'||specialScene)return;
    updateBossPhase(enemy,player);
    const boss=Boolean(enemy.v35Boss),phase=boss?enemy.v35Phase:1;
    const gap=Math.abs(player.x-enemy.x),d=Math.max(.5,Math.min(1.6,Number(difficulty)||1));
    enemy.v35Think=Math.max(0,(enemy.v35Think??.22)-dt);
    enemy.v35Guard=Math.max(0,(enemy.v35Guard||0)-dt);
    const threatened=player.attack>0&&gap<126&&Math.abs(player.y-enemy.y)<95;
    if(threatened&&enemy.v35Think<=0&&Math.random()<(boss?.45+phase*.11:.22*d)){
      enemy.v35Guard=.14+(boss?.08:0);enemy.v35Think=.28/d;
    }
    enemy.guard=enemy.v35Guard>0&&enemy.y===424&&enemy.attack<=0;
    if(enemy.v35Warning){
      enemy.v35Warning.remaining-=dt;
      const warn=enemy.v35Warning;
      if(boss){castDisplay.hidden=false;castDisplay.querySelector('b').textContent=`⚠ ${warn.title.toUpperCase()}`;
        castDisplay.querySelector('i').style.width=Math.max(0,100*warn.remaining/warn.total)+'%';}
      if(enemy.stun>0||enemy.hp<=0){enemy.v35Warning=null;castDisplay.hidden=true;return;}
      if(warn.remaining<=0){enemy.v35Warning=null;castDisplay.hidden=true;enemy.face=player.x>enemy.x?1:-1;cast(enemy,warn.index);enemy.v35Think=(boss?.30:.45)/d;}
      return;
    }
    if(boss){castDisplay.hidden=true;enemy.rift=Math.min(100,enemy.rift+dt*(phase===3?3.5:1.5));}
    const preferred=boss?(phase>=2?83:100):100;
    if(!enemy.guard&&enemy.attack<=0&&enemy.melee<=0){
      const walkSpeed=enemy.r.speed*(boss?.63+phase*.08:.55)*d*(enemy.slow>0?.5:1);
      if(gap>preferred+18)locomote(enemy,enemy.face,walkSpeed,dt);
      else if(gap<preferred-35)locomote(enemy,-enemy.face,walkSpeed*.45,dt);
    }
    if(enemy.v35Think>0||enemy.guard)return;
    if(enemy.rift>=100&&gap<(boss?520:245)&&Math.random()<(boss?.64:.28)){
      if(requestSpecial(enemy)){enemy.v35Think=.85/d;return;}
    }
    const available=enemy.r.skills.map((s,i)=>i).filter(i=>enemy.cd[i]<=0&&enemy.en>=enemy.r.skills[i][4]);
    const skillChance=boss?.75:.45*d;
    if(available.length&&Math.random()<skillChance){
      const skills=available.filter(i=>{
        const type=enemy.r.skills[i][6];return !['impact','daggers','redhook'].includes(type)||gap<155;
      });
      if(skills.length){const skill=skills[Math.floor(Math.random()*skills.length)];
        if(boss){const delay=Math.max(.32,.68-(phase-1)*.1);enemy.v35Warning={index:skill,title:enemy.r.skills[skill][1],remaining:delay,total:delay};
          spectacle('charge',enemy.x,enemy.y-44,enemy.id,delay,80);enemy.v35Think=delay+.2;return;}
        if(cast(enemy,skill)){enemy.v35Think=(.48+Math.random()*.22)/d;return;}
      }
    }
    if(gap<119&&enemy.attack<=0){queueAttack(enemy);enemy.v35Think=(boss?.28:.42)/d;return;}
    if(gap>160&&enemy.dashCd<=0&&Math.random()<(boss?.55:.22))dash(enemy);
    else if(enemy.y>=424&&Math.random()<(boss?.18:.11))enemy.vy=-450;
    enemy.v35Think=(boss?.22:.38)/d;
  }

  const lastResult=recordRiftResult;
  recordRiftResult=function(won){
    if(window.training)return;
    lastResult(won);
    progress.coins=Math.min(1e8,progress.coins+(won?180:60));
    if(bossIndex>=0){
      postMatchBoss=bossIndex;
      if(won){const first=!progress.bossWins[bossIndex];
        if(first){progress.bossWins[bossIndex]=true;progress.coins=Math.min(1e8,progress.coins+bosses[bossIndex].reward);}
        progress.unlocked=Math.max(progress.unlocked,Math.min(bosses.length,bossIndex+2));}
    } else postMatchBoss=-1;
    store();
  };
  window.recordRiftResult=recordRiftResult;
  const oldShow=show;
  show=function(title,message,button){
    if(mode==='over'&&postMatchBoss>=0){
      const won=wins[0]>=2,which=postMatchBoss;
      const reward=won?` +180 moedas pelo duelo${progress.bossWins[which]?' e bônus da primeira vitória, se aplicável':''}.`:' +60 moedas pelo duelo.';
      oldShow(title,message+reward,won&&which<4?'PRÓXIMO BOSS →':won?'VER CAMPANHA →':'TENTAR NOVAMENTE →');
      el('continue').onclick=()=>{if(won&&which===4){menu();showPage('bosses');}
        else startBoss(won?which+1:which);};
      return;
    }
    oldShow(title,message,button);
  };

  // Defeat/win sounds, particles and V34 sprite animation stay unchanged.
  // Add subtle acceleration without changing collision coordinates or frame timing.
  const oldLocomote=locomote;
  locomote=function(f,dir,speed,dt){
    if(!dir||f.stun>0||f.dash>0||activeMelee(f)){f.v35Velocity=0;return oldLocomote(f,dir,speed,dt);}
    const previous=f.v35Velocity||0,target=dir*speed;
    const next=previous+(target-previous)*(1-Math.exp(-25*dt));
    f.v35Velocity=next;
    oldLocomote(f,dir,Math.abs(next),dt);
  };
  const previousHit=hit;
  hit=function(target,damage,source,force=1,handled=false){const before=target.hp;
    const result=previousHit(target,damage,source,force,handled);
    if(source===fighters[0]&&before>target.hp&&!window.net?.active){
      progress.totalDamage=Math.min(1e8,progress.totalDamage+Math.round(before-target.hp));
      if(combo>progress.bestCombo){progress.bestCombo=combo;}
      if(!window.training&&Math.random()<.015)store();
    }
    return result;
  };

  // Cosmetic auras: presentation only, no hitbox or damage advantages.
  const previousDrawAuras=drawAuras;
  drawAuras=function(t){previousDrawAuras(t);if(mode!=='fight'||progress.equipped==='classic'||!fighters[0])return;
    const a=auras.find(x=>x.id===progress.equipped),f=fighters[0];if(!a)return;
    c.save();c.translate(f.x,f.y-7);c.scale(1,renderRatio);
    const r=21+Math.sin(t*4)*2;c.globalAlpha=.18+Math.sin(t*2)*.05;
    c.strokeStyle=a.color;c.lineWidth=3;c.beginPath();c.ellipse(0,0,r,6,0,0,Math.PI*2);c.stroke();
    for(let i=0;i<5;i++){const alpha=t*2+i*Math.PI*2/5;c.fillStyle=a.color;c.fillRect(Math.round(Math.cos(alpha)*r),Math.round(-16-Math.abs(Math.sin(alpha))*30),3,4);}
    c.restore();
  };

  // Mobile quick heavy: same K action as keyboard, with reliable pointer release.
  const actionPad=document.querySelector('.action-pad');
  if(actionPad){const heavy=document.createElement('button');heavy.className='v35-heavy';heavy.type='button';heavy.innerHTML='<b>✦</b><small>PESADO</small>';heavy.setAttribute('aria-label','Ataque pesado');
    heavy.addEventListener('pointerdown',e=>{e.preventDefault();heavy.classList.add('holding');input('k',true);if(heavy.setPointerCapture)heavy.setPointerCapture(e.pointerId);});
    const release=e=>{if(e)e.preventDefault();heavy.classList.remove('holding');input('k',false);};
    for(const evt of ['pointerup','pointercancel','lostpointercapture'])heavy.addEventListener(evt,release);
    actionPad.append(heavy);
  }
  // Fast touch taps on skill buttons remain native click events; no extra on-screen overlays.
  document.querySelector('#fight .battle-tip').append(' · K / ✦: PESADO');

  // Downloadable save backup for moves between domains/browsers.
  const backupBox=document.createElement('div');backupBox.className='v35-backup';
  backupBox.innerHTML='<h3>PROGRESSO E BACKUP</h3><p>Seu progresso fica neste navegador. Exporte um backup antes de mudar de domínio ou aparelho.</p><div class="v35-backup-actions"><button type="button" id="v35SaveExport">↓ BAIXAR SAVE</button><label for="v35SaveImport">↑ IMPORTAR SAVE</label><input type="file" id="v35SaveImport" accept="application/json,.json" hidden></div><small role="status" id="v35SaveNotice"></small><p id="v35Records"></p>';
  document.querySelector('#profilePage .profile-grid').after(backupBox);
  const cleanProfile = p => ({xp:Math.max(0,Math.min(1e8,Math.floor(Number(p?.xp)||0))),matches:Math.max(0,Math.min(1e7,Math.floor(Number(p?.matches)||0))),wins:Math.max(0,Math.min(1e7,Math.floor(Number(p?.wins)||0))),selected:Math.max(0,Math.min(roster.length-1,Math.floor(Number(p?.selected)||0))),day:typeof p?.day==='string'?p.day.slice(0,20):'',daily:Math.max(0,Math.min(1000,Math.floor(Number(p?.daily)||0)))});
  const exportBtn=el('v35SaveExport');
  exportBtn.onclick=()=>{
    const payload={format:'RIFT-FIGHTERS-SAVE',version:35,created:new Date().toISOString(),playerName,
      profile:cleanProfile(profile),progress,upgrades:upgradeState};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='rift-fighters-save-v35.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    note('v35SaveNotice','Backup preparado. Guarde o JSON em lugar seguro.');
  };
  el('v35SaveImport').onchange=async ev=>{
    const file=ev.target.files?.[0];if(!file)return;
    if(file.size>300000){note('v35SaveNotice','Arquivo muito grande para um save do jogo.');return;}
    try{
      const payload=JSON.parse(await file.text());
      if(payload?.format!=='RIFT-FIGHTERS-SAVE'||payload.version!==35)throw Error('Formato incompatível.');
      const nextProfile=cleanProfile(payload.profile),nextProgress=sanitize(payload.progress);
      const nextUpgrades=cleanUpgradeState(payload.upgrades);
      const backup={profile,progress,upgradeState,playerName};
      profile=nextProfile;progress=nextProgress;upgradeState=nextUpgrades;
      playerName=String(payload.playerName||'LUTADOR').trim().slice(0,20)||'LUTADOR';
      try{saveProfile();persistUpgrades();if(!store())throw Error('Sem espaço para salvar.');localStorage.setItem('dojo-name',playerName);}
      catch(e){({profile,progress,upgradeState,playerName}=backup);throw e;}
      select(profile.selected);refreshProfile();paintBosses();paintShop();paintRecords();
      note('v35SaveNotice','Save importado. Seu nome, progresso, upgrades e moedas foram restaurados.');
    }catch(e){note('v35SaveNotice','Não foi possível importar: '+(e.message||'arquivo inválido'));}
    ev.target.value='';
  };
  function paintRecords(){note('v35Records',`◉ ${progress.coins} moedas · ${progress.bossWins.filter(Boolean).length}/5 bosses derrotados · melhor combo: ${progress.bestCombo} hits · ${progress.totalDamage} de dano registrado`);}
  const previousRefresh=refreshProfile;
  refreshProfile=function(){previousRefresh();paintRecords();};
  paintBosses();paintShop();paintRecords();
  window.RiftV35={aiTick,getProgress:()=>JSON.parse(JSON.stringify(progress)),getBosses:()=>bosses.map(b=>({...b})),startBoss,paintBosses,paintShop};
})();
