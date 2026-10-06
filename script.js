/* ==========================================
   CMNX Platform - Resim Destekli script.js
   ========================================== */

const defaultCodes = [
    { 
        code: "CMNX-GAME-2026-X1", 
        title: "Cyberpunk Epic Pack", 
        type: "Oyun",
        gifts: [
            { title: "Özel Silah Kaplaması", desc: "Altın renkli özel kaplama hesabınıza tanımlandı." },
            { title: "1000 Kredi", desc: "Mağazada harcayabileceğiniz 1000 bonus kredi." }
        ]
    },
    { code: "CMNX-PRO-9988-V2", title: "CMNX Pro VIP Üyelik", type: "Abonelik", gifts: [] }
];

const defaultFreeGames = [
    { title: "Pixel Quest Adventure", desc: "Retro tarzı macera oyunu. Ücretsiz olarak keşfet.", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80" },
    { title: "Neon Cyber Runner", desc: "Hızlı tempolu cyberpunk koşu oyunu.", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80" },
    { title: "Galaxy Space Battle", desc: "Uzay boşluğunda geçen kıyasıya strateji savaşı.", img: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=400&auto=format&fit=crop&q=80" }
];

if (!localStorage.getItem('cmnx_codes')) {
    localStorage.setItem('cmnx_codes', JSON.stringify(defaultCodes));
}
if (!localStorage.getItem('cmnx_library')) {
    localStorage.setItem('cmnx_library', JSON.stringify([]));
}
if (!localStorage.getItem('cmnx_free_games')) {
    localStorage.setItem('cmnx_free_games', JSON.stringify(defaultFreeGames));
}
if (!localStorage.getItem('cmnx_requests')) {
    localStorage.setItem('cmnx_requests', JSON.stringify([]));
}
if (!localStorage.getItem('cmnx_users')) {
    localStorage.setItem('cmnx_users', JSON.stringify([]));
}

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links-wrapper');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    updateNavbarUserStatus();

    document.addEventListener('click', (e) => {
        const profileWrapper = document.querySelector('.user-profile-wrapper');
        if (profileWrapper && !profileWrapper.contains(e.target)) {
            const dropdown = document.getElementById('userDropdownMenu');
            const badge = document.getElementById('userProfileBadge');
            if (dropdown) dropdown.classList.remove('show');
            if (badge) badge.classList.remove('active');
        }
    });

    // Admin Panel Yeni Hediye Ekleme Satırı (Artı Butonu)
    const addMoreGiftBtn = document.getElementById('addMoreGiftBtn');
    if (addMoreGiftBtn) {
        addMoreGiftBtn.addEventListener('click', () => {
            const wrapper = document.getElementById('giftInputsWrapper');
            if (!wrapper) return;
            const count = wrapper.querySelectorAll('.gift-row').length + 1;
            const newRow = document.createElement('div');
            newRow.className = 'gift-row';
            newRow.innerHTML = `
                <input type="text" placeholder="${count}. Hediye Adı" class="gift-title-input">
                <input type="text" placeholder="Hediye Açıklaması" class="gift-desc-input">
            `;
            wrapper.appendChild(newRow);
        });
    }

    // Key Kullanma & Hediye Akışı
    const activateBtn = document.getElementById('activateBtn');
    const activationCodeInput = document.getElementById('activationCode');
    const messageArea = document.getElementById('messageArea');

    if (activateBtn) {
        activateBtn.addEventListener('click', () => {
            const enteredCode = activationCodeInput.value.trim();
            if (!enteredCode) {
                showMessage("Lütfen bir kod giriniz!", "error");
                return;
            }

            let codes = JSON.parse(localStorage.getItem('cmnx_codes')) || [];
            let foundIndex = codes.findIndex(c => c.code.toLowerCase() === enteredCode.toLowerCase());

            if (foundIndex !== -1) {
                let matchedItem = codes[foundIndex];
                let library = JSON.parse(localStorage.getItem('cmnx_library')) || [];

                if (library.some(item => item.code.toLowerCase() === enteredCode.toLowerCase())) {
                    showMessage("Bu kod zaten kütüphanenizde ekli!", "error");
                    return;
                }

                library.push(matchedItem);
                localStorage.setItem('cmnx_library', JSON.stringify(library));

                codes.splice(foundIndex, 1);
                localStorage.setItem('cmnx_codes', JSON.stringify(codes));

                activationCodeInput.value = "";
                updateNavbarUserStatus();

                if (matchedItem.gifts && matchedItem.gifts.length > 0) {
                    showGiftSelectionModal(matchedItem);
                } else {
                    showMessage(`Tebrikler! "${matchedItem.title}" başarıyla kütüphanenize eklendi.`, "success");
                }
            } else {
                showMessage("Geçersiz veya admin panelinde bulunmayan kod!", "error");
            }
        });
    }

    function showMessage(text, type) {
        if (!messageArea) return;
        messageArea.textContent = text;
        messageArea.className = `message-area ${type === 'success' ? 'message-success' : 'message-error'}`;
    }

    const libraryGrid = document.getElementById('libraryGrid');
    if (libraryGrid) renderLibrary();

    const freeGamesGrid = document.getElementById('freeGamesGrid');
    if (freeGamesGrid) renderFreeGames();

    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('reqTitle').value;
            const desc = document.getElementById('reqDesc').value;

            let requests = JSON.parse(localStorage.getItem('cmnx_requests')) || [];
            requests.push({ title, desc, date: new Date().toLocaleDateString() });
            localStorage.setItem('cmnx_requests', JSON.stringify(requests));

            alert("İstek listesine başarıyla eklendi!");
            requestForm.reset();
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const passwordConfirm = document.getElementById('regPasswordConfirm').value;
            const regMessage = document.getElementById('regMessage');

            if (password !== passwordConfirm) {
                if (regMessage) regMessage.textContent = "Şifreler eşleşmiyor!";
                return;
            }

            let users = JSON.parse(localStorage.getItem('cmnx_users')) || [];
            if (users.some(u => u.email === email)) {
                if (regMessage) regMessage.textContent = "Bu e-posta adresi zaten kayıtlı!";
                return;
            }

            users.push({ name, email, password });
            localStorage.setItem('cmnx_users', JSON.stringify(users));
            localStorage.setItem('cmnx_logged_user', name);
            alert(`Kayıt başarılı! Hoş geldin, ${name}.`);
            window.location.href = "index.html";
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const identifier = document.getElementById('loginIdentifier').value.trim();
            const password = document.getElementById('loginPassword').value;
            const authMessage = document.getElementById('authMessage');

            // Admin Giriş Kontrolü
            if ((identifier === "admin" || identifier === "admin@cmnx.com") && password === "admin1234") {
                localStorage.setItem('cmnx_logged', 'true');
                localStorage.setItem('cmnx_logged_user', 'Admin');
                alert("Hoş geldin, Admin!");
                window.location.href = "admin.html";
                return;
            }

            let users = JSON.parse(localStorage.getItem('cmnx_users')) || [];
            let validUser = users.find(u => (u.name === identifier || u.email === identifier) && u.password === password);

            if (validUser) {
                localStorage.setItem('cmnx_logged_user', validUser.name);
                alert(`Hoş geldin, ${validUser.name}!`);
                window.location.href = "index.html";
            } else {
                if (authMessage) authMessage.textContent = "Hatalı isim/e-posta veya şifre!";
            }
        });
    }

    if (window.location.pathname.includes('admin.html')) {
        if (localStorage.getItem('cmnx_logged') !== 'true') {
            window.location.href = "admin-login.html";
        }
        renderAdminPanel();

        const addCodeForm = document.getElementById('addCodeForm');
        if (addCodeForm) {
            addCodeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const code = document.getElementById('newCodeText').value;
                const title = document.getElementById('newCodeTitle').value;
                const type = document.getElementById('newCodeType').value;

                let gifts = [];
                const giftRows = document.querySelectorAll('.gift-row');
                giftRows.forEach(row => {
                    const gTitle = row.querySelector('.gift-title-input').value.trim();
                    const gDesc = row.querySelector('.gift-desc-input').value.trim();
                    if (gTitle) {
                        gifts.push({ title: gTitle, desc: gDesc || "Açıklama belirtilmedi." });
                    }
                });

                let codes = JSON.parse(localStorage.getItem('cmnx_codes')) || [];
                codes.push({ code, title, type, gifts });
                localStorage.setItem('cmnx_codes', JSON.stringify(codes));

                alert("Kod ve hediyeler başarıyla eklendi!");
                addCodeForm.reset();
                renderAdminPanel();
            });
        }

        // Ücretsiz Oyun / İçerik Ekleme Formu (Eğer admin panelinde varsa otomatik destekler)
        const addFreeGameForm = document.getElementById('addFreeGameForm');
        if (addFreeGameForm) {
            addFreeGameForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('freeGameTitle').value;
                const desc = document.getElementById('freeGameDesc').value;
                const img = document.getElementById('freeGameImg').value; // Resim URL'si

                let freeGames = JSON.parse(localStorage.getItem('cmnx_free_games')) || [];
                freeGames.push({ title, desc, img });
                localStorage.setItem('cmnx_free_games', JSON.stringify(freeGames));

                alert("Ücretsiz oyun/resim başarıyla eklendi ve herkese görünür hale getirildi!");
                addFreeGameForm.reset();
                renderAdminPanel();
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('cmnx_logged');
                window.location.href = "admin-login.html";
            });
        }
    }
});

