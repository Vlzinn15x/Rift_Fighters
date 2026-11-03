// Pages only hosts files; online rooms require the Worker + D1 deployment.
if(window.RIFT_HOSTING_MODE==='static'){
 const note=document.createElement('p');note.setAttribute('role','status');note.style.cssText='color:#baff73;padding:10px;font:12px Arial';note.textContent='GitHub Pages: solo e treinamento. Para salas online, publique a versão completa na Cloudflare (instruções no README).';document.getElementById('onlineLobby').appendChild(note);
 for(const id of ['createRoom','joinRoom','readyRoom']){const button=document.getElementById(id);button.disabled=true;button.title='Salas online exigem o servidor Cloudflare.';}
 document.getElementById('joinCode').disabled=true;
}
