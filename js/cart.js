document.querySelectorAll('.productos').forEach(productos => {
  productos.dataset.originalOrder = [...productos.children]
    .map(card => card.outerHTML)
    .join('');
});
/* TRUE = oculta precios de esa categoría */
const OCULTAR_PRECIOS_CATEGORIA = {
  "Periféricos": false,
  "almacenamiento": false,
  "gabinetes": false,
  "fuentes": false,
  "refrigeración": false,
  "monitores": false,
  "Placas de video": false,
  "red": false,
  "Cables": false,
  "Hardware": false,
  "Placas madres": false,   
  "Memorias Ram": false,
  "Procesadores": false,
  "Sillas y Escritorios Gamer": false,
  "Herramientas": false,
  "Cargadores": false,
  "Notebook": false,
  "Camara de Seguridad": false
};


/* =========================
   CONFIG
========================= */
const MODAL_ENABLED = true;

/* =========================
   CONFIGURACIÓN GLOBAL
========================= */

// 🔒 cambiar a false cuando habilites todo el país
const SOLO_SANTIAGO = true;


/* =========================
   CARRITO
========================= */
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total strong');
const cartCount = document.querySelector('.cart-count');
const btnFinish = document.querySelector('.btn-finish');
const btnClear = document.getElementById('btn-clear-cart');
const btnAbrirTerminos = document.getElementById("btnAbrirTerminos");
const modalTerminos = document.getElementById("modalTerminos");
const cerrarTerminos = document.getElementById("cerrarTerminos");
const aceptaTerminos = document.getElementById("aceptaTerminos");

/* abrir */

btnAbrirTerminos?.addEventListener("click",()=>{
modalTerminos.classList.add("active");
});

/* cerrar */

cerrarTerminos?.addEventListener("click",()=>{
modalTerminos.classList.remove("active");
});

modalTerminos?.addEventListener("click",(e)=>{
if(e.target === modalTerminos){
modalTerminos.classList.remove("active");
}
});
let cart = [];
/* =========================
   ANIMACION AGREGAR CARRITO
========================= */

function animarAgregarCarrito(imgSrc, startElement) {

  const cartIcon = document.querySelector(".cart-icon");
  if (!cartIcon) return;

  const img = document.createElement("img");
  img.src = imgSrc;
  img.className = "fly-product";

  const rectStart = startElement.getBoundingClientRect();
  const rectCart = cartIcon.getBoundingClientRect();

  img.style.left = rectStart.left + "px";
  img.style.top = rectStart.top + "px";

  document.body.appendChild(img);

  requestAnimationFrame(() => {
    img.style.left = rectCart.left + "px";
    img.style.top = rectCart.top + "px";
    img.style.width = "20px";
    img.style.height = "20px";
    img.style.opacity = "0.5";
  });

  setTimeout(() => {

    img.remove();

    cartIcon.classList.add("shake");

    const count = document.querySelector(".cart-count");
    count?.classList.add("bump");

    setTimeout(() => {
      cartIcon.classList.remove("shake");
      count?.classList.remove("bump");
    }, 400);

  }, 700);
}
const selectCuotas = document.getElementById('selectCuotas');
const cuotasPreviewCarrito = document.getElementById('cuotasPreviewCarrito');

/* =========================
   TASAS CUOTAS
========================= */
const tasasCuotas = {
  1: 1.13,
  3: 1.31,
  6: 1.31,
  9: 1.60,
  12: 1.60
};

function calcularTotalConCuotas(totalBase) {

  const infoCuotas = document.querySelector(".cart-cuotas-info");

  if (!selectCuotas || selectCuotas.value === "0" || !pagoTarjeta.checked) {

    if (cuotasPreviewCarrito) cuotasPreviewCarrito.innerHTML = "";
    if (infoCuotas) infoCuotas.innerHTML = "";

    return totalBase;
  }

  const cuotas = parseInt(selectCuotas.value);
  const tasa = tasasCuotas[cuotas];
  if (!tasa) return totalBase;

  const totalConInteres = totalBase * tasa;
  const valorCuota = totalConInteres / cuotas;

  cuotasPreviewCarrito.innerHTML = `
    <div class="cuota-item-carrito">
      <span>${cuotas} cuotas</span>
      <strong>$${Math.round(valorCuota).toLocaleString()}</strong>
    </div>`;

  // 🔥 MENSAJE DEBAJO DEL TOTAL
  if (infoCuotas) {
    infoCuotas.innerHTML = `
      <div class="cart-cuotas-mensaje">
        Pagás ${cuotas} cuotas de 
        <strong>$${Math.round(valorCuota).toLocaleString()}</strong><br>
        <small>
          El pago se concretará dentro de nuestros horarios de atención 🕒 Horarios:
Lunes a viernes de 09:00 a 12:30 hs y de 13:30 a 21:30 hs.
Sábados de 09:00 a 13:00 hs.
        </small>
      </div>
    `;
  }

  return totalConInteres;
}