// Navbar Kullanıcı ve Key Sayısı Durumu
function updateNavbarUserStatus() {
    const navRightActions = document.getElementById('navRightActions');
    if (!navRightActions) return;

    const loggedUser = localStorage.getItem('cmnx_logged_user');
    let library = JSON.parse(localStorage.getItem('cmnx_library')) || [];
    let keyCount = library.length;

    if (loggedUser) {
        navRightActions.innerHTML = `
            <a href="istek.html" class="nav-icon-btn" title="İstek Listesi"><i class="fa-solid fa-cart-shopping"></i></a>
            <div class="user-profile-wrapper">
                <div class="user-profile-badge" id="userProfileBadge" onclick="toggleUserDropdown()">
                    <div class="user-profile-info-wrap">
                        <div class="user-profile-info">
                            <i class="fa-solid fa-user-circle"></i>
                            <span>${loggedUser}</span>
                        </div>
                        <span class="user-profile-subtext">Kütüphanede: ${keyCount} Key</span>
                    </div>
                    <i class="fa-solid fa-chevron-down" style="margin-left: 5px;"></i>
                </div>
                <div class="user-dropdown-menu" id="userDropdownMenu">
                    <a href="kutuphane.html" class="user-dropdown-item"><i class="fa-solid fa-box-archive"></i> Kütüphane</a>
                    <a href="free-games.html" class="user-dropdown-item"><i class="fa-solid fa-gift"></i> Ücretsiz Oyun</a>
                    <a href="kullan.html" class="user-dropdown-item"><i class="fa-solid fa-key"></i> Key Kullan</a>
                    <a href="istek.html" class="user-dropdown-item"><i class="fa-solid fa-paper-plane"></i> İstek Listesi</a>
                    ${loggedUser === 'Admin' ? '<a href="admin.html" class="user-dropdown-item" style="color:#ef4444;"><i class="fa-solid fa-shield-halved"></i> Admin Paneli</a>' : ''}
                    <div class="user-dropdown-divider"></div>
                    <a href="#" class="user-dropdown-item logout-item" onclick="logoutUser()"><i class="fa-solid fa-right-from-bracket"></i> Çıkış Yap</a>
                </div>
            </div>
        `;
    } else {
        navRightActions.innerHTML = `
            <a href="istek.html" class="nav-icon-btn" title="İstek Listesi"><i class="fa-solid fa-cart-shopping"></i></a>
            <a href="giris.html" class="btn-login-nav"><i class="fa-solid fa-right-to-bracket"></i> Giriş Yap</a>
            <a href="kayit.html" class="btn-register-nav"><i class="fa-solid fa-user-plus"></i> Kayıt Ol</a>
        `;
    }
}

