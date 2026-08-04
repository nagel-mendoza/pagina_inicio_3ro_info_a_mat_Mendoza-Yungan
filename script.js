document.addEventListener('DOMContentLoaded', () => {

    // Lista del Carrito de compras y precios base
    let cart = [];
    let selectedQty = 1;
    let selectedPriceUnit = 85; 
    let currentProduct = null;

    const PRECIO_50ML = 85;
    const PRECIO_100ML = 120;

    // -------------------------------------------------------------
    // 1. INYECTAR MODAL DE SELECCIÓN Y DRAWER DEL CARRITO
    // -------------------------------------------------------------
    const modalHTML = `
        <div id="buyConfigModal" class="modal-overlay">
            <div class="modal-container">
                <button class="modal-close-btn" id="closeBuyModal">&times;</button>
                <div class="buy-modal-content">
                    <div class="buy-modal-header">
                        <div class="buy-modal-info">
                            <img id="buyModalImg" src="" alt="" class="buy-modal-thumb">
                            <div>
                                <h3 id="buyModalTitle">Nombre del Producto</h3>
                                <p style="margin:0; color:#aaa; font-size:14px;">Molecule Perfumes</p>
                            </div>
                        </div>
                        
                        <div class="buy-modal-price-box">
                            <span class="price-label">Precio Total</span>
                            <span id="buyModalPrice" class="price-amount">$85</span>
                        </div>
                    </div>
                    
                    <div class="buy-modal-options">
                        <div class="option-group">
                            <label>Presentación:</label>
                            <div class="size-selector">
                                <button class="size-btn active" data-price="${PRECIO_50ML}">50 ml</button>
                                <button class="size-btn" data-price="${PRECIO_100ML}">100 ml</button>
                            </div>
                        </div>

                        <div class="option-group">
                            <label>Cantidad:</label>
                            <div class="quantity-control">
                                <button class="qty-btn" id="btnMinus">-</button>
                                <span id="qtyValue">1</span>
                                <button class="qty-btn" id="btnPlus">+</button>
                            </div>
                        </div>
                    </div>

                    <button id="addToCartConfirmBtn" class="btn-add-to-cart">Agregar al Carrito</button>
                </div>
            </div>
        </div>

        <div id="cartDrawerOverlay" class="cart-drawer-overlay">
            <div class="cart-drawer">
                <div class="cart-drawer-header">
                    <h3>Tu Carrito</h3>
                    <button class="cart-drawer-close" id="closeCartDrawer">&times;</button>
                </div>
                <div id="cartItemsContainer" class="cart-items-container">
                    <p style="color:#777; text-align:center;">El carrito está vacío.</p>
                </div>
                <div class="cart-drawer-footer">
                    <div class="cart-total-row">
                        <span>Total Items:</span>
                        <span id="cartTotalItems">0</span>
                    </div>
                    <div class="cart-total-row" style="margin-top: 5px;">
                        <span>Total a Pagar:</span>
                        <span id="cartTotalPrice" style="color:#25d366; font-size: 18px;">$0</span>
                    </div>
                    <button id="checkoutBtn" class="btn-checkout">Finalizar Compra</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Referencias
    const buyModal = document.getElementById('buyConfigModal');
    const closeBuyModal = document.getElementById('closeBuyModal');
    const buyModalTitle = document.getElementById('buyModalTitle');
    const buyModalImg = document.getElementById('buyModalImg');
    const buyModalPrice = document.getElementById('buyModalPrice');
    const qtyValue = document.getElementById('qtyValue');
    const btnMinus = document.getElementById('btnMinus');
    const btnPlus = document.getElementById('btnPlus');
    const addToCartConfirmBtn = document.getElementById('addToCartConfirmBtn');

    const cartIconBtn = document.getElementById('cartIconBtn');
    const cartCountBadge = document.getElementById('cartCountBadge');
    const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
    const closeCartDrawer = document.getElementById('closeCartDrawer');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalItems = document.getElementById('cartTotalItems');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');

    function updateModalPrice() {
        const total = selectedPriceUnit * selectedQty;
        buyModalPrice.innerText = `$${total}`;
    }

    // -------------------------------------------------------------
    // 2. DETECCIÓN DE BOTÓN "COMPRAR"
    // -------------------------------------------------------------
    document.addEventListener('click', (e) => {
        const buyBtn = e.target.closest('a[href="#comprar"], .btn-primary');
        if (buyBtn && buyBtn.textContent.trim().toLowerCase() === 'comprar') {
            e.preventDefault();
            
            const card = buyBtn.closest('.category-card');
            if (card) {
                const title = card.querySelector('h3') ? card.querySelector('h3').innerText : 'Perfume Molecule';
                const img = card.querySelector('.card-img') ? card.querySelector('.card-img').src : '';
                
                currentProduct = { title, img };
                selectedQty = 1;
                selectedPriceUnit = PRECIO_50ML;

                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.size-btn[data-price="' + PRECIO_50ML + '"]').classList.add('active');

                qtyValue.innerText = selectedQty;
                buyModalTitle.innerText = title;
                buyModalImg.src = img;
                
                updateModalPrice();
                buyModal.classList.add('active');
            }
        }
    });

    if (closeBuyModal) closeBuyModal.addEventListener('click', () => buyModal.classList.remove('active'));

    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            selectedPriceUnit = parseInt(e.target.getAttribute('data-price'));
            updateModalPrice();
        });
    });

    if (btnPlus) {
        btnPlus.addEventListener('click', () => {
            selectedQty++;
            qtyValue.innerText = selectedQty;
            updateModalPrice();
        });
    }

    if (btnMinus) {
        btnMinus.addEventListener('click', () => {
            if (selectedQty > 1) {
                selectedQty--;
                qtyValue.innerText = selectedQty;
                updateModalPrice();
            }
        });
    }

    if (addToCartConfirmBtn) {
        addToCartConfirmBtn.addEventListener('click', () => {
            if (currentProduct) {
                const sizeActiveBtn = document.querySelector('.size-btn.active');
                const sizeActiveText = sizeActiveBtn ? sizeActiveBtn.innerText : '50 ml';
                const itemPriceUnit = sizeActiveBtn ? parseInt(sizeActiveBtn.getAttribute('data-price')) : PRECIO_50ML;

                const existingIndex = cart.findIndex(i => i.title === currentProduct.title && i.size === sizeActiveText);
                
                if (existingIndex > -1) {
                    cart[existingIndex].qty += selectedQty;
                } else {
                    cart.push({
                        title: currentProduct.title,
                        img: currentProduct.img,
                        size: sizeActiveText,
                        unitPrice: itemPriceUnit,
                        qty: selectedQty
                    });
                }

                buyModal.classList.remove('active');
                updateCartUI();
                cartDrawerOverlay.classList.add('active');
            }
        });
    }

    // -------------------------------------------------------------
    // 3. ACTUALIZACIÓN UI DEL CARRITO
    // -------------------------------------------------------------
    function updateCartUI() {
        let totalCount = 0;
        let totalPriceSum = 0;
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="color:#777; text-align:center;">El carrito está vacío.</p>';
        } else {
            cart.forEach((item, index) => {
                totalCount += item.qty;
                const itemSubtotal = item.unitPrice * item.qty;
                totalPriceSum += itemSubtotal;

                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                itemEl.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.title}</h4>
                        <p>${item.size} — Cantidad: <strong>${item.qty}</strong></p>
                        <span style="color:#25d366; font-size:13px; font-weight:bold;">$${itemSubtotal}</span>
                    </div>
                    <button class="cart-item-remove" data-index="${index}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        if (cartCountBadge) cartCountBadge.innerText = totalCount;
        if (cartTotalItems) cartTotalItems.innerText = totalCount;
        if (cartTotalPrice) cartTotalPrice.innerText = `$${totalPriceSum}`;

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                cart.splice(idx, 1);
                updateCartUI();
            });
        });
    }

    if (cartIconBtn) {
        cartIconBtn.addEventListener('click', () => cartDrawerOverlay.classList.add('active'));
    }
    if (closeCartDrawer) {
        closeCartDrawer.addEventListener('click', () => cartDrawerOverlay.classList.remove('active'));
    }
    if (cartDrawerOverlay) {
        cartDrawerOverlay.addEventListener('click', (e) => {
            if (e.target === cartDrawerOverlay) cartDrawerOverlay.classList.remove('active');
        });
    }

    // -------------------------------------------------------------
    // 4. SIMULACIÓN FINALIZAR COMPRA
    // -------------------------------------------------------------
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Tu carrito está vacío. Agrega un producto primero.');
                return;
            }

            alert(`✨ ¡Muchas gracias por tu compra en Molecule! ✨\n\nTotal pagado: ${cartTotalPrice.innerText}\nHemos procesado tu pedido con éxito.`);
            
            cart = [];
            updateCartUI();
            cartDrawerOverlay.classList.remove('active');
        });
    }

    // -------------------------------------------------------------
    // 5. MODAL DE DETALLES TÉCNICOS
    // -------------------------------------------------------------
    if (!document.getElementById('detailsModal')) {
        const detailsModalHTML = `
            <div id="detailsModal" class="modal-overlay">
                <div class="modal-container">
                    <button class="modal-close-btn" id="modalCloseBtn">&times;</button>
                    <div id="modalBody" class="modal-body"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', detailsModalHTML);
    }

    const detailsModal = document.getElementById('detailsModal');
    const modalBody = document.getElementById('modalBody');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    document.addEventListener('click', (e) => {
        const detailsBtn = e.target.closest('.js-details-btn');
        if (detailsBtn) {
            e.preventDefault();
            e.stopPropagation();

            const card = detailsBtn.closest('.category-card');
            if (card) {
                const detailsContent = card.querySelector('.card-details-content');
                if (detailsContent) {
                    modalBody.innerHTML = detailsContent.innerHTML;
                    detailsModal.classList.add('active');
                }
            }
        }
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => detailsModal.classList.remove('active'));
    if (detailsModal) {
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) detailsModal.classList.remove('active');
        });
    }
});

