(() => {
'use strict';
const data=window.PORTFOLIO,grid=document.querySelector('#project-grid'),dialog=document.querySelector('#project-dialog'),player=document.querySelector('#project-video');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let lang='en',index=0,opener=null;
try{lang=localStorage.getItem('kim-portfolio-language')==='id'?'id':'en';}catch{}
const cards=new Map();
const titles={'mysterious-figure':'Mysterious Silhouette','people-group':'People Group',calendar:'Calendar','id-card':'ID Card',monitor:'Monitor',trophy:'Trophy','piggy-bank':'Piggy Bank','rotation-360':'360Â° Rotation',cube:'Cube',laurel:'Laurel','hundred-people':'100 People','empty-battery':'Low Battery','clock-24h':'24-Hour Clock'};
const copy={en:{skip:'Skip to work',workNav:'Work',aboutNav:'About',introKicker:'Motion design & visual experiments',introTitle:'Made to move.',introNote:'A collection of my animations,<br>small ideas, and things in progress.',selected:'Selected work',hoverHint:'Hover to preview. Click to watch.',aboutTitle:'A little about me.',aboutLead:"Hi, I'm Hakim. I like making<br>simple things feel alive.",aboutText:'I started out in photography and videography. Now I’m exploring animation and motion design, finding new ways to bring ideas to life.',contactIntro:'Have something in mind?',contactTitle:"Let's make it move.",sayHello:'Say hello on Instagram',backTop:'Back to top',close:'Close',previous:'Previous',next:'Next',videoError:'The video could not be played.',openFile:'Open video file',watch:'Watch video',play:'Play',still:'Still from',mainNav:'Main navigation'},id:{skip:'Langsung ke karya',workNav:'Karya',aboutNav:'Tentang',introKicker:'Motion design & eksplorasi visual',introTitle:'Dibuat untuk bergerak.',introNote:'Kumpulan animasi, ide kecil,<br>dan karya yang terus berkembang.',selected:'Pilihan karya',hoverHint:'Arahkan kursor untuk preview. Klik untuk menonton.',aboutTitle:'Sedikit tentangku.',aboutLead:'Hai, aku Hakim. Aku suka membuat<br>bentuk sederhana terasa hidup.',aboutText:'Aku berawal dari fotografi dan videografi. Sekarang, aku mengeksplorasi animasi dan motion design, mencari cara baru untuk menghidupkan ide.',contactIntro:'Ada ide yang ingin diwujudkan?',contactTitle:'Ayo buat jadi bergerak.',sayHello:'Sapa aku di Instagram',backTop:'Kembali ke atas',close:'Tutup',previous:'Sebelumnya',next:'Berikutnya',videoError:'Video belum dapat diputar.',openFile:'Buka file video',watch:'Tonton video',play:'Putar',still:'Cuplikan',mainNav:'Navigasi utama'}};
const tr=k=>copy[lang][k],title=p=>lang==='en'?titles[p.id]||p.title:p.title;
const time=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};

let motionPaused=reduced.matches,reelVisible=true;const slots=[],track=el('div','reel-track');grid.append(track);
function pauseSlots(){slots.forEach(slot=>{slot.video.pause();slot.button.classList.remove('is-playing');});}
function syncMotion(){const paused=motionPaused||document.hidden||dialog.open||!reelVisible;grid.classList.toggle('is-paused',paused);grid.classList.toggle('is-reduced',reduced.matches);document.querySelector('#toggle-motion').textContent=lang==='en'?(motionPaused?'Play motion':'Pause motion'):(motionPaused?'Putar animasi':'Jeda animasi');document.querySelector('#toggle-motion').setAttribute('aria-pressed',String(motionPaused));if(paused){pauseSlots();return;}slots.forEach(slot=>{slot.video.play().then(()=>{if(!motionPaused&&!dialog.open&&!document.hidden&&reelVisible)slot.button.classList.add('is-playing');else slot.video.pause();}).catch(()=>slot.button.classList.remove('is-playing'));});}
function updateDialog(){const p=data.projects[index];document.querySelector('#dialog-title').textContent=title(p);document.querySelector('#dialog-meta').textContent=time(p.duration)+' / '+(index+1)+(lang==='en'?' of ':' dari ')+data.projects.length;document.querySelector('#fallback-video').href=p.video;}
function openProject(i,trigger){index=(i+data.projects.length)%data.projects.length;if(trigger)opener=trigger;const p=data.projects[index];updateDialog();document.querySelector('#video-error').hidden=true;player.src=p.video;player.poster=p.poster;player.load();if(!dialog.open)dialog.showModal();document.body.classList.add('modal-open');syncMotion();player.play().catch(()=>{});}
for(let duplicate=0;duplicate<2;duplicate++){const group=el('div','reel-group');if(duplicate)group.setAttribute('aria-hidden','true');track.append(group);data.projects.forEach((p,i)=>{const button=el('button','reel-item'),image=el('img'),video=el('video');button.type='button';if(duplicate)button.tabIndex=-1;image.src=p.objectPoster;image.alt='';image.width=240;image.height=240;image.loading='eager';video.src=p.objectVideo;video.poster=p.objectPoster;video.muted=true;video.loop=true;video.autoplay=false;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-hidden','true');button.append(video,image);group.append(button);const slot={button,video,project:p};slots.push(slot);if(!duplicate)cards.set(p.id,button);button.addEventListener('click',()=>{if(performance.now()>=suppressClickUntil)openProject(i,button);});video.addEventListener('error',()=>button.classList.remove('is-playing'));});}

// Position and momentum share one loop, so dragging never resets the reel.
let position=0,velocity=0,lastFrame=0,cycleWidth=0,drag=null,suppressClickUntil=0;
const measureReel=()=>{cycleWidth=track.children[0].getBoundingClientRect().width;};
function paintReel(){if(cycleWidth>0){position=((position%cycleWidth)+cycleWidth)%cycleWidth;track.style.transform=`translate3d(${-position}px,0,0)`;}}
function animateReel(now){const dt=Math.min(now-(lastFrame||now),40);lastFrame=now;
 const keyboardFocus=!!track.querySelector(':focus-visible');
 if(!reduced.matches&&!motionPaused&&!document.hidden&&!dialog.open&&reelVisible&&!keyboardFocus&&!drag){
  const base=matchMedia('(max-width: 760px)').matches?48:58;
  position+=(base/1000+velocity)*dt;velocity*=Math.exp(-dt/600);if(Math.abs(velocity)<.002)velocity=0;paintReel();
 }
 requestAnimationFrame(animateReel);
}
grid.addEventListener('pointerdown',e=>{if(reduced.matches||e.button!==0||dialog.open)return;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,lastX:e.clientX,time:performance.now(),active:false,vertical:false};velocity=0;});
grid.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||drag.vertical)return;
 const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;
 if(!drag.active){if(Math.max(Math.abs(dx),Math.abs(dy))<7)return;if(Math.abs(dy)>Math.abs(dx)){drag.vertical=true;return;}drag.active=true;grid.setPointerCapture(e.pointerId);grid.classList.add('is-dragging');}
 e.preventDefault();const now=performance.now(),elapsed=Math.max(8,now-drag.time),delta=e.clientX-drag.lastX;
 position-=delta;velocity=velocity*.3+Math.max(-2,Math.min(2,-delta/elapsed))*.7;drag.lastX=e.clientX;drag.time=now;paintReel();
});
function finishDrag(e){if(!drag||drag.id!==e.pointerId)return;if(drag.active){suppressClickUntil=performance.now()+350;if(e.type==='pointercancel'||performance.now()-drag.time>100)velocity=0;if(grid.hasPointerCapture(e.pointerId))grid.releasePointerCapture(e.pointerId);}drag=null;grid.classList.remove('is-dragging');}
['pointerup','pointercancel','lostpointercapture'].forEach(name=>grid.addEventListener(name,finishDrag));
grid.addEventListener('dragstart',e=>e.preventDefault());
if('ResizeObserver' in window)new ResizeObserver(()=>{measureReel();paintReel();}).observe(track.children[0]);
measureReel();requestAnimationFrame(animateReel);