/* =========================
   OPCIONES ENTREGA / PAGO
========================= */
const retiroLocal = document.getElementById('retiroLocal');
const envioDomicilio = document.getElementById('envioDomicilio');
const pagoEfectivo = document.getElementById('pagoEfectivo');
const pagoTransferencia = document.getElementById('pagoTransferencia');

const inputProvincia = document.getElementById('clienteProvincia');
const inputLocalidad = document.getElementById('clienteLocalidad');

/* =========================
   LOCALIDADES SANTIAGO
========================= */
const localidadesSgo = [
  "Capital","La Banda","Termas de Río Hondo","Añatuya","Frías",
  "Fernández","Monte Quemado","Quimilí","Suncho Corral",
  "Loreto","Clodomira","Beltrán","Forres"
];

if (SOLO_SANTIAGO && inputProvincia) {
  inputProvincia.value = "Santiago del Estero";
  inputProvincia.readOnly = true;
  inputProvincia.style.opacity = "0.7";
}

if (inputLocalidad) {
  const lista = document.createElement('datalist');
  lista.id = "listaLocalidades";

  localidadesSgo.forEach(loc => {
    const option = document.createElement('option');
    option.value = loc;
    lista.appendChild(option);
  });

  document.body.appendChild(lista);
  inputLocalidad.setAttribute("list", "listaLocalidades");

  inputLocalidad.addEventListener('input', () => {
    inputLocalidad.value =
      inputLocalidad.value.charAt(0).toUpperCase() +
      inputLocalidad.value.slice(1);
    validarZonaEnvio();
  });
}

function validarZonaEnvio() {
  if (!envioDomicilio.checked) return;

  const loc = inputLocalidad.value.trim();
  const zonaConEfectivo = loc === "Capital" || loc === "La Banda";

  if (zonaConEfectivo) {
    pagoEfectivo.disabled = false;
  } else {
    pagoEfectivo.checked = false;
    pagoEfectivo.disabled = true;
    pagoTransferencia.checked = true;
  }
}

retiroLocal?.addEventListener('change', () => {
  if (retiroLocal.checked) envioDomicilio.checked = false;
  pagoEfectivo.disabled = false;
});

envioDomicilio?.addEventListener('change', () => {
  if (envioDomicilio.checked) {
    retiroLocal.checked = false;
    validarZonaEnvio();
  }
});

pagoEfectivo?.addEventListener('change', () => {
  if (pagoEfectivo.checked) pagoTransferencia.checked = false;
});

pagoTransferencia?.addEventListener('change', () => {
  if (pagoTransferencia.checked) pagoEfectivo.checked = false;
});

/* =========================
   AGREGAR PRODUCTO
========================= */
document.addEventListener('click', e => {

  const btn = e.target.closest('.btn-add-cart');
  if (!btn) return;

  const card = btn.closest('.card');
  if (!card) return;
  if (card.classList.contains('sin-stock')) return;

  const name = btn.dataset.name;
  const price = parseInt(btn.dataset.price);
  const img = card.dataset.img;

  const item = cart.find(p => p.name === name);

  if (item) {
    item.qty++;
  } else {
    cart.push({ name, price, img, qty: 1 });
  }

  renderCart();
  animarAgregarCarrito(img, btn);

  showCartMessage(); // 🟢 MENSAJE
});

