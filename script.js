// script.js - small client-side demo backend (localStorage) for hackathon demo

// --- simple auth (store accounts in localStorage)
const Auth = {
  register({name, studentId, password}) {
    if(!name || !studentId || !password) return { ok:false, msg:'Please fill all fields' };
    const users = JSON.parse(localStorage.getItem('da_users') || '[]');
    if(users.some(u => u.studentId === studentId)) return { ok:false, msg:'Student ID already used' };
    users.push({ name, studentId, password });
    localStorage.setItem('da_users', JSON.stringify(users));
    localStorage.setItem('da_current', JSON.stringify({ name, studentId }));
    return { ok:true };
  },
  login({studentId, password}) {
    const users = JSON.parse(localStorage.getItem('da_users') || '[]');
    const u = users.find(x => x.studentId === studentId && x.password === password);
    if(!u) return { ok:false, msg:'Invalid credentials' };
    localStorage.setItem('da_current', JSON.stringify({ name: u.name, studentId: u.studentId }));
    return { ok:true };
  },
  current() {
    return JSON.parse(localStorage.getItem('da_current') || 'null');
  },
  logout() {
    localStorage.removeItem('da_current');
  }
};

// --- demo listings (seed if missing)
function seedListings(){
  if(localStorage.getItem('da_listings')) return;
  const seed = [
    {id:1,title:"Calculus Textbook - Stewart",category:"textbooks",price:35,desc:"Slightly used, highlights minimal",img:"https://via.placeholder.com/400x300?text=Calculus"},
    {id:2,title:"USB-C Laptop Charger",category:"electronics",price:25,desc:"Works perfectly, 65W",img:"https://via.placeholder.com/400x300?text=Charger"},
    {id:3,title:"College Bike - Good Condition",category:"bikes",price:120,desc:"Ready for campus",img:"https://via.placeholder.com/400x300?text=Bike"},
    {id:4,title:"Room for Rent near Campus",category:"housing",price:550,desc:"2-bedroom apt, utilities included",img:"https://via.placeholder.com/400x300?text=Room"},
    {id:5,title:"Keyboard & Mouse",category:"electronics",price:20,desc:"Gaming combo",img:"https://via.placeholder.com/400x300?text=Keyboard"},
    {id:6,title:"Tutoring - Math 1A",category:"services",price:30,desc:"Experienced tutor",img:"https://via.placeholder.com/400x300?text=Tutor"},
    {id:7,title:"Student Job - Campus Library",category:"jobs",price:0,desc:"Part-time, 10 hrs/week",img:"https://via.placeholder.com/400x300?text=Job"},
    {id:8,title:"Campus Concert Tickets",category:"events",price:15,desc:"Live music on Friday",img:"https://via.placeholder.com/400x300?text=Event"},
  ];
  localStorage.setItem('da_listings', JSON.stringify(seed));
}

// get listings
function getListings(){
  return JSON.parse(localStorage.getItem('da_listings') || '[]');
}
function saveListings(list){ localStorage.setItem('da_listings', JSON.stringify(list)); }

// add listing (used by sell page)
function addListing(item){
  const list = getListings();
  item.id = Date.now();
  list.unshift(item);
  saveListings(list);
}

// --- marketplace behavior: toggle search
function toggleSearch(){
  const el = document.getElementById('search-input');
  if(!el) return;
  if(el.style.display === 'block') el.style.display = 'none';
  else { el.style.display = 'block'; el.focus(); }
}

