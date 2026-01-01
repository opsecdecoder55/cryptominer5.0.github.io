/* ============================================
   CryptoMiner Simulator - Game Logic
   ============================================ */

// ============================================
// Coin Data
// ============================================

const COINS = [
    {
        id: 'btc',
        name: 'Bitcoin',
        symbol: 'BTC',
        icon: '₿',
        color: '#f7931a',
        baseRate: 0.00001,
        hashRate: 125,
        difficulty: 'Very High'
    },
    {
        id: 'eth',
        name: 'Ethereum',
        symbol: 'ETH',
        icon: 'Ξ',
        color: '#627eea',
        baseRate: 0.00015,
        hashRate: 350,
        difficulty: 'High'
    },
    {
        id: 'sol',
        name: 'Solana',
        symbol: 'SOL',
        icon: '◎',
        color: '#9945ff',
        baseRate: 0.0008,
        hashRate: 1200,
        difficulty: 'Medium'
    },
    {
        id: 'usdt',
        name: 'Tether',
        symbol: 'USDT',
        icon: '₮',
        color: '#26a17b',
        baseRate: 0.0003,
        hashRate: 500,
        difficulty: 'Medium'
    },
    {
        id: 'ada',
        name: 'Cardano',
        symbol: 'ADA',
        icon: '₳',
        color: '#0033ad',
        baseRate: 0.002,
        hashRate: 800,
        difficulty: 'Low'
    },
    {
        id: 'doge',
        name: 'Dogecoin',
        symbol: 'DOGE',
        icon: 'Ð',
        color: '#c2a633',
        baseRate: 0.005,
        hashRate: 2000,
        difficulty: 'Very Low'
    },
    {
        id: 'ltc',
        name: 'Litecoin',
        symbol: 'LTC',
        icon: 'Ł',
        color: '#bfbbbb',
        baseRate: 0.0004,
        hashRate: 450,
        difficulty: 'Medium'
    },
    {
        id: 'xrp',
        name: 'Ripple',
        symbol: 'XRP',
        icon: '✕',
        color: '#23292f',
        baseRate: 0.003,
        hashRate: 900,
        difficulty: 'Low'
    }
];

// ============================================
// Upgrades Data
// ============================================

const UPGRADES = [
    {
        id: 'gpu',
        name: 'GPU Upgrade',
        icon: '🎮',
        description: '+50% hash rate',
        baseCost: 10,
        multiplier: 1.5,
        level: 0,
        maxLevel: 10
    },
    {
        id: 'cooling',
        name: 'Cooling System',
        icon: '❄️',
        description: '+25% efficiency',
        baseCost: 25,
        multiplier: 1.25,
        level: 0,
        maxLevel: 5
    },
    {
        id: 'power',
        name: 'Power Supply',
        icon: '⚡',
        description: '+100% earnings',
        baseCost: 50,
        multiplier: 2.0,
        level: 0,
        maxLevel: 3
    }
];

// ============================================
// Achievements Data
// ============================================

const ACHIEVEMENTS = [
    { id: 'first_mine', name: 'First Block', icon: '🎯', condition: (s) => s.blocksFound >= 1 },
    { id: 'miner_10', name: '10 Blocks', icon: '⛏️', condition: (s) => s.blocksFound >= 10 },
    { id: 'miner_100', name: '100 Blocks', icon: '💎', condition: (s) => s.blocksFound >= 100 },
    { id: 'rich_10', name: '$10 Earned', icon: '💰', condition: (s) => s.lifetimeEarned >= 10 },
    { id: 'rich_100', name: '$100 Earned', icon: '🤑', condition: (s) => s.lifetimeEarned >= 100 },
    { id: 'time_1h', name: '1 Hour Mined', icon: '⏰', condition: (s) => s.lifetimeMiningSeconds >= 3600 }
];

// ============================================
// Game State
// ============================================

let gameState = {
    user: null,
    selectedCoin: COINS[0],
    balance: 0,
    isMining: false,
    miningStartTime: null,
    currentProgress: 0,
    blocksFound: 0,
    hashRate: 0,
    miningInterval: null,
    progressInterval: null,
    hashInterval: null,
    timeInterval: null,
    lifetimeEarned: 0,
    lifetimeBlocks: 0,
    lifetimeMiningSeconds: 0,
    miningLevel: 1,
    upgrades: JSON.parse(JSON.stringify(UPGRADES)),
    achievements: [],
    totalMiners: Math.floor(Math.random() * 5000) + 10000
};