/* =========================
   RENDER
========================= */
function renderCart() {

  cartItems.innerHTML = '';
  let total = 0;
  let count = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;
    count += item.qty;

    cartItems.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}">
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

  cartCount.textContent = count;

  const totalFinal = calcularTotalConCuotas(total);
  cartTotal.textContent = `$${Math.round(totalFinal).toLocaleString()}`;

  mostrarAdvertenciaCantidad();
}
const pagoTarjeta = document.getElementById("pagoTarjetaVisual");
const cuotasPreview = document.getElementById("cuotasPreviewCarrito");

const radiosPago = document.querySelectorAll("input[name='pago']");

radiosPago.forEach(radio => {
  radio.addEventListener("change", () => {

    if (pagoTarjeta.checked) {

      selectCuotas.style.display = "block";
      cuotasPreview.style.display = "block";

    } else {

      selectCuotas.style.display = "none";
      cuotasPreview.style.display = "none";
      selectCuotas.value = "0";
      cuotasPreview.innerHTML = "";

      // 🔥 ESTO ES LO IMPORTANTE
      renderCart(); // recalcula total sin cuotas

    }

  });
});
/* =========================
   ADVERTENCIA CANTIDAD MAYOR A 2
========================= */
function mostrarAdvertenciaCantidad() {

  const vieja = document.querySelector('.cart-warning');
  if (vieja) vieja.remove();

  const hayExceso = cart.some(item => item.qty > 2);
  if (!hayExceso) return;

  const warning = document.createElement('div');
  warning.className = 'cart-warning';

  warning.innerHTML = `
    <strong>⚠ Atención:</strong><br>
    Si solicitás más de 2 unidades de un mismo producto,
    la disponibilidad deberá confirmarse dentro de nuestros horarios de atención.<br><br>
    🕒 <strong>Horarios:</strong><br>
    Lunes a viernes de 09:00 a 12:30 hs y de 13:30 a 21:30 hs.<br>
    Sábados de 09:00 a 13:00 hs.
  `;

  const footer = document.querySelector('.cart-footer');
  footer?.parentNode.insertBefore(warning, footer);
}

/* =========================
   CAMBIAR CANTIDAD
========================= */
window.changeQty = (index, delta) => {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
};

selectCuotas?.addEventListener('change', () => {
  renderCart();
});

/* =========================
   VACIAR
========================= */
btnClear?.addEventListener('click', () => {
  cart = [];
  renderCart();
});

