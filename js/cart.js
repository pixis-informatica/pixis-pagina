document.querySelectorAll('.productos').forEach(productos => {
  productos.dataset.originalOrder = [...productos.children]
    .map(card => card.outerHTML)
    .join('');
});
/* =========================
   CONFIG
========================= */
const MODAL_ENABLED = true;

/* =========================
   CARRITO
========================= */
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total strong');
const cartCount = document.querySelector('.cart-count');
const btnFinish = document.querySelector('.btn-finish');
const btnClear = document.getElementById('btn-clear-cart');

let cart = [];

/* AGREGAR PRODUCTO */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-add-cart');
  if (!btn) return;

  const card = btn.closest('.card');
  if (!card) return;

  if (card.classList.contains('sin-stock')) return;

  const name = btn.dataset.name;
  const price = parseInt(btn.dataset.price);

  const item = cart.find(p => p.name === name);
  item ? item.qty++ : cart.push({ name, price, qty: 1 });

  renderCart();
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
      </div>`;
  });

  cartTotal.textContent = `$${total.toLocaleString()}`;
  cartCount.textContent = count;
}

/* VACIAR CARRITO */
btnClear?.addEventListener('click', () => {
  cart = [];
  renderCart();
});

/* CAMBIAR CANTIDAD */
window.changeQty = (index, delta) => {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
};

/* WHATSAPP */
btnFinish?.addEventListener('click', e => {
  e.preventDefault();
  if (!cart.length) return;

  // 📥 obtener datos ingresados (NO se guardan)
  const nombre = document.getElementById('clienteNombre')?.value.trim();
  const localidad = document.getElementById('clienteLocalidad')?.value.trim();
  const provincia = document.getElementById('clienteProvincia')?.value.trim();
  const direccion = document.getElementById('clienteDireccion')?.value.trim();

  // validación básica
  if (!nombre || !localidad || !provincia || !direccion) {
    alert('Por favor completá tus datos para continuar.');
    return;
  }

  let msg = '🛒 *Pedido PIXIS Informática*%0A%0A';

  msg += `👤 *Cliente:* ${nombre}%0A`;
  msg += `📍 *Dirección:* ${direccion}%0A`;
  msg += `🏙️ *Localidad:* ${localidad}%0A`;
  msg += `🗺️ *Provincia:* ${provincia}%0A`;
  msg += `%0A────────────────────%0A`;

  let total = 0;

  cart.forEach(i => {
    msg += `• ${i.name} x${i.qty} — $${(i.price*i.qty).toLocaleString()}%0A`;
    total += i.price * i.qty;
  });

  msg += `%0A💰 *Total:* $${total.toLocaleString()}`;

  window.open(`https://wa.me/5493856970135?text=${msg}`, '_blank');
});
/* =========================
   MODAL PRODUCTO
========================= */
const modal = document.getElementById('modalProduct');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const btnReview = document.getElementById('btnReview');

/* =========================
   ABRIR MODAL
========================= */
document.addEventListener('click', function (e) {

  // ❌ no abrir si se clickea botones
  if (
    e.target.closest('.btn-add-cart') ||
    e.target.closest('.btn-wsp')
  ) return;

  const card = e.target.closest('.card');
  if (!card) return;

  // 🛑 NUEVO → si está sin stock NO abrir modal
  if (card.classList.contains('sin-stock')) return;

  if (!MODAL_ENABLED) return;

  // cargar datos
  modalImg.src = card.dataset.img;
  resetZoom();
  modalTitle.textContent = card.dataset.title;
  modalPrice.textContent = card.dataset.price;

  modalDesc.innerHTML = card.dataset.desc
    .split('\n')
    .filter(l => l.trim())
    .map(l => `<p>${l}</p>`)
    .join('');

  if (!card.dataset.video) {
    btnReview.style.display = 'none';
  } else {
    btnReview.style.display = 'block';
    btnReview.onclick = () =>
      window.open(card.dataset.video, '_blank');
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
});


/* =========================
   CERRAR MODAL  (solo una vez)
========================= */
function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelector('.modal-close')?.addEventListener('click', closeModal);

document.querySelector('.modal-overlay')?.addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});
/* =========================
   ZOOM CON SCROLL + MOUSE
========================= */

const zoomContainer = document.getElementById('modalZoom');

let zoomScale = 1;
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;

/* hacer zoom con la rueda */
zoomContainer.addEventListener('wheel', (e) => {
  e.preventDefault();

  const rect = zoomContainer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const originX = (x / rect.width) * 100;
  const originY = (y / rect.height) * 100;

  modalImg.style.transformOrigin = `${originX}% ${originY}%`;

  if (e.deltaY < 0) {
    zoomScale += 0.25;
  } else {
    zoomScale -= 0.25;
  }

  zoomScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomScale));
  modalImg.style.transform = `scale(${zoomScale})`;
});