// ============================================
// DOM Elements
// ============================================

const elements = {
    // Coins
    coinsGrid: document.getElementById('coinsGrid'),

    // Mining
    selectedCoinIcon: document.getElementById('selectedCoinIcon'),
    selectedCoinName: document.getElementById('selectedCoinName'),
    selectedCoinSymbol: document.getElementById('selectedCoinSymbol'),
    miningAnimation: document.getElementById('miningAnimation'),
    currentHash: document.getElementById('currentHash'),
    miningProgress: document.getElementById('miningProgress'),
    progressText: document.getElementById('progressText'),
    startMiningBtn: document.getElementById('startMiningBtn'),

    // Stats
    currentBalance: document.getElementById('currentBalance'),
    hashRate: document.getElementById('hashRate'),
    blocksFound: document.getElementById('blocksFound'),
    miningTime: document.getElementById('miningTime'),
    lifetimeEarned: document.getElementById('lifetimeEarned'),
    lifetimeBlocks: document.getElementById('lifetimeBlocks'),
    lifetimeTime: document.getElementById('lifetimeTime'),
    miningLevel: document.getElementById('miningLevel'),

    // Hero Stats
    totalMinersCount: document.getElementById('totalMinersCount'),
    totalMinedDisplay: document.getElementById('totalMinedDisplay'),

    // Upgrades & Achievements
    upgradesList: document.getElementById('upgradesList'),
    achievementsList: document.getElementById('achievementsList'),

    // Modals
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),

    // Buttons
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    mobileLoginBtn: document.getElementById('mobileLoginBtn'),
    mobileRegisterBtn: document.getElementById('mobileRegisterBtn'),
    closeLoginModal: document.getElementById('closeLoginModal'),
    closeRegisterModal: document.getElementById('closeRegisterModal'),
    switchToRegister: document.getElementById('switchToRegister'),
    switchToLogin: document.getElementById('switchToLogin'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileMenu: document.getElementById('mobileMenu'),

    // Toast
    toast: document.getElementById('toast')
};

// ============================================
// Initialization
// ============================================

function init() {
    loadGameState();
    createParticles();
    renderCoins();
    renderUpgrades();
    renderAchievements();
    updateUI();
    setupEventListeners();
    animateHeroStats();
}

// ============================================
// Local Storage
// ============================================

function saveGameState() {
    const saveData = {
        user: gameState.user,
        balance: gameState.balance,
        blocksFound: gameState.blocksFound,
        lifetimeEarned: gameState.lifetimeEarned,
        lifetimeBlocks: gameState.lifetimeBlocks,
        lifetimeMiningSeconds: gameState.lifetimeMiningSeconds,
        miningLevel: gameState.miningLevel,
        upgrades: gameState.upgrades,
        achievements: gameState.achievements,
        selectedCoinId: gameState.selectedCoin.id
    };
    localStorage.setItem('cryptoMinerSim', JSON.stringify(saveData));
}

function loadGameState() {
    const saved = localStorage.getItem('cryptoMinerSim');
    if (saved) {
        const data = JSON.parse(saved);
        gameState.user = data.user;
        gameState.balance = data.balance || 0;
        gameState.blocksFound = data.blocksFound || 0;
        gameState.lifetimeEarned = data.lifetimeEarned || 0;
        gameState.lifetimeBlocks = data.lifetimeBlocks || 0;
        gameState.lifetimeMiningSeconds = data.lifetimeMiningSeconds || 0;
        gameState.miningLevel = data.miningLevel || 1;
        gameState.upgrades = data.upgrades || JSON.parse(JSON.stringify(UPGRADES));
        gameState.achievements = data.achievements || [];

        if (data.selectedCoinId) {
            const coin = COINS.find(c => c.id === data.selectedCoinId);
            if (coin) gameState.selectedCoin = coin;
        }
    }
}

// ============================================
// Particle Animation
// ============================================

function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.animationDuration = `${10 + Math.random() * 10}s`;
        container.appendChild(particle);
    }
}

