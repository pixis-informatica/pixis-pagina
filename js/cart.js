const MODAL_ENABLED = false; // ← cambiar a true cuando quieras activarlo
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total strong');
const cartCount = document.querySelector('.cart-count');
const btnFinish = document.querySelector('.btn-cart');

let cart = [];

/* AGREGAR PRODUCTO */
document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price);

        const item = cart.find(p => p.name === name);

        if (item) {
            item.qty++;
        } else {
            cart.push({ name, price, qty: 1 });
        }

        renderCart();
    });
});

/* RENDER */
function renderCart() {
    cartItems.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        count += item.qty;

        cartItems.innerHTML += `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <span>$${item.price.toLocaleString()}</span>
                </div>

                <div class="cart-qty">
                    <button onclick="changeQty(${index}, -1)">−</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${index}, 1)">+</button>
                </div>
            </div>
        `;
    });

    cartTotal.textContent = `$${total.toLocaleString()}`;
    cartCount.textContent = count;
}

/* CAMBIAR CANTIDAD */
window.changeQty = function(index, delta) {
    cart[index].qty += delta;

    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    renderCart();
};

/* ENVIAR A WHATSAPP */
btnFinish.addEventListener('click', (e) => {
    e.preventDefault(); 

    if (cart.length === 0) return;

    let message = '🛒 *Pedido PIXIS Informática*%0A%0A';
    let total = 0;

    cart.forEach(item => {
        message += `• ${item.name} x${item.qty} — $${(item.price * item.qty).toLocaleString()}%0A`;
        total += item.price * item.qty;
    });

    message += `%0A*Total:* $${total.toLocaleString()}`;


    const phone = '5493856970135'; 
    const url = `https://wa.me/${phone}?text=${message}`;

    window.open(url, '_blank');
});
const modal = document.getElementById('modalProduct');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');

document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {

        // ❌ si el modal está desactivado, no hace nada
        if (!MODAL_ENABLED) return;

        // ❌ no abrir modal si clickea botones
        if (
            e.target.closest('.btn-add-cart') ||
            e.target.closest('.btn-wsp')
        ) return;

        modalImg.src = card.dataset.img;
        modalTitle.textContent = card.dataset.title;
        modalDesc.textContent = card.dataset.desc;
        modalPrice.textContent = card.dataset.price;

        modal.classList.add('active');
    });
});


document.querySelector('.modal-close').onclick = () =>
    modal.classList.remove('active');

document.querySelector('.modal-overlay').onclick = () =>
    modal.classList.remove('active');
/* =========================
   ORDENAR POR PRECIO
   (por categoría)
========================= */

document.querySelectorAll('.sortPrice').forEach(btn => {

    let isSorted = false;

    const productos = btn
        .closest('.ordenar-productos')
        .nextElementSibling;

    if (!productos || !productos.classList.contains('productos')) return;

    const originalCards = Array.from(productos.children);

    const applySinStockLast = (cards) =>
        cards.sort((a, b) => {
            const aNo = a.classList.contains('sin-stock');
            const bNo = b.classList.contains('sin-stock');
            if (aNo && !bNo) return 1;
            if (!aNo && bNo) return -1;
            return 0;
        });

    // aplicar sin-stock al cargar
    applySinStockLast([...productos.children])
        .forEach(card => productos.appendChild(card));

    btn.addEventListener('click', () => {

        const cards = Array.from(productos.children);

        /* FLIP — FIRST */
        const firstPositions = new Map();
        cards.forEach(card => {
            firstPositions.set(card, card.getBoundingClientRect());
        });

        let ordered;

        if (!isSorted) {
            ordered = cards.sort((a, b) => {

                const aNo = a.classList.contains('sin-stock');
                const bNo = b.classList.contains('sin-stock');
                if (aNo && !bNo) return 1;
                if (!aNo && bNo) return -1;

                const priceA =
                    parseInt(a.querySelector('.precio')?.textContent.replace(/\D/g, '')) || 0;
                const priceB =
                    parseInt(b.querySelector('.precio')?.textContent.replace(/\D/g, '')) || 0;

                return priceA - priceB;
            });

            btn.textContent = 'Orden original';

        } else {
            ordered = applySinStockLast([...originalCards]);
            btn.textContent = 'Ordenar por precio';
        }

        ordered.forEach(card => productos.appendChild(card));

        /* FLIP — LAST + INVERT */
        ordered.forEach(card => {
            const last = card.getBoundingClientRect();
            const first = firstPositions.get(card);

            const dx = first.left - last.left;
            const dy = first.top - last.top;

            card.style.transform = `translate(${dx}px, ${dy}px)`;
            card.style.transition = 'none';

            requestAnimationFrame(() => {
                card.style.transition = 'transform 0.45s ease';
                card.style.transform = '';
            });
        });

        isSorted = !isSorted;
    });
});
