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
// Declaramos el índice actual del slide
let currentSlide = 0;
const slides = document.querySelectorAll('.slide'); // Ajusta a tus clases reales
const totalSlides = slides.length;
const dots = document.querySelectorAll('.dot'); // Los circulitos

function showSlide(index) {
  // Manejo de límites circular
  if (index >= totalSlides) currentSlide = 0;
  else if (index < 0) currentSlide = totalSlides - 1;
  else currentSlide = index;

  // Mover contenedor o mostrar/ocultar slides
  const container = document.querySelector('.slider-container');
  container.style.transform = `translateX(-${currentSlide * 100}%)`;

  // Actualizar estado de los puntos (dots)
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlide);
  });
}

// Asignar eventos a las flechas
document.querySelector('.prev-arrow').addEventListener('click', () => {
  showSlide(currentSlide - 1);
});

document.querySelector('.next-arrow').addEventListener('click', () => {
  showSlide(currentSlide + 1);
});

// Asignar eventos a los circulitos
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showSlide(index);
  });
});