// ============================================
// Render Functions
// ============================================

function renderCoins() {
    elements.coinsGrid.innerHTML = COINS.map(coin => `
        <div class="coin-card ${gameState.selectedCoin.id === coin.id ? 'selected' : ''}" 
             data-coin-id="${coin.id}"
             style="--coin-color: ${coin.color}">
            <span class="coin-select-badge">SELECTED</span>
            <div class="coin-header">
                <div class="coin-icon" style="background: linear-gradient(135deg, ${coin.color} 0%, rgba(255,255,255,0.1) 100%)">
                    ${coin.icon}
                </div>
                <div class="coin-info">
                    <h3>${coin.name}</h3>
                    <p>${coin.symbol}</p>
                </div>
            </div>
            <div class="coin-stats">
                <div class="coin-stat">
                    <span class="coin-stat-value" style="color: ${coin.color}">${coin.hashRate} H/s</span>
                    <span class="coin-stat-label">Base Rate</span>
                </div>
                <div class="coin-stat">
                    <span class="coin-stat-value" style="color: ${coin.color}">${coin.difficulty}</span>
                    <span class="coin-stat-label">Difficulty</span>
                </div>
            </div>
        </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.coin-card').forEach(card => {
        card.addEventListener('click', () => selectCoin(card.dataset.coinId));
    });
}

function renderUpgrades() {
    elements.upgradesList.innerHTML = gameState.upgrades.map(upgrade => {
        const cost = upgrade.baseCost * Math.pow(2, upgrade.level);
        const canAfford = gameState.balance >= cost;
        const maxed = upgrade.level >= upgrade.maxLevel;

        return `
            <div class="upgrade-item">
                <span class="upgrade-icon">${upgrade.icon}</span>
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name} (Lv.${upgrade.level}/${upgrade.maxLevel})</div>
                    <div class="upgrade-desc">${upgrade.description}</div>
                    <div class="upgrade-cost">${maxed ? 'MAXED' : `Cost: $${cost.toFixed(2)}`}</div>
                </div>
                <button class="btn btn-upgrade" 
                        data-upgrade-id="${upgrade.id}"
                        ${(!canAfford || maxed) ? 'disabled' : ''}>
                    ${maxed ? '✓' : 'Buy'}
                </button>
            </div>
        `;
    }).join('');

    // Add click listeners
    document.querySelectorAll('.btn-upgrade').forEach(btn => {
        btn.addEventListener('click', () => buyUpgrade(btn.dataset.upgradeId));
    });
}

function renderAchievements() {
    elements.achievementsList.innerHTML = ACHIEVEMENTS.map(achievement => {
        const unlocked = gameState.achievements.includes(achievement.id);
        return `
            <div class="achievement ${unlocked ? 'unlocked' : ''}" title="${achievement.name}">
                <span class="achievement-icon">${achievement.icon}</span>
                <span class="achievement-name">${achievement.name}</span>
            </div>
        `;
    }).join('');
}

// ============================================
// Coin Selection
// ============================================

function selectCoin(coinId) {
    const coin = COINS.find(c => c.id === coinId);
    if (!coin) return;

    // Stop mining if active
    if (gameState.isMining) {
        stopMining();
    }

    gameState.selectedCoin = coin;

    // Update UI
    document.querySelectorAll('.coin-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.coinId === coinId);
    });

    elements.selectedCoinIcon.textContent = coin.icon;
    elements.selectedCoinIcon.style.background = `linear-gradient(135deg, ${coin.color} 0%, rgba(255,255,255,0.2) 100%)`;
    elements.selectedCoinName.textContent = coin.name;
    elements.selectedCoinSymbol.textContent = coin.symbol;

    showToast(`Selected ${coin.name} for mining!`, 'info');
    saveGameState();
}

// ============================================
// Mining Logic
// ============================================

function toggleMining() {
    if (gameState.isMining) {
        stopMining();
    } else {
        startMining();
    }
}

function startMining() {
    gameState.isMining = true;
    gameState.miningStartTime = Date.now();
    gameState.currentProgress = 0;

    // Update button
    elements.startMiningBtn.classList.add('mining');
    elements.startMiningBtn.querySelector('.btn-icon').textContent = '■';
    elements.miningAnimation.classList.add('active');

    // Calculate hash rate with upgrades
    const baseHash = gameState.selectedCoin.hashRate;
    let multiplier = 1;
    gameState.upgrades.forEach(u => {
        if (u.id === 'gpu') multiplier *= Math.pow(u.multiplier, u.level);
    });
    gameState.hashRate = Math.floor(baseHash * multiplier);

    // Start mining intervals
    gameState.miningInterval = setInterval(miningTick, 100);
    gameState.hashInterval = setInterval(updateHash, 50);
    gameState.timeInterval = setInterval(updateMiningTime, 1000);

    showToast(`Started mining ${gameState.selectedCoin.name}!`, 'success');
}

function stopMining() {
    gameState.isMining = false;

    // Update button
    elements.startMiningBtn.classList.remove('mining');
    elements.startMiningBtn.querySelector('.btn-icon').textContent = '▶';
    elements.startMiningBtn.querySelector('.btn-text').textContent = 'Start Mining';
    elements.miningAnimation.classList.remove('active');

    // Clear intervals
    clearInterval(gameState.miningInterval);
    clearInterval(gameState.hashInterval);
    clearInterval(gameState.timeInterval);

    // Reset progress
    elements.miningProgress.style.width = '0%';
    elements.progressText.textContent = 'Ready to mine';

    saveGameState();
    showToast('Mining stopped', 'info');
}

function miningTick() {
    // Progress the mining bar
    gameState.currentProgress += Math.random() * 3 + 1;

    if (gameState.currentProgress >= 100) {
        // Found a block!
        foundBlock();
        gameState.currentProgress = 0;
    }

    // Update progress bar
    elements.miningProgress.style.width = `${gameState.currentProgress}%`;
    elements.progressText.textContent = `Mining... ${Math.floor(gameState.currentProgress)}%`;

    // Calculate earnings with upgrades
    let earningMultiplier = 1;
    gameState.upgrades.forEach(u => {
        if (u.id === 'power') earningMultiplier *= Math.pow(u.multiplier, u.level);
        if (u.id === 'cooling') earningMultiplier *= Math.pow(u.multiplier, u.level);
    });

    const earnings = gameState.selectedCoin.baseRate * earningMultiplier * 0.1;
    gameState.balance += earnings;
    gameState.lifetimeEarned += earnings;

    updateUI();
}

function foundBlock() {
    gameState.blocksFound++;
    gameState.lifetimeBlocks++;

    // Level up check
    const newLevel = Math.floor(gameState.lifetimeBlocks / 10) + 1;
    if (newLevel > gameState.miningLevel) {
        gameState.miningLevel = newLevel;
        showToast(`🎉 Level Up! You're now level ${newLevel}!`, 'success');
    }

    // Check achievements
    checkAchievements();

    showToast(`⛏️ Block found! +$${(gameState.selectedCoin.baseRate * 10).toFixed(4)}`, 'success');
}