// --- listings rendering page
function renderListingsPage(){
  seedListings();
  const grid = document.getElementById('product-grid');
  if(!grid) return;
  const q = new URLSearchParams(location.search);
  const category = q.get('cat') || '';
  const mode = q.get('mode') || ''; // buy all, or category
  const searchVal = document.getElementById('filter-search') ? document.getElementById('filter-search').value.toLowerCase() : '';
  const priceSel = document.getElementById('filter-price') ? document.getElementById('filter-price').value : '';
  let items = getListings();
  if(category) items = items.filter(i => i.category === category);
  if(searchVal) items = items.filter(i => i.title.toLowerCase().includes(searchVal) || i.desc.toLowerCase().includes(searchVal));
  if(priceSel){
    if(priceSel === '0-50') items = items.filter(i => i.price <=50 );
    if(priceSel === '50-200') items = items.filter(i => i.price >50 && i.price <=200 );
    if(priceSel === '200+') items = items.filter(i => i.price >200 );
  }
  grid.innerHTML = '';
  if(items.length===0){
    grid.innerHTML = '<div class="small">No items found. Try different filters or publish on Sell page.</div>';
    return;
  }
  items.forEach(it=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <img src="${it.img || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${escapeHtml(it.title)}" />
      <h3>${escapeHtml(it.title)}</h3>
      <p>${escapeHtml(it.desc)}</p>
      <div class="meta">
        <div class="price">${it.price>0?('$'+it.price):'Free/Job'}</div>
        <div><button onclick="handleView(${it.id})">View</button></div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// view item (demo)
function handleView(id){
  const items = getListings();
  const it = items.find(i=>i.id===id);
  if(!it) return alert('Item not found');
  // show a simple modal dialog using window.open or alert - but nicer: create a simple overlay
  showItemOverlay(it);
}

function showItemOverlay(item){
  const overlay = document.createElement('div');
  overlay.style.position='fixed';
  overlay.style.left=0;overlay.style.top=0;overlay.style.right=0;overlay.style.bottom=0;
  overlay.style.background='rgba(0,0,0,0.6)';
  overlay.style.display='flex';overlay.style.alignItems='center';overlay.style.justifyContent='center';overlay.style.zIndex=9999;
  overlay.innerHTML = `
    <div style="background:#fff;padding:18px;border-radius:12px;max-width:700px;width:92%;box-shadow:0 10px 30px rgba(0,0,0,0.25)">
      <div style="display:flex;gap:12px;align-items:start">
        <img src="${item.img || 'https://via.placeholder.com/400x300?text=No+Image'}" style="width:40%;border-radius:8px;object-fit:cover"/>
        <div style="flex:1">
          <h2 style="margin:0;color:${getComputedStyle(document.documentElement).getPropertyValue('--primary-red')||'#6e0b0f'}">${escapeHtml(item.title)}</h2>
          <p style="margin:8px 0">${escapeHtml(item.desc)}</p>
          <div style="display:flex;gap:10px;align-items:center;margin-top:14px">
            <div style="font-weight:800">${item.price>0?('$'+item.price):'Free/Job'}</div>
            <button style="background:var(--gold);border:none;padding:8px 12px;border-radius:8px;cursor:pointer" onclick="openBuy(${item.id})">Buy / Contact</button>
            <button style="background:#eee;border:none;padding:8px 12px;border-radius:8px;cursor:pointer" onclick="this.closest('div[style]').parentNode.remove()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e=>{ if(e.target===overlay) overlay.remove(); });
}

function openBuy(id){
  // redirect to listings page with item selected
  location.href = `listings.html?cat=&buy=${id}`;
}

// escape helper
function escapeHtml(s){ return (s+'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// --- SELL page helpers (file preview)
function previewFiles(inputEl, containerEl){
  const files = inputEl.files;
  containerEl.innerHTML = '';
  if(!files || files.length===0) return;
  for(let f of files){
    const url = URL.createObjectURL(f);
    if(f.type.startsWith('image/')){
      const img = document.createElement('img'); img.src=url; img.className='preview-thumb'; containerEl.appendChild(img);
    } else if(f.type.startsWith('video/')){
      const v = document.createElement('video'); v.src=url; v.controls=true; v.className='preview-thumb'; containerEl.appendChild(v);
    } else {
      const el = document.createElement('div'); el.textContent=f.name; containerEl.appendChild(el);
    }
  }
}

// --- publish form handler
function handlePublishForm(evt){
  evt.preventDefault();
  const form = evt.target;
  const title = form.title.value.trim();
  const desc = form.description.value.trim();
  const price = Number(form.price.value) || 0;
  const category = form.category.value || 'misc';
  const imgFile = form.media.files[0];
  // for demo we store a blob url as image; backend should upload real file
  let img = '';
  if(imgFile) img = URL.createObjectURL(imgFile);
  addListing({ title, desc, price, category, img });
  alert('Published! The listing will appear in Listings.');
  form.reset();
  const preview = document.getElementById('media-preview');
  if(preview) preview.innerHTML='';
  // if on listings page, optionally refresh
}

// --- simple page init helpers for pages
function initIndex(){
  // nothing yet
}
function initLogin(){
  const form = document.getElementById('login-form');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const studentId = form.studentId.value.trim();
    const password = form.password.value;
    const r = Auth.login({studentId,password});
    if(!r.ok) return alert(r.msg);
    location.href='marketplace.html';
  });
}
function initRegister(){
  const form = document.getElementById('register-form');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = form.name.value.trim();
    const studentId = form.studentId.value.trim();
    const password = form.password.value;
    const r = Auth.register({name,studentId,password});
    if(!r.ok) return alert(r.msg);
    location.href='marketplace.html';
  });
}
function initMarketplace(){
  seedListings();
  const user = Auth.current();
  const profileIcon = document.querySelector('.header .icon');
  if(user) profileIcon.title = user.name + ' • ' + user.studentId;
  // wire categories
  document.querySelectorAll('[data-cat]').forEach(el=>{
    el.addEventListener('click', ()=> {
      const cat = el.getAttribute('data-cat');
      location.href = `listings.html?cat=${cat}`;
    });
  });
  document.getElementById('search-toggle')?.addEventListener('click', toggleSearch);
}
function initListings(){
  seedListings();
  renderListingsPage();
  document.getElementById('apply-filters')?.addEventListener('click', (e)=>{
    e.preventDefault();
    renderListingsPage();
  });
  // if buy param present and buy=id then open modal
  const q = new URLSearchParams(location.search);
  const buyId = q.get('buy');
  if(buyId) {
    const items = getListings();
    const it = items.find(i=>String(i.id) === buyId);
    if(it) showItemOverlay(it);
  }
}
function initSell(){
  const form = document.getElementById('sell-form');
  if(form) form.addEventListener('submit', handlePublishForm);
  const media = document.getElementById('media');
  const preview = document.getElementById('media-preview');
  if(media && preview) media.addEventListener('change', ()=> previewFiles(media, preview));
}

// init for chats simple
function initChats(){ /* nothing extra */ }
function initMessageView(){ /* nothing extra */ }

// On load, auto-run initializer if present
document.addEventListener('DOMContentLoaded', ()=>{
  seedListings();
  // call initializer named init<pageId> if page has body data-page attribute
  const page = document.body.getAttribute('data-page');
  if(page){
    const fnName = 'init' + page.charAt(0).toUpperCase() + page.slice(1);
    if(window[fnName]) window[fnName]();
  }
});
