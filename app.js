const ranks = [
  {rank:'01', holder:'0x71...9F2A', name:'Apex Syndicate', value:'12.40 ETH', change:'+20.0%', color:'pink', flag:'A'},
  {rank:'02', holder:'0xB4...11C8', name:'The Anonymous', value:'9.85 ETH', change:'+8.4%', color:'orange', flag:'T'},
  {rank:'03', holder:'0x8A...E441', name:'Midas Touch', value:'8.20 ETH', change:'+12.1%', color:'blue', flag:'M'},
  {rank:'04', holder:'0xF2...882D', name:'House of Sol', value:'6.70 ETH', change:'+4.8%', color:'purple', flag:'H'},
  {rank:'05', holder:'0x19...A09B', name:'N0CTURNAL', value:'5.40 ETH', change:'+2.2%', color:'green', flag:'N'},
  {rank:'06', holder:'0xC1...7E20', name:'Venture Vault', value:'4.90 ETH', change:'-1.4%', color:'pink', flag:'V'},
  {rank:'07', holder:'0x44...B12F', name:'Quiet Capital', value:'4.25 ETH', change:'+6.9%', color:'orange', flag:'Q'},
  {rank:'08', holder:'0x0D...C318', name:'Blue Chip', value:'3.80 ETH', change:'+1.1%', color:'blue', flag:'B'},
  {rank:'09', holder:'0xE8...72AA', name:'The Operator', value:'3.20 ETH', change:'-0.5%', color:'purple', flag:'O'},
  {rank:'10', holder:'0x6F...91D4', name:'Golden Hour', value:'2.85 ETH', change:'+3.6%', color:'green', flag:'G'}
];
const rows = document.getElementById('rows');
function render(list = ranks) {
  rows.innerHTML = list.map(r => `<div class="rank-row"><span class="rank-no">#${r.rank}</span><div class="holder"><span class="avatar ${r.color}">${r.flag}</span><div><strong>${r.name}</strong><small>${r.holder}</small></div></div><span class="value">${r.value}</span><span class="change ${r.change[0] === '-' ? 'down' : ''}">${r.change}</span><button class="challenge" data-rank="${r.rank}" data-holder="${r.holder}" data-price="${r.value}">↗</button></div>`).join('');
  document.getElementById('showing').textContent = list.length;
  document.querySelectorAll('.challenge').forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset)));
}
function openModal(data) { document.getElementById('modalRank').textContent = `#${data.rank}`; document.getElementById('modalHolder').textContent = data.holder; document.getElementById('modalPrice').textContent = `${(parseFloat(data.price) * 1.2).toFixed(2)} ETH`; document.getElementById('modal').classList.add('open'); }
render();
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => { document.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); render(tab.dataset.filter === 'top' ? ranks.slice(0, 5) : tab.dataset.filter === 'rising' ? ranks.filter(r => r.change.startsWith('+') && parseFloat(r.change) > 5) : ranks); }));
document.getElementById('closeModal').onclick = () => document.getElementById('modal').classList.remove('open');
document.getElementById('modal').onclick = e => { if (e.target.id === 'modal') e.currentTarget.classList.remove('open'); };
document.getElementById('confirmBtn').onclick = function(){ this.innerHTML = 'Takeover requested ✓'; this.style.background = '#a8d5a4'; setTimeout(() => { document.getElementById('modal').classList.remove('open'); this.innerHTML = 'Confirm takeover <span>↗</span>'; this.style.background = ''; }, 1500); };
document.getElementById('connectBtn').onclick = function(){ const text = document.getElementById('walletText'); text.textContent = text.textContent === 'Connect wallet' ? '0x71...9F2A' : 'Connect wallet'; this.classList.toggle('connected'); };
document.getElementById('applyBtn').onclick = () => alert('Applications open soon. Hold a top 10 rank to unlock access.');
document.getElementById('refresh').onclick = function(){ this.style.transform = 'rotate(360deg)'; setTimeout(() => this.style.transform = '', 500); };
document.getElementById('loadMore').onclick = function(){ this.textContent = 'Full leaderboard coming soon →'; };
let seconds = 8*3600+42*60+16; setInterval(() => { seconds = seconds > 0 ? seconds - 1 : 86399; const h=String(Math.floor(seconds/3600)).padStart(2,'0'), m=String(Math.floor(seconds%3600/60)).padStart(2,'0'), s=String(seconds%60).padStart(2,'0'); document.getElementById('timer').textContent = `${h}:${m}:${s}`; }, 1000);