// -------------------------------------------------------------
// LÓGICA DEL BOTÓN DE AYUDA Y BOTÓN DE IDIOMA
// -------------------------------------------------------------
document.addEventListener('click', (e) => {
    // Busca si se hizo clic en el enlace de Ayuda
    const helpTrigger = e.target.closest('a[href="#ayuda"], a[title="Ayuda"]');
    if (helpTrigger) {
        e.preventDefault();
        const helpModal = document.getElementById('helpModal');
        if (helpModal) helpModal.classList.add('active');
    }

    // Cerrar modal de Ayuda
    if (e.target.id === 'closeHelpModal' || e.target.id === 'helpModal') {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) helpModal.classList.remove('active');
    }

    // Botón para Abrir Modal de Idioma
    const langBtn = e.target.closest('#langIconBtn');
    if (langBtn) {
        e.preventDefault();
        const langModal = document.getElementById('langModal');
        if (langModal) langModal.classList.add('active');
    }

    // Cerrar Modal de Idioma
    if (e.target.id === 'closeLangModal' || e.target.id === 'langModal') {
        const langModal = document.getElementById('langModal');
        if (langModal) langModal.classList.remove('active');
    }
});
// =============================================================
// LÓGICA DE LOS 2 CARRUSELES (BANNER PRINCIPAL Y CATEGORÍAS)
// =============================================================