function updateHash() {
    if (!gameState.isMining) return;

    const hash = '0x' + Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
    elements.currentHash.textContent = hash;
}

function updateMiningTime() {
    if (!gameState.isMining) return;

    const elapsed = Math.floor((Date.now() - gameState.miningStartTime) / 1000);
    gameState.lifetimeMiningSeconds++;

    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    elements.miningTime.textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// Upgrades
// ============================================

function buyUpgrade(upgradeId) {
    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = upgrade.baseCost * Math.pow(2, upgrade.level);

    if (gameState.balance < cost) {
        showToast('Not enough balance!', 'error');
        return;
    }

    if (upgrade.level >= upgrade.maxLevel) {
        showToast('Already maxed!', 'error');
        return;
    }

    gameState.balance -= cost;
    upgrade.level++;

    renderUpgrades();
    updateUI();
    saveGameState();

    showToast(`🎉 Upgraded ${upgrade.name} to level ${upgrade.level}!`, 'success');
}

// ============================================
// Achievements
// ============================================

function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (!gameState.achievements.includes(achievement.id) && achievement.condition(gameState)) {
            gameState.achievements.push(achievement.id);
            renderAchievements();
            showToast(`🏆 Achievement Unlocked: ${achievement.name}!`, 'success');
        }
    });
}