document.querySelector('#toggle-motion').addEventListener('click',()=>{motionPaused=!motionPaused;syncMotion();});
function applyLanguage(){document.documentElement.lang=lang;const photo=document.querySelector(".about-photo");if(photo)photo.alt=lang==="en"?"Portrait of Kim":"Potret Kim";document.querySelectorAll('[data-copy]').forEach(n=>{const value=tr(n.dataset.copy);if(value!==undefined)n.innerHTML=value;});document.querySelector('#intro-title').textContent=tr('introTitle');document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));document.querySelector('nav').setAttribute('aria-label',tr('mainNav'));slots.forEach(slot=>slot.button.setAttribute('aria-label',tr('play')+' '+title(slot.project)));syncMotion();if(dialog.open)updateDialog();document.querySelector('meta[name="description"]').content=lang==='en'?"Kim's portfolio â€” motion design and visual experiments.":"Kim's portfolio â€” motion design dan eksplorasi visual.";}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{lang=b.dataset.lang;try{localStorage.setItem('kim-portfolio-language',lang);}catch{}applyLanguage();}));
document.querySelector('#close-dialog').onclick=()=>dialog.close();document.querySelector('#prev-project').onclick=()=>openProject(index-1);document.querySelector('#next-project').onclick=()=>openProject(index+1);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('keydown',e=>{if(e.target===player)return;if(e.key==='ArrowLeft'){e.preventDefault();openProject(index-1);}if(e.key==='ArrowRight'){e.preventDefault();openProject(index+1);}});
dialog.addEventListener('close',()=>{player.pause();player.removeAttribute('src');player.load();document.body.classList.remove('modal-open');if(opener)opener.focus({preventScroll:true});syncMotion();});
player.addEventListener('error',()=>{if(player.getAttribute('src'))document.querySelector('#video-error').hidden=false;});document.addEventListener('visibilitychange',()=>{syncMotion();if(document.hidden)player.pause();});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{reelVisible=entries[0].isIntersecting;syncMotion();},{threshold:.01});observer.observe(grid);}
if(reduced.addEventListener)reduced.addEventListener('change',()=>{motionPaused=reduced.matches;syncMotion();});
applyLanguage();
})();