/* =========================
   FINALIZAR COMPRA
========================= */
btnFinish?.addEventListener('click', e => {
  if(!aceptaTerminos.checked){
alert("Debes aceptar los términos y condiciones para continuar.");
return;
}
  e.preventDefault();
  if (!cart.length) return;

  const nombre = document.getElementById('clienteNombre')?.value.trim();
  const localidad = inputLocalidad.value.trim();
  const direccion = document.getElementById('clienteDireccion')?.value.trim();

  if (!retiroLocal.checked && !envioDomicilio.checked) {
    alert('Seleccioná modo de entrega.');
    return;
  }

/* =========================
   VALIDACIÓN FORMA DE PAGO
========================= */

if (!pagoEfectivo.checked && 
    !pagoTransferencia.checked && 
    !pagoTarjeta.checked) {

  alert('Seleccioná forma de pago.');
  return;
}

/* 🔥 NUEVA VALIDACIÓN TARJETA SIN CUOTAS */
if (pagoTarjeta.checked && selectCuotas.value === "0") {
  alert('Seleccioná la cantidad de cuotas para pagar con tarjeta.');
  return;
}

  if (envioDomicilio.checked && (!nombre || !localidad || !direccion)) {
    alert('Para envíos debés completar los datos.');
    return;
  }

  let msg = '🛒 *Pedido PIXIS Informática*%0A%0A';

  msg += `🚚 *Entrega:* ${retiroLocal.checked ? 'Retiro en el local' : 'Envío a domicilio'}%0A`;

  if (envioDomicilio.checked) {
    msg += `%0A👤 ${nombre}%0A📍 ${direccion}%0A🏙️ ${localidad}%0A🗺️ Santiago del Estero%0A`;
  }

  msg += `%0A────────────────────%0A`;

  let total = 0;

  cart.forEach(i => {
    msg += `• ${i.name} x${i.qty} — $${(i.price*i.qty).toLocaleString()}%0A`;
    total += i.price * i.qty;
  });

  const hayExceso = cart.some(item => item.qty > 2);

  if (hayExceso) {
    msg += `%0A⚠ *Aviso:* Se solicitaron más de 2 unidades de uno o más productos.%0A`;
    msg += `La disponibilidad deberá confirmarse dentro de nuestros horarios de atención.%0A`;
    msg += `🕒 Lunes a viernes 09:00–12:30 y 13:30–21:30.%0A`;
    msg += `Sábados 09:00–13:00.%0A`;
  }

/* =========================
   TOTAL Y MÉTODO DE PAGO
========================= */

msg += `%0A────────────────────%0A`;

if (pagoTarjeta.checked && selectCuotas.value !== "0") {

  const cuotas = parseInt(selectCuotas.value);
  const tasa = tasasCuotas[cuotas];

  const totalConInteres = total * tasa;
  const valorCuota = totalConInteres / cuotas;

  msg += `💳 *Pago:* Tarjeta de crédito%0A`;
  msg += `💳 ${cuotas} cuotas de $${Math.round(valorCuota).toLocaleString()}%0A`;
  msg += `💰 *Total final:* $${Math.round(totalConInteres).toLocaleString()}%0A`;
  msg += `%0A⏳ El pago se concretará dentro de nuestros horarios de atención.%0A`;

} else if (pagoEfectivo.checked) {

  msg += `💵 *Pago:* Efectivo%0A`;
  msg += `💰 *Total:* $${Math.round(total).toLocaleString()}%0A`;

} else if (pagoTransferencia.checked) {

  msg += `🏦 *Pago:* Transferencia bancaria%0A`;
  msg += `💰 *Total:* $${Math.round(total).toLocaleString()}%0A`;

}

window.open(`https://wa.me/5493856970135?text=${msg}`, '_blank');
});
function aplicarConfiguracionPreciosCategorias() {

  const categorias = document.querySelectorAll("h3.categoria");

  categorias.forEach(titulo => {

    const nombreCategoria = titulo.id?.trim();
    if (!nombreCategoria) return;

    const ocultar = OCULTAR_PRECIOS_CATEGORIA[nombreCategoria];
    if (ocultar === undefined) return;

    /* =====================================================
       BUSCAR TODO LO QUE PERTENECE A ESTA CATEGORÍA
       (hasta el próximo h3.categoria)
    ===================================================== */

    let nodo = titulo.nextElementSibling;
    const elementosCategoria = [];

    while (nodo && !nodo.classList?.contains("categoria")) {
      elementosCategoria.push(nodo);
      nodo = nodo.nextElementSibling;
    }

    /* =====================================================
       DENTRO DE ESOS ELEMENTOS BUSCAMOS LAS CARDS REALES
    ===================================================== */

    elementosCategoria.forEach(seccion => {

      const cards = seccion.querySelectorAll?.(".card");
      if (!cards) return;

      cards.forEach(card => {

        const precioHTML = card.querySelector(".precio");
        const botonCart  = card.querySelector(".btn-add-cart");
        const botonWsp = card.querySelector('.btn-wsp');

        if (ocultar) {

  const esSinStock = card.classList.contains("sin-stock");

  /* ================================
     SI ES SIN STOCK → PRIORIDAD TOTAL
  ================================== */
  if (esSinStock) {

    if (precioHTML) precioHTML.style.display = "none";
    if (botonCart) botonCart.style.display = "none";

    if (botonWsp) {
      botonWsp.textContent = "NO DISPONIBLE";
      botonWsp.style.color = "#ff0033";
      botonWsp.style.fontWeight = "bold";
    }

    return; // 🔥 corta aquí, no aplica "consultar"
  }

  /* ================================
     STOCK NORMAL PERO PRECIO OCULTO
  ================================== */

  if (!card.dataset.priceBackup && card.dataset.price) {
    card.dataset.priceBackup = card.dataset.price;
  }

  card.dataset.price = "";

  if (precioHTML) precioHTML.style.display = "none";
  if (botonCart) botonCart.style.display = "none";

  if (botonWsp) {

    if (!botonWsp.dataset.textBackup) {
      botonWsp.dataset.textBackup = botonWsp.textContent;
    }

    botonWsp.textContent = "Stock disponible · Consultar Precio";
  }

}
 else {

  /* RESTAURAMOS PRECIO */
  if (card.dataset.priceBackup) {
    card.dataset.price = card.dataset.priceBackup;
  }

  /* MOSTRAMOS PRECIO Y BOTÓN */
  if (precioHTML) precioHTML.style.display = "";
  if (botonCart) botonCart.style.display = "";

  /* RESTAURAMOS TEXTO ORIGINAL */
  if (botonWsp && botonWsp.dataset.textBackup) {
    botonWsp.textContent = botonWsp.dataset.textBackup;
  }

}
      });

    });

  });

}