// --- 1. CARRUSEL PRINCIPAL (BANNER) ---
const mainSlides = document.querySelectorAll('.banner-container .slide');
const mainPrevBtn = document.querySelector('.banner-container .prev-arrow');
const mainNextBtn = document.querySelector('.banner-container .next-arrow');
const mainDots = document.querySelectorAll('.banner-container .dot');
let currentMainIndex = 0;

function showMainSlide(index) {
    if (mainSlides.length === 0) return;

    if (index >= mainSlides.length) currentMainIndex = 0;
    else if (index < 0) currentMainIndex = mainSlides.length - 1;
    else currentMainIndex = index;

    mainSlides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentMainIndex);
    });

    mainDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentMainIndex);
    });
}

if (mainPrevBtn && mainNextBtn) {
    mainPrevBtn.addEventListener('click', () => showMainSlide(currentMainIndex - 1));
    mainNextBtn.addEventListener('click', () => showMainSlide(currentMainIndex + 1));
}

mainDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => showMainSlide(idx));
});


// --- 2. CARRUSEL DE CATEGORÍAS ---
const catSlides = document.querySelectorAll('.cat-slide');
const catPrevBtn = document.querySelector('.cat-prev-arrow');
const catNextBtn = document.querySelector('.cat-next-arrow');
const catDots = document.querySelectorAll('.cat-dot');
let currentCatIndex = 0;

