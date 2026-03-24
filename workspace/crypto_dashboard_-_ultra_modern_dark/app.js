```javascript
const cryptoData = {
  BTC: {
    name: "Bitcoin",
    symbol: "BTC",
    price: 67432.18,
    change: 2.34,
    volume: "42.3B",
    marketCap: "1.32T",
    icon: "₿",
    color: "#F7931A",
    history: []
  },
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    price: 3521.44,
    change: -1.12,
    volume: "18.7B",
    marketCap: "423.1B",
    icon: "Ξ",
    color: "#627EEA",
    history: []
  },
  SOL: {
    name: "Solana",
    symbol: "SOL",
    price: 178.92,
    change: 5.67,
    volume: "8.2B",
    marketCap: "78.4B",
    icon: "◎",
    color: "#9945FF",
    history: []
  },
  BNB: {
    name: "BNB",
    symbol: "BNB",
    price: 412.33,
    change: 0.89,
    volume: "5.1B",
    marketCap: "61.2B",
    icon: "B",
    color: "#F3BA2F",
    history: []
  },
  ADA: {
    name: "Cardano",
    symbol: "ADA",
    price: 0.4821,
    change: -3.21,
    volume: "2.9B",
    marketCap: "17.1B",
    icon: "₳",
    color: "#0D1E7A",
    history: []
  },
  DOGE: {
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.1632,
    change: 8.45,
    volume: "3.4B",
    marketCap: "23.5B",
    icon: "Ð",
    color: "#C2A633",
    history: []
  }
};

let selectedCoin = "BTC";
let chart = null;
let chartCanvas = null;
let animationFrame = null;

function generateHistory(basePrice, points = 30) {
  const history = [];
  let price = basePrice * 0.92;
  for (let i = 0; i < points; i++) {
    price = price + (Math.random() - 0.48) * price * 0.025;
    history.push(parseFloat(price.toFixed(2)));
  }
  history.push(basePrice);
  return history;
}

function initHistory() {
  Object.keys(cryptoData).forEach(key => {
    cryptoData[key].history = generateHistory(cryptoData[key].price);
  });
}

function formatPrice(price) {
  if (price >= 1000) return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return "$" + price.toFixed(4);
  return "$" + price.toFixed(6);
}

function formatChange(change) {
  const sign = change >= 0 ? "+" : "";
  return sign + change.toFixed(2) + "%";
}

function buildLayout() {
  document.body.innerHTML = "";
  document.body.className = "bg-gray-950 text-white min-h-screen font-sans flex overflow-hidden";
  document.body.style.fontFamily = "'Inter', 'Segoe UI', sans-serif";

  // Sidebar
  const sidebar = document.createElement("aside");
  sidebar.id = "sidebar";
  sidebar.className = "w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-4 fixed left-0 top-0 bottom-0 z-20";
  sidebar.innerHTML = `
    <div class="flex items-center gap-3 mb-10 px-2">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">₿</div>
      <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">CryptoDash</span>
    </div>
    <nav class="flex flex-col gap-1">
      <a href="#" class="nav-item active flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style="background:linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.3));border:1px solid rgba(99,102,241,0.4)" data-section="dashboard">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Dashboard
      </a>
      <a href="#" class="nav-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all" data-section="market">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
        Markets
      </a>
      <a href="#" class="nav-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all" data-section="portfolio">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        Portfolio
      </a>
      <a href="#" class="nav-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all" data-section="watchlist">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Watchlist
      </a>
      <a href="#" class="nav-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all" data-section="settings">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Settings
      </a>
    </nav>
    <div class="mt-auto px-2 pt-6 border-t border-gray-800">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">U</div>
        <div>
          <p class="text-sm font-semibold text-white">User</p>
          <p class="text-xs text-gray-500">Pro Plan</p>
        </div>
        <div class="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
      </div>
    </div>
  `;

  // Main content
  const main = document.createElement("main");
  main.id = "main-content";
  main.className = "flex-1 ml-64 min-h-screen flex flex-col";
  main.style.background = "linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 100%)";

  // Topbar
  const topbar = document.createElement("header");
  topbar.className = "sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b border-gray-800";
  topbar.style.background = "rgba(9,9,18,0.85)";
  topbar.style.backdropFilter = "blur(20px)";
  topbar.innerHTML = `