/* =========================
   INICIO
========================= */
document.addEventListener("DOMContentLoaded", () => {
  aplicarConfiguracionPreciosCategorias();
});
/* =========================
   MODAL PRODUCTO
========================= */
const modal = document.getElementById('modalProduct');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const btnReview = document.getElementById('btnReview');
const btnAddToCart = document.getElementById("btnAddToCart");

let productoActual = null;
let botonOriginal = null;

/* =========================
   ACTUALIZAR PRECIOS
========================= */
function actualizarPreciosModal(precioBase) {

  const precioNumerico = parseFloat(
    precioBase.replace(/\./g, "").replace(",", ".").replace("$", "")
  );

  const contado = precioNumerico;
  const local = precioNumerico * 0.97;
  const lista = precioNumerico * 1.13;

  document.getElementById("precioContado").textContent =
    contado.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  document.getElementById("precioLocal").textContent =
    local.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  document.getElementById("precioLista").textContent =
    lista.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  generarDetalleCuotas(precioNumerico);
}

/* =========================
   PREVIEW CUOTAS
========================= */
function generarPreviewCuotas(precioBase) {

  const modalCuotas = document.getElementById("modalCuotas");
  if (!modalCuotas) return;

  modalCuotas.innerHTML = "";

  const precioNumerico = parseFloat(
    precioBase.replace(/\./g, "").replace(",", ".").replace("$", "")
  );

  Object.keys(tasasCuotas).forEach(cuotas => {

    const tasa = tasasCuotas[cuotas];
    const precioConInteres = precioNumerico * tasa;
    const valorCuota = precioConInteres / cuotas;

    const cuotaFormateada = valorCuota.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS"
    });

    const div = document.createElement("div");
    div.classList.add("cuota-item");

    div.innerHTML = `
      <span>${cuotas}x</span>
      <strong>${cuotaFormateada}</strong>
    `;

    modalCuotas.appendChild(div);

  });
}

/* =========================
   DETALLE CUOTAS
========================= */
function generarDetalleCuotas(precioBase) {

  const lista = document.getElementById("listaCuotas");
  if (!lista) return;

  lista.innerHTML = "";

  Object.keys(tasasCuotas).forEach(cuotas => {

    const tasa = tasasCuotas[cuotas];
    const total = precioBase * tasa;
    const valorCuota = total / cuotas;

    const fila = document.createElement("div");
    fila.classList.add("fila-cuota");

    fila.innerHTML = `
      <span>
        ${cuotas}x 
        <strong>${valorCuota.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS"
        })}</strong>
      </span>

      <span class="total-cuotas">
        Total: ${total.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS"
        })}
      </span>
    `;

    lista.appendChild(fila);
  });
}