/* mover la lupa */
zoomContainer.addEventListener('mousemove', (e) => {
  if (zoomScale === 1) return;

  const rect = zoomContainer.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width * 100;
  const y = (e.clientY - rect.top) / rect.height * 100;

  modalImg.style.transformOrigin = `${x}% ${y}%`;
});

/* reset automático */
zoomContainer.addEventListener('mouseleave', resetZoom);

/* función reset */
function resetZoom() {
  zoomScale = 1;
  modalImg.style.transform = 'scale(1)';
  modalImg.style.transformOrigin = 'center center';
}
/* =========================
   ORDENAR (sin stock al final)
========================= */
function ordenarProductos(productos, ordenarPorPrecio) {

  // 🔁 si se apaga el switch → restaurar orden original
  if (!ordenarPorPrecio) {
    productos.innerHTML = productos.dataset.originalOrder;

    // reaplicar ocultos por filtro activo
    const filtroActivo = productos
      .previousElementSibling
      .querySelector('.btn-filtro.activo')
      ?.dataset.filter;

    productos.querySelectorAll('.card').forEach(card => {
     // 🚫 ignorar cards de destacados
  const esDestacado = card.closest('.destacados');
  if (esDestacado) {
    card.classList.add('oculta');
    return;}

  const nombre = normalizar(
    card.querySelector('h3')?.textContent || ''
  );

  const desc = normalizar(
    card.querySelector('p')?.textContent || ''
  );

  const sub = normalizar(
    card.dataset.subcategoria?.replace(/-/g, ' ') || ''
  );

  const keywords = `${sub} ${nombre} ${desc}`;

  const match = palabrasBusqueda.some(p =>
    keywords.includes(p)
  );

  if (match) {
    card.classList.remove('oculta', 'filtrando');
    hayResultados = true;
  } else {
    card.classList.add('oculta');
  }
});

    return;
  }

  // ordenar visible
  const cards = [...productos.querySelectorAll('.card')]
    .filter(card => !card.classList.contains('oculta'));

  cards.sort((a, b) => {

    // sin stock al final
    const aNoStock = a.classList.contains('sin-stock');
    const bNoStock = b.classList.contains('sin-stock');

    if (aNoStock && !bNoStock) return 1;
    if (!aNoStock && bNoStock) return -1;

    const priceA = parseInt(
      a.querySelector('.precio')?.textContent.replace(/\D/g, '')
    ) || 0;

    const priceB = parseInt(
      b.querySelector('.precio')?.textContent.replace(/\D/g, '')
    ) || 0;

    return priceA - priceB;
  });

  cards.forEach(card => productos.appendChild(card));
}
/* =========================
   FILTROS + AUTO ORDEN
========================= */
document.querySelectorAll('.filtros-categoria').forEach(filtroGrupo => {

  const botones = filtroGrupo.querySelectorAll('.btn-filtro');
  const ui = filtroGrupo.closest('.categoria-ui');
  const productos = ui.nextElementSibling;
  const toggle = ui.querySelector('.toggle-precio');

  botones.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      // estado activo visual
      botones.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');

      const filter = btn.dataset.filter;

      productos.querySelectorAll('.card').forEach(card => {
        const sub = card.dataset.subcategoria;

        if (filter === 'all' || sub === filter) {

          // mostrar con animación
          card.classList.remove('oculta');
          

          requestAnimationFrame(() => {
            card.classList.remove('filtrando');
          });

        } else {

          // animar salida
          card.classList.add('filtrando');

          setTimeout(() => {
          card.classList.add('oculta');
          card.classList.remove('filtrando');
}, 350);
        }
});
card.classList.remove('oculta');
card.classList.add('filtrando');

requestAnimationFrame(() => {
  card.classList.remove('filtrando');
});
cards.forEach((card, i) => {
  setTimeout(() => {
    card.classList.remove('oculta');
    card.classList.remove('filtrando');
  }, i * 40);
});

      // 🔁 apagar ordenar al cambiar filtro
      if (toggle) toggle.checked = false;

      ordenarProductos(productos, false);
    });
  });

  // switch ordenar por precio
  if (toggle) {
    toggle.addEventListener('change', () => {
      ordenarProductos(productos, toggle.checked);
    });
  }

});

document.querySelectorAll('.toggle-precio').forEach(toggle => {

    toggle.addEventListener('change', () => {

        const productos = toggle
            .closest('.categoria-ui')
            .nextElementSibling;

        ordenarProductos(productos, toggle.checked);
    });

});