// ============================================
// UI Updates
// ============================================

function updateUI() {
    elements.currentBalance.textContent = `$${gameState.balance.toFixed(2)}`;
    elements.hashRate.textContent = `${gameState.hashRate} H/s`;
    elements.blocksFound.textContent = gameState.blocksFound;
    elements.lifetimeEarned.textContent = `$${gameState.lifetimeEarned.toFixed(2)}`;
    elements.lifetimeBlocks.textContent = gameState.lifetimeBlocks;
    elements.miningLevel.textContent = gameState.miningLevel;

    // Lifetime time
    const hours = Math.floor(gameState.lifetimeMiningSeconds / 3600);
    const minutes = Math.floor((gameState.lifetimeMiningSeconds % 3600) / 60);
    elements.lifetimeTime.textContent = `${hours}h ${minutes}m`;

    // Update total mined display
    elements.totalMinedDisplay.textContent = `$${gameState.lifetimeEarned.toFixed(2)}`;
}

function animateHeroStats() {
    // Animate miner count
    let current = 0;
    const target = gameState.totalMiners;
    const increment = Math.ceil(target / 50);

    const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        elements.totalMinersCount.textContent = current.toLocaleString();
    }, 30);
}

// ============================================
// Modals
// ============================================

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Simulated login
    const users = JSON.parse(localStorage.getItem('cryptoMinerUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        gameState.user = user;
        saveGameState();
        closeModal(elements.loginModal);
        showToast(`Welcome back, ${user.name}!`, 'success');
        updateUserUI();
    } else {
        showToast('Invalid email or password', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    // Simulated registration
    const users = JSON.parse(localStorage.getItem('cryptoMinerUsers') || '[]');

    if (users.find(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    localStorage.setItem('cryptoMinerUsers', JSON.stringify(users));

    gameState.user = newUser;
    saveGameState();
    closeModal(elements.registerModal);
    showToast(`Welcome, ${name}! Start mining now!`, 'success');
    updateUserUI();
}

function updateUserUI() {
    if (gameState.user) {
        elements.loginBtn.textContent = gameState.user.name;
        elements.registerBtn.textContent = 'Logout';
        elements.registerBtn.onclick = handleLogout;
    }
}

function handleLogout() {
    gameState.user = null;
    saveGameState();
    elements.loginBtn.textContent = 'Login';
    elements.registerBtn.textContent = 'Register';
    elements.registerBtn.onclick = () => openModal(elements.registerModal);
    showToast('Logged out successfully', 'info');
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'info') {
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    elements.toast.className = `toast ${type}`;
    elements.toast.querySelector('.toast-icon').textContent = icons[type];
    elements.toast.querySelector('.toast-message').textContent = message;
    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Mining
    elements.startMiningBtn.addEventListener('click', toggleMining);

    // Modals
    elements.loginBtn.addEventListener('click', () => openModal(elements.loginModal));
    elements.registerBtn.addEventListener('click', () => openModal(elements.registerModal));
    elements.mobileLoginBtn.addEventListener('click', () => {
        elements.mobileMenu.classList.remove('active');
        openModal(elements.loginModal);
    });
    elements.mobileRegisterBtn.addEventListener('click', () => {
        elements.mobileMenu.classList.remove('active');
        openModal(elements.registerModal);
    });

    elements.closeLoginModal.addEventListener('click', () => closeModal(elements.loginModal));
    elements.closeRegisterModal.addEventListener('click', () => closeModal(elements.registerModal));

    elements.switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(elements.loginModal);
        openModal(elements.registerModal);
    });

    elements.switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(elements.registerModal);
        openModal(elements.loginModal);
    });

    // Modal overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            closeModal(elements.loginModal);
            closeModal(elements.registerModal);
        });
    });

    // Forms
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);

    // Mobile menu
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.mobileMenu.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            elements.mobileMenu.classList.remove('active');
        });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(elements.loginModal);
            closeModal(elements.registerModal);
        }
    });

    // Auto-save every 30 seconds
    setInterval(saveGameState, 30000);

    // Check if user is logged in
    if (gameState.user) {
        updateUserUI();
    }
}

// ============================================
// Initialize Game
// ============================================

document.addEventListener('DOMContentLoaded', init);