// Hediye Seçim Modalı Akışı
function showGiftSelectionModal(item) {
    const existingModal = document.getElementById('giftModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'giftModal';
    modal.className = 'gift-modal-overlay';
    
    let optionsHtml = item.gifts.map((gift, idx) => `
        <label class="gift-radio-item">
            <input type="radio" name="selectedGift" value="${idx}" ${idx === 0 ? 'checked' : ''}>
            <span>${gift.title}</span>
        </label>
    `).join('');

    modal.innerHTML = `
        <div class="gift-modal-box">
            <h3>Hey bu kodun hediyesi var!</h3>
            <p>"${item.title}" koduna ait hediye seçeneklerinden birini seçin:</p>
            <div class="gift-radio-list">
                ${optionsHtml}
            </div>
            <button class="btn-primary" id="modalContinueBtn">Devam Et</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('modalContinueBtn').addEventListener('click', () => {
        const selectedRadio = document.querySelector('input[name="selectedGift"]:checked');
        if (!selectedRadio) return;
        const selectedIndex = parseInt(selectedRadio.value);
        const chosenGift = item.gifts[selectedIndex];

        modal.querySelector('.gift-modal-box').innerHTML = `
            <h3>${chosenGift.title}</h3>
            <p>${chosenGift.desc}</p>
            <button class="btn-primary" id="modalCloseBtn">Kapat</button>
        `;

        document.getElementById('modalCloseBtn').addEventListener('click', () => {
            modal.remove();
            window.location.href = "kutuphane.html";
        });
    });
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');
    const badge = document.getElementById('userProfileBadge');
    if (dropdown && badge) {
        dropdown.classList.toggle('show');
        badge.classList.toggle('active');
    }
}

function logoutUser() {
    localStorage.removeItem('cmnx_logged_user');
    localStorage.removeItem('cmnx_logged');
    alert("Oturum kapatıldı.");
    window.location.reload();
}

function renderLibrary() {
    const libraryGrid = document.getElementById('libraryGrid');
    if (!libraryGrid) return;
    let library = JSON.parse(localStorage.getItem('cmnx_library')) || [];
    
    if (library.length === 0) {
        libraryGrid.innerHTML = `<p style="color:var(--text-muted);">Kütüphanenizde henüz öğe bulunmuyor. Key Kullan sayfasından kod girerek ekleyebilirsiniz.</p>`;
        return;
    }

    libraryGrid.innerHTML = library.map(item => `
        <div class="game-card">
            <div class="game-card-body">
                <h3>${item.title}</h3>
                <p>Tür: ${item.type}</p>
                <span style="color: #10b981; font-size:0.85rem;"><i class="fa-solid fa-check-circle"></i> Aktif Lisans</span>
            </div>
        </div>
    `).join('');
}

function renderFreeGames() {
    const freeGamesGrid = document.getElementById('freeGamesGrid');
    if (!freeGamesGrid) return;
    let freeGames = JSON.parse(localStorage.getItem('cmnx_free_games')) || [];

    freeGamesGrid.innerHTML = freeGames.map((game, index) => `
        <div class="game-card">
            <img src="${game.img}" alt="${game.title}" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80'">
            <div class="game-card-body">
                <h3>${game.title}</h3>
                <p>${game.desc}</p>
                <button class="btn-primary" onclick="alert('${game.title} için indirme bağlantısı yakında eklenecek!')">Hemen Oyna</button>
            </div>
        </div>
    `).join('');
}

function renderAdminPanel() {
    let codes = JSON.parse(localStorage.getItem('cmnx_codes')) || [];
    const adminCodesTable = document.getElementById('adminCodesTable');
    if (adminCodesTable) {
        adminCodesTable.innerHTML = codes.map((c, index) => `
            <tr>
                <td>${c.code}</td>
                <td>${c.title}</td>
                <td>${c.type}</td>
                <td><button class="btn-danger" onclick="deleteCode(${index})">Sil</button></td>
            </tr>
        `).join('');
    }

    let requests = JSON.parse(localStorage.getItem('cmnx_requests')) || [];
    const adminRequestsTable = document.getElementById('adminRequestsTable');
    if (adminRequestsTable) {
        adminRequestsTable.innerHTML = requests.map((r, index) => `
            <tr>
                <td>${r.title}</td>
                <td>${r.desc}</td>
                <td>${r.date}</td>
                <td><button class="btn-danger" onclick="deleteRequest(${index})">Kaldır</button></td>
            </tr>
        `).join('');
    }
}

function deleteCode(index) {
    let codes = JSON.parse(localStorage.getItem('cmnx_codes')) || [];
    codes.splice(index, 1);
    localStorage.setItem('cmnx_codes', JSON.stringify(codes));
    renderAdminPanel();
}

function deleteRequest(index) {
    let requests = JSON.parse(localStorage.getItem('cmnx_requests')) || [];
    requests.splice(index, 1);
    localStorage.setItem('cmnx_requests', JSON.stringify(requests));
    renderAdminPanel();
}