function normalizar(texto = '') {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
const SINONIMOS = {
  meca: ['mecanico', 'mecánico', 'mechanical', 'mec'],
  mec: ['mecanico', 'mecánico', 'mechanical', 'meca'],
  mecanico: ['mecánico', 'mechanical', 'mec', 'meca'],
  teclado: ['keyboard', 'key'],
  gabinete: ['case', 'tower', 'gab'],
  mouse: ['raton', 'ratón'],
  auricular: ['headset', 'cascos', 'auri'],
  atx: ['mid tower', 'full tower'],
  rgb: ['rainbow', 'iluminado']
};
function normalizar(texto = '') {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function expandirBusqueda(query) {
  const palabras = query.split(' ');
  let resultado = [...palabras];

  palabras.forEach(p => {
    if (SINONIMOS[p]) {
      resultado.push(...SINONIMOS[p]);
    }
  });

  return resultado;
}

document.querySelectorAll('.card').forEach(card => {
  const title = card.dataset.title || '';
  const sub = card.dataset.subcategoria || '';
  const desc = card.dataset.desc || '';

  const keywords = `${sub} ${title} ${desc}`;
  card.dataset.keywords = normalizar(keywords);
});


/* =========================
   BUSCADOR UNIVERSAL
========================= */

const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');
const tituloNuevos = [...document.querySelectorAll('h2, h3')]
  .find(el => el.textContent.includes('NUEVOS INGRESOS'));

const tituloProductos = [...document.querySelectorAll('h2, h3')]
  .find(el => el.textContent.includes('PRODUCTOS DISPONIBLES'));
const categoriasTitulo = document.querySelectorAll('.categoria');
const categoriasUI = document.querySelectorAll('.categoria-ui');
const categoriasNav = document.querySelector('.categorias-nav');
const productosContainers = document.querySelectorAll('.productos');
const destacadosSection = document.querySelector('.destacados');
function limpiarSeparadores() {
  document.querySelectorAll('.separador-categoria')
    .forEach(el => el.remove());
}
function insertarSeparadoresEntreCategorias() {
  const bloques = [...document.querySelectorAll('.productos')];

  // solo los bloques que tienen cards visibles
  const bloquesConResultados = bloques.filter(bloque =>
    bloque.querySelector('.card:not(.oculta)')
  );

  bloquesConResultados.forEach((bloque, index) => {
    // no poner línea antes del primero
    if (index === 0) return;

    const separador = document.createElement('div');
    separador.className = 'separador-categoria';

    bloque.before(separador);
  });
}

searchInput.addEventListener('input', () => {
 let hayResultados = false;
  const queryRaw = searchInput.value.trim();
  const query = normalizar(queryRaw);
  const palabrasBusqueda = expandirBusqueda(query);
  const buscando = query.length > 0;

/* 🔥 NUEVOS INGRESOS */
if (tituloNuevos) {
  tituloNuevos.style.display = buscando ? 'none' : '';
}

/* 🔁 PRODUCTOS DISPONIBLES → RESULTADOS */
if (tituloProductos) {
  tituloProductos.textContent = buscando
    ? 'RESULTADOS'
    : 'PRODUCTOS DISPONIBLES';
}
/* 🔥 OCULTAR DESTACADOS AL BUSCAR */
if (destacadosSection) {
  destacadosSection.style.display = buscando ? 'none' : '';
}

  productosContainers.forEach(productos => {
    productos.querySelectorAll('.card').forEach(card => {

      const nombre = normalizar(
      card.querySelector('h3')?.textContent || ''
      );

      const desc = normalizar(
      card.querySelector('p')?.textContent || ''
     );

      const sub = normalizar(
      card.dataset.subcategoria?.replace(/-/g, ' ') || ''
     );

      const keywords = `${sub} ${nombre} ${desc}`;

      const match = palabrasBusqueda.some(p => keywords.includes(p));

       if (match) {
           card.classList.remove('oculta', 'filtrando');
           hayResultados = true;
           } else {
             card.classList.add('oculta');
        }
   });
  });

  /* 🔥 OCULTAR UI DE CATEGORÍAS MIENTRAS SE BUSCA */
  const ocultar = buscando;
  categoriasTitulo.forEach(el => el.style.display = ocultar ? 'none' : '');
  categoriasUI.forEach(el => el.style.display = ocultar ? 'none' : '');
  if (categoriasNav) categoriasNav.style.display = ocultar ? 'none' : '';

  /* mensaje sin resultados */
  noResults.style.display = (!hayResultados && buscando) ? 'block' : 'none';
  // ───── separadores visuales entre categorías ─────
limpiarSeparadores();

if (buscando) {
  insertarSeparadoresEntreCategorias();
}

  /* restaurar todo al limpiar */
  if (!buscando) {
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('oculta', 'filtrando');
    });
    noResults.style.display = 'none';
  }
});