function showCatSlide(index) {
    if (catSlides.length === 0) return;

    if (index >= catSlides.length) currentCatIndex = 0;
    else if (index < 0) currentCatIndex = catSlides.length - 1;
    else currentCatIndex = index;

    catSlides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentCatIndex);
    });

    catDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentCatIndex);
    });
}

if (catPrevBtn && catNextBtn) {
    catPrevBtn.addEventListener('click', () => showCatSlide(currentCatIndex - 1));
    catNextBtn.addEventListener('click', () => showCatSlide(currentCatIndex + 1));
}

catDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => showCatSlide(idx));
});
// =============================================================
// LÓGICA DEL BOTÓN Y MODAL MI CUENTA / AUTENTICACIÓN
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
    const accountBtn = document.querySelector('a[href="#cuenta"]');
    const accountModal = document.getElementById('accountModal');
    const closeAccountModal = document.getElementById('closeAccountModal');
    const userDropdown = document.getElementById('userDropdown');
    
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    const userNameDisplay = document.getElementById('userNameDisplay');
    const btnLogoutBtn = document.getElementById('btnLogoutBtn');

    // Cambiar Pestañas Login/Registro
    if (tabLoginBtn && tabRegisterBtn) {
        tabLoginBtn.addEventListener('click', () => {
            tabLoginBtn.classList.add('active');
            tabRegisterBtn.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });

        tabRegisterBtn.addEventListener('click', () => {
            tabRegisterBtn.classList.add('active');
            tabLoginBtn.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }

    // Comprobar estado de Sesión
    function checkAuth() {
        const currentUser = JSON.parse(localStorage.getItem('molecule_user'));
        return currentUser;
    }

    // Evento al presionar el icono de Cuenta
    if (accountBtn) {
        accountBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const user = checkAuth();

            if (user) {
                // Si el usuario existe, mostrar/ocultar menú desplegable
                userNameDisplay.textContent = user.name;
                userDropdown.classList.toggle('active');
            } else {
                // Si no hay sesión, abrir modal de login
                accountModal.classList.add('active');
            }
        });
    }

    // Cerrar Modal
    if (closeAccountModal) {
        closeAccountModal.addEventListener('click', () => {
            accountModal.classList.remove('active');
        });
    }

    // Guardar usuario al Iniciar Sesión (Simulado)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const name = email.split('@')[0]; // Usa la primera parte del correo como nombre
            
            localStorage.setItem('molecule_user', JSON.stringify({ name: name, email: email }));
            accountModal.classList.remove('active');
            alert(`¡Bienvenido de nuevo, ${name}!`);
        });
    }

    // Guardar usuario al Registrarse
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            
            localStorage.setItem('molecule_user', JSON.stringify({ name: name, email: email }));
            accountModal.classList.remove('active');
            alert(`¡Cuenta creada con éxito! Bienvenido, ${name}.`);
        });
    }

    // Cerrar Sesión
    if (btnLogoutBtn) {
        btnLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('molecule_user');
            userDropdown.classList.remove('active');
            alert('Has cerrado sesión correctamente.');
        });
    }

    // Cerrar menú si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (accountBtn && !accountBtn.contains(e.target) && userDropdown && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
});
// =============================================================
// LÓGICA DEL TEST OLFATIVO
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
    const quizModal = document.getElementById('quizModal');
    const closeQuizModal = document.getElementById('closeQuizModal');
    const quizSteps = document.querySelectorAll('.quiz-step');
    const quizResult = document.getElementById('quizResult');
    
    // Botones de las opciones
    const optButtons = document.querySelectorAll('.quiz-opt-btn');
    
    // Botón para abrir el quiz (Asegúrate de agregar id="btnOpenQuiz" al botón de tu menú)
    const btnOpenQuiz = document.getElementById('btnOpenQuiz');

    let userAnswers = [];
    let currentStep = 1;

    // Abrir Modal
    if (btnOpenQuiz && quizModal) {
        btnOpenQuiz.addEventListener('click', (e) => {
            e.preventDefault();
            resetQuiz();
            quizModal.classList.add('active');
        });
    }

    // Cerrar Modal
    if (closeQuizModal && quizModal) {
        closeQuizModal.addEventListener('click', () => {
            quizModal.classList.remove('active');
        });
    }

    // Manejar selección de respuestas
    optButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-value');
            userAnswers.push(val);

            // Ocultar paso actual
            document.querySelector(`.quiz-step[data-step="${currentStep}"]`).classList.remove('active');

            currentStep++;

            if (currentStep <= quizSteps.length) {
                // Mostrar siguiente paso
                document.querySelector(`.quiz-step[data-step="${currentStep}"]`).classList.add('active');
            } else {
                // Calcular y mostrar resultado
                showResult();
            }
        });
    });

    function showResult() {
        quizResult.style.display = 'block';

        const nameEl = document.getElementById('resultPerfumeName');
        const descEl = document.getElementById('resultPerfumeDesc');
        const linkEl = document.getElementById('resultPerfumeLink');

        // Lógica simple de recomendación según la última respuesta
        const lastAns = userAnswers[userAnswers.length - 1];

        if (lastAns === 'maderas' || userAnswers.includes('elegancia')) {
            nameEl.textContent = "Aromas Amaderados & Especiados";
            descEl.textContent = "Perfumes intensos con notas de sándalo, cedro y pimienta. Ideales para dejar huella.";
            linkEl.href = "productos.html#amaderados";
        } else if (lastAns === 'vainilla' || userAnswers.includes('dulzura')) {
            nameEl.textContent = "Fragancias Dulces & Gourmet";
            descEl.textContent = "Notas cálidas de ambar, vainilla y tonka. Seducción y confort para ocasiones especiales.";
            linkEl.href = "productos.html#dulces";
        } else {
            nameEl.textContent = "Aromas Cítricos & Marinos";
            descEl.textContent = "Frescura vibrante de bergamota, limón y brisa marina. Perfectos para tu uso diario.";
            linkEl.href = "productos.html#citricos";
        }
    }

    function resetQuiz() {
        userAnswers = [];
        currentStep = 1;
        quizResult.style.display = 'none';
        quizSteps.forEach((step, idx) => {
            if (idx === 0) step.classList.add('active');
            else step.classList.remove('active');
        });
    }
});
// =============================================================
// LÓGICA DEL MODO REGALO
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
    const giftModal = document.getElementById('giftModal');
    const closeGiftModal = document.getElementById('closeGiftModal');
    const giftForm = document.getElementById('giftForm');
    
    // Botón para abrir el modal de regalo (Asegúrate de agregar este ID en tu menú)
    const btnOpenGift = document.getElementById('btnOpenGift');

    // Abrir Modal
    if (btnOpenGift && giftModal) {
        btnOpenGift.addEventListener('click', (e) => {
            e.preventDefault();
            giftModal.classList.add('active');
        });
    }

    // Cerrar Modal
    if (closeGiftModal && giftModal) {
        closeGiftModal.addEventListener('click', () => {
            giftModal.classList.remove('active');
        });
    }

    // Guardar opciones de regalo en localStorage
    if (giftForm) {
        giftForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const giftData = {
                boxType: document.getElementById('giftBoxType').value,
                recipient: document.getElementById('giftRecipient').value,
                message: document.getElementById('giftMessage').value
            };

            localStorage.setItem('molecule_gift', JSON.stringify(giftData));
            giftModal.classList.remove('active');
            
            alert(`¡Empaque de regalo guardado con éxito para ${giftData.recipient}! Se aplicará a tu próximo pedido.`);
            giftForm.reset();
        });
    }
});
// =============================================================
// LÓGICA DEL BUSCADOR RÁPIDO
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
    const searchModal = document.getElementById('searchModal');
    const closeSearchModal = document.getElementById('closeSearchModal');
    const btnOpenSearch = document.getElementById('btnOpenSearch');
    const searchInput = document.getElementById('searchInput');
    const executeSearchBtn = document.getElementById('executeSearchBtn');
    const searchResults = document.getElementById('searchResults');

    // Base de datos simulada de productos/categorías para buscar
    const searchableItems = [
        { name: "Aromas Cítricos (Bergamota y Limón)", link: "productos.html#citricos", tag: "Cítricos" },
        { name: "Le Beau - Especificaciones Técnicas", link: "productos.html#citricos", tag: "Perfume" },
        { name: "Aromas Amaderados & Especiados", link: "productos.html#amaderados", tag: "Amaderados" },
        { name: "Fragancias Dulces & Gourmet", link: "productos.html#dulces", tag: "Dulces" },
        { name: "Test Olfativo Molecule", link: "#", tag: "Herramienta", action: "openQuiz" },
        { name: "Modo Regalo Especial", link: "#", tag: "Servicio", action: "openGift" }
    ];

    // Abrir modal de búsqueda
    if (btnOpenSearch && searchModal) {
        btnOpenSearch.addEventListener('click', (e) => {
            e.preventDefault();
            searchModal.classList.add('active');
            if (searchInput) searchInput.focus();
        });
    }

    // Cerrar modal de búsqueda
    if (closeSearchModal && searchModal) {
        closeSearchModal.addEventListener('click', () => {
            searchModal.classList.remove('active');
        });
    }

    // Función de búsqueda en tiempo real
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === "") {
            searchResults.innerHTML = `<p class="search-placeholder-text">Escribe algo para comenzar la búsqueda...</p>`;
            return;
        }

        const filtered = searchableItems.filter(item => 
            item.name.toLowerCase().includes(query) || item.tag.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            searchResults.innerHTML = `<p class="search-placeholder-text">No se encontraron resultados para "${query}".</p>`;
            return;
        }

        let html = '';
        filtered.forEach(item => {
            html += `
                <a href="${item.link}" class="search-result-item" onclick="handleSearchResult('${item.action}')">
                    <span>${item.name}</span>
                    <span class="card-tag" style="font-size: 11px; padding: 2px 6px;">${item.tag}</span>
                </a>
            `;
        });
        searchResults.innerHTML = html;
    }

    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }
    
    if (executeSearchBtn) {
        executeSearchBtn.addEventListener('click', performSearch);
    }
});

// Función auxiliar para acciones especiales desde el buscador
function handleSearchResult(action) {
    const searchModal = document.getElementById('searchModal');
    if (searchModal) searchModal.classList.remove('active');

    if (action === 'openQuiz') {
        const quizModal = document.getElementById('quizModal');
        if (quizModal) quizModal.classList.add('active');
    } else if (action === 'openGift') {
        const giftModal = document.getElementById('giftModal');
        if (giftModal) giftModal.classList.add('active');
    }
}