/* =========================
   ABRIR MODAL
========================= */
document.addEventListener('click', function (e) {

  if (
    e.target.closest('.btn-add-cart') ||
    e.target.closest('.btn-wsp')
  ) return;

const card = e.target.closest('.card');
if (!card) return;

if (card.classList.contains('sin-stock')) return;
if (!MODAL_ENABLED) return;

const btn = card.querySelector(".btn-add-cart");

productoActual = {
  name: btn.dataset.name,
  price: parseInt(btn.dataset.price),
  img: card.dataset.img
};

// pasar datos al botón del modal
const modalBtn = document.getElementById("btnAddToCart");
modalBtn.dataset.name = productoActual.name;
modalBtn.dataset.price = productoActual.price;

  /* =========================
     GALERÍA
  ========================== */

  const thumbsContainer = document.getElementById("modalThumbs");
  thumbsContainer.innerHTML = "";

  let images = [];

  if (card.dataset.gallery) {
    images = card.dataset.gallery.split(",");
  } else {
    images = [card.dataset.img];
  }

  modalImg.src = images[0];
  resetZoom();

  images.forEach(src => {

    const thumb = document.createElement("img");
    thumb.src = src.trim();

    thumb.addEventListener("click", () => {
      modalImg.src = src.trim();
      resetZoom();
    });

    thumbsContainer.appendChild(thumb);

  });

  resetZoom();
  modalTitle.textContent = card.dataset.title;
  actualizarPreciosModal(card.dataset.price);
  generarPreviewCuotas(card.dataset.price);

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
   BOTÓN AGREGAR AL CARRITO
========================= */

const btnAddModal = document.getElementById("btnAddToCart");

btnAddToCart?.addEventListener("click", () => {

  if (!productoActual) return;

  const item = cart.find(p => p.name === productoActual.name);

  if (item) {
    item.qty++;
  } else {
    cart.push({
      name: productoActual.name,
      price: parseInt(productoActual.price),
      img: productoActual.img,
      qty: 1
    });
  }

  renderCart();
  showCartMessage();
});
/* =========================
   CERRAR MODAL
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
   MODAL CUOTAS
========================= */

const btnVerCuotas = document.getElementById("btnVerCuotas");
const modalCuotasDetalle = document.getElementById("modalCuotasDetalle");
const cerrarCuotas = document.getElementById("cerrarCuotas");

if (btnVerCuotas) {
  btnVerCuotas.addEventListener("click", () => {
    modalCuotasDetalle?.classList.add("active");
  });
}

if (cerrarCuotas) {
  cerrarCuotas.addEventListener("click", () => {
    modalCuotasDetalle?.classList.remove("active");
  });
}

modalCuotasDetalle?.addEventListener("click", (e) => {
  if (e.target === modalCuotasDetalle) {
    modalCuotasDetalle.classList.remove("active");
  }
});

/* =========================
   ZOOM + SCROLL + DOBLE CLICK
========================= */

const zoomContainer = document.getElementById('modalZoom');

let zoomScale = 1;
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;

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

zoomContainer.addEventListener('mousemove', (e) => {
  if (zoomScale === 1) return;

  const rect = zoomContainer.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width * 100;
  const y = (e.clientY - rect.top) / rect.height * 100;

  modalImg.style.transformOrigin = `${x}% ${y}%`;
});

zoomContainer.addEventListener('mouseleave', resetZoom);

zoomContainer.addEventListener('dblclick', (e) => {
  e.preventDefault();

  if (zoomScale > 1) {
    resetZoom();
    return;
  }

  const rect = zoomContainer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const originX = (x / rect.width) * 100;
  const originY = (y / rect.height) * 100;

  modalImg.style.transformOrigin = `${originX}% ${originY}%`;

  zoomScale = 2;
  modalImg.style.transform = `scale(${zoomScale})`;
});

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

  // 🔁 restaurar orden original del DOM
  productos.innerHTML = productos.dataset.originalOrder;

  // 🔎 obtener filtro activo actual
  const filtroActivo = productos
    .previousElementSibling
    .querySelector('.btn-filtro.activo')
    ?.dataset.filter;

  // si no hay filtro activo → no hacer nada más
  if (!filtroActivo || filtroActivo === "todos") return;

  // ✅ reaplicar SOLO el filtro (sin tocar búsqueda)
  productos.querySelectorAll('.card').forEach(card => {

    const subcategoria = card.dataset.subcategoria?.toLowerCase() || "";

    if (subcategoria === filtroActivo.toLowerCase()) {
      card.classList.remove('oculta');
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
const bubble = document.querySelector('.search-bubble');
const bubbleInput = document.getElementById('searchBubbleInput');
const mainSearch = document.getElementById('searchInput');

/* expandir burbuja */
bubble.addEventListener('click', () => {
  bubble.classList.add('active');
  bubbleInput.focus();
});

/* sincronizar con buscador principal */
bubbleInput.addEventListener('input', () => {
  mainSearch.value = bubbleInput.value;
  mainSearch.dispatchEvent(new Event('input'));

  // volver al inicio de los resultados
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* cerrar si queda vacío */
bubbleInput.addEventListener('blur', () => {
  if (!bubbleInput.value.trim()) {
    bubble.classList.remove('active');
  }
});

/* =========================
   WhatsApp dinámico 
========================= */

document.addEventListener("click", function(e) {

    const btnWsp = e.target.closest(".btn-wsp");
    if (!btnWsp) return;

    e.preventDefault();

    const card = btnWsp.closest(".card");
    if (!card) return;

    const titulo = card.dataset.title || "Producto";
    const precio = card.dataset.price || "";
    const subcategoria = card.dataset.subcategoria || "";
    const descripcion = card.dataset.desc || "";
  

    const descCorta = descripcion
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 120);

    const mensaje =
`Hola! 👋
Quiero consultar por este producto:

🖥️ ${titulo}
💰 Precio: ${precio}
📦 Categoría: ${subcategoria}

📝 ${descCorta}...


¿Está disponible?`;

    const telefono = "5493856970135"; // ← TU número real

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
});
const floatButtons = document.querySelectorAll(
  '.wsp-float, .btn-top, .search-bubble, .cart-icon'
);

const footerFollow = document.querySelector('.footer-follow');

function stopFloatsfollowFooter() {

  if (window.innerWidth > 768) return; // solo telefono

  if (!footerFollow) return;

  const footerTop = footerFollow.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;

  // distancia desde donde queremos que se frenen
  const limit = 100; // ← margen antes de "Seguinos"

  if (footerTop < windowHeight - limit) {

    const offset = (windowHeight - limit) - footerTop;

    floatButtons.forEach(btn => {
      btn.style.transform = `translateY(-${offset}px)`;
    });

  } else {

    floatButtons.forEach(btn => {
      btn.style.transform = `translateY(0)`;
    });

  }
}

/* =========================
   STOP FLOATS — DESKTOP (FIX REAL)
========================= */

const floatButtonsDesktop = document.querySelectorAll(
  '.wsp-float, .btn-top, .search-bubble, .cart-icon'
);

const footerDesktop = document.querySelector('.footer-follow');

function stopFloatsDesktop() {

  // 👉 SOLO DESKTOP
  if (window.innerWidth <= 768) return;
  if (!footerDesktop) return;

  // posición REAL del footer dentro del documento
  const footerTop = footerDesktop.offsetTop;
  const footerHeight = footerDesktop.offsetHeight;

  // dónde está el scroll ahora
  const scrollY = window.scrollY + window.innerHeight;

  // distancia antes de tocar el footer
  const limit = 160; // podés ajustar 140 / 180 según estética

  // punto donde deben empezar a frenar
  const stopPoint = footerTop + limit;

  if (scrollY >= stopPoint) {

    const offset = scrollY - stopPoint;

    floatButtonsDesktop.forEach(btn => {
      btn.style.transform = `translateY(-${offset}px)`;
    });

  } else {

    floatButtonsDesktop.forEach(btn => {
      btn.style.transform = 'translateY(0)';
    });

  }
}
window.addEventListener('scroll', () => {
  stopFloatsfollowFooter(); // mobile
  stopFloatsDesktop();      // desktop
});

window.addEventListener('resize', () => {
  stopFloatsfollowFooter();
  stopFloatsDesktop();
});
/* ============================================================
   BLOQUEO TOTAL PARA PRODUCTOS SIN STOCK
   - No abre modal
   - No permite consultar
   - No permite agregar al carrito
   - No ejecuta ningún evento interno
============================================================ */

document.addEventListener('click', function (e) {

  const card = e.target.closest('.card.sin-stock');
  if (!card) return;

  // ❌ Cancela absolutamente todo
  e.preventDefault();
  e.stopImmediatePropagation();

}, true); // ← usamos captura para frenar eventos antes que otros scripts
document.querySelectorAll('.btn-wsp').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
  });
});
/* =========================
   BLOQUEAR SCROLL BODY
========================= */

const toggleCart = document.getElementById('toggle-cart');

toggleCart?.addEventListener('change', () => {
  if (toggleCart.checked) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
const searchBubble = document.querySelector(".search-bubble");

if (toggleCart && searchBubble) {

  toggleCart.addEventListener("change", () => {

    if (window.innerWidth <= 768) {

      if (toggleCart.checked) {
        searchBubble.classList.add("hide-search-bubble");
      } else {
        searchBubble.classList.remove("hide-search-bubble");
      }

    }

  });

}
function showCartMessage(){

  const toast = document.getElementById("cart-toast");

  toast.classList.add("show");

  setTimeout(()=>{
    toast.classList.remove("show");
  },2000);

}
