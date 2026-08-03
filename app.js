/* ==========================================================
   LÓGICA INTERACTIVA Y AUTOMATIZACIÓN - app.js
   ========================================================== */

// 1. BASE DE DATOS DEL NEGOCIO (MANDATORIA)
// Se usan los nombres exactos de imágenes y precios indicados.
const bdMenu = {
    'carnes': [
        { 
            id: 'c1', 
            nombre: 'Especial de Carnes Premium', 
            desc: 'Incluye Churrasco al Grill o Lomo de Res, chimichurri artesanal, gallopinto gourmet, tostones maduros y ensalada criolla.', 
            precio: 380, 
            img: 'plato1.jpg' 
        }
    ],
    'mariscos': [
        { 
            id: 'm1', 
            nombre: 'Marisconas y Mariscos Selectos', 
            desc: 'Sopa de mariscos concentrada de la casa (Macarela, camarón, jaiba) o Filete de pescado frito a la Tipitapa.', 
            precio: 450, 
            img: 'plato2.jpg' 
        }
    ],
    'antojitos': [
        { 
            id: 'a1', 
            nombre: 'Antojitos Universitarios', 
            desc: 'Combo de Hamburguesa Artesanal "La Feroz" o Alitas Picantes con papas fritas y bebida.', 
            precio: 220, 
            img: 'plato3.jpg' 
        }
    ],
    'buffet': [
        { 
            id: 'b1', 
            nombre: 'Buffet Tradicional para Eventos', 
            desc: 'Mínimo 20 personas. Incluye 1 proteína a elegir, arroz de la casa, ensalada gourmet, guarnición y refresco natural.', 
            precio: 320, 
            img: 'plato4.jpg' 
        },
        { 
            id: 'b2', 
            nombre: 'Buffet Gala y Banquetes VIP', 
            desc: 'Mínimo 15 personas. Incluye 2 proteínas selectas, 2 guarniciones finas, estación de postres y barra de café ilimitada.', 
            precio: 540, 
            img: 'plato5.jpg' 
        }
    ]
};

// URL Ultra-estable de Respaldo (Fallback)
const IMG_FALLBACK = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";

// Estado de la Aplicación
let cotizacion = {}; 
let cantTemporales = {};

// Referencias DOM
const dom = {
    btnMenuMobile: document.getElementById('btn-mobile-menu'),
    panelMobile: document.getElementById('mobile-menu'),
    dropdown: document.getElementById('menu-dropdown'),
    gridPlatos: document.getElementById('platos-grid'),
    
    btnCartOpen: document.getElementById('btn-cart-open'),
    btnCartClose: document.getElementById('btn-cart-close'),
    sidebarCont: document.getElementById('sidebar-container'),
    sidebarOver: document.getElementById('sidebar-overlay'),
    sidebarPan: document.getElementById('sidebar-panel'),
    listaProforma: document.getElementById('proforma-items'),
    totalText: document.getElementById('proforma-total'),
    badgeCount: document.getElementById('cart-count'),
    
    form: document.getElementById('form-contacto'),
    btnN8n: document.getElementById('btn-n8n'),
    btnTelegram: document.getElementById('btn-telegram'),
    msgStatus: document.getElementById('status-msg')
};

// 2. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    renderizarMenu(dom.dropdown.value);
    
    // Listeners
    dom.dropdown.addEventListener('change', (e) => renderizarMenu(e.target.value));
    dom.btnMenuMobile.addEventListener('click', () => dom.panelMobile.classList.toggle('hidden'));
    
    dom.btnCartOpen.addEventListener('click', toggleSidebar);
    dom.btnCartClose.addEventListener('click', toggleSidebar);
    dom.sidebarOver.addEventListener('click', toggleSidebar);
    
    dom.form.addEventListener('submit', procesarN8n);
    dom.btnTelegram.addEventListener('click', procesarTelegram);
});

// 3. RENDERIZADO DEL CATÁLOGO DE COMIDA
function renderizarMenu(categoria) {
    const items = bdMenu[categoria];
    dom.gridPlatos.innerHTML = '';
    cantTemporales = {}; 

    items.forEach(plato => {
        cantTemporales[plato.id] = 1; // Default
        
        // El contenedor 'aspect-[4/3] flex items-center justify-center' 
        // y la img 'absolute inset-0 object-cover object-center' garantizan el centrado y la simetría.
        const html = `
            <div class="bg-darker border border-white/5 rounded-xl overflow-hidden shadow-lg flex flex-col group h-full">
                <!-- Zona de Imagen -->
                <div class="aspect-[4/3] w-full relative overflow-hidden bg-dark flex items-center justify-center">
                    <img 
                        src="${plato.img}" 
                        onerror="this.onerror=null;this.src='${IMG_FALLBACK}';" 
                        alt="${plato.nombre}" 
                        class="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                    >
                    <div class="absolute top-3 right-3 bg-dark/80 backdrop-blur-sm text-gold font-semibold px-3 py-1 rounded-md text-sm shadow-md">
                        C$ ${plato.precio.toLocaleString()}
                    </div>
                </div>
                
                <!-- Zona de Información -->
                <div class="p-5 flex flex-col flex-1">
                    <h3 class="text-xl text-gold mb-2 leading-tight font-medium">${plato.nombre}</h3>
                    <p class="text-gray-400 text-sm mb-6 flex-1">${plato.desc}</p>
                    
                    <div class="mt-auto space-y-4">
                        <!-- Botones +/- -->
                        <div class="flex items-center justify-between bg-dark rounded-lg border border-white/10 p-1">
                            <button type="button" onclick="cambiarTemp('${plato.id}', -1)" class="w-12 h-10 flex items-center justify-center text-gray-300 bg-white/5 rounded hover:bg-white/10 transition">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                            </button>
                            <span id="tmp-${plato.id}" class="text-lg font-semibold w-8 text-center text-white">1</span>
                            <button type="button" onclick="cambiarTemp('${plato.id}', 1)" class="w-12 h-10 flex items-center justify-center text-gold bg-white/5 rounded hover:bg-white/10 transition">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>
                        
                        <button type="button" onclick="anexar('${categoria}', '${plato.id}')" class="w-full bg-gold/10 border border-gold text-gold py-3.5 rounded-lg font-medium hover:bg-gold hover:text-darker transition shadow-sm">
                            Anexar a la Proforma
                        </button>
                    </div>
                </div>
            </div>
        `;
        dom.gridPlatos.insertAdjacentHTML('beforeend', html);
    });
}

function cambiarTemp(id, valor) {
    let cant = cantTemporales[id] + valor;
    if (cant < 1) cant = 1;
    cantTemporales[id] = cant;
    document.getElementById(`tmp-${id}`).innerText = cant;
}

// 4. LÓGICA DE COTIZACIÓN
function anexar(categoria, id) {
    const platoData = bdMenu[categoria].find(i => i.id === id);
    const qty = cantTemporales[id];

    if (cotizacion[id]) {
        cotizacion[id].qty += qty;
    } else {
        cotizacion[id] = { ...platoData, qty: qty };
    }
    
    // Reseteo visual del contador temporal
    cantTemporales[id] = 1;
    document.getElementById(`tmp-${id}`).innerText = 1;

    actualizarInterfaz();
    
    // Abre modal si está cerrado
    if(dom.sidebarCont.classList.contains('invisible')) {
        toggleSidebar();
    }
}

function actualizarInterfaz() {
    dom.listaProforma.innerHTML = '';
    let totalDinero = 0;
    let totalArticulos = 0;

    const ids = Object.keys(cotizacion);

    if (ids.length === 0) {
        dom.listaProforma.innerHTML = '<p class="text-gray-500 text-center py-6 text-sm">No hay platillos anexados aún.</p>';
    } else {
        ids.forEach(id => {
            const el = cotizacion[id];
            totalDinero += (el.precio * el.qty);
            totalArticulos += el.qty;

            const cardHTML = `
                <div class="bg-darker p-3.5 rounded-lg border border-white/5 flex flex-col">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="text-sm font-medium text-white pr-2 leading-snug">${el.nombre}</h5>
                        <button type="button" onclick="eliminarPlato('${id}')" class="text-red-400 p-1 -mt-1 -mr-1">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gold font-medium">C$ ${el.precio.toLocaleString()}</span>
                        <div class="flex items-center bg-dark rounded border border-white/10">
                            <button type="button" onclick="modificarCantidad('${id}', -1)" class="text-gray-400 px-3 py-1 text-lg hover:text-white">-</button>
                            <span class="text-sm w-6 text-center text-white font-semibold">${el.qty}</span>
                            <button type="button" onclick="modificarCantidad('${id}', 1)" class="text-gold px-3 py-1 text-lg hover:text-white">+</button>
                        </div>
                    </div>
                </div>
            `;
            dom.listaProforma.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    dom.totalText.innerText = totalDinero.toLocaleString();
    dom.badgeCount.innerText = totalArticulos;
}

function modificarCantidad(id, delta) {
    cotizacion[id].qty += delta;
    if (cotizacion[id].qty <= 0) delete cotizacion[id];
    actualizarInterfaz();
}

function eliminarPlato(id) {
    delete cotizacion[id];
    actualizarInterfaz();
}

function toggleSidebar() {
    const isHidden = dom.sidebarCont.classList.contains('invisible');
    
    if (isHidden) {
        dom.sidebarCont.classList.remove('invisible');
        setTimeout(() => {
            dom.sidebarOver.classList.remove('opacity-0');
            dom.sidebarOver.classList.add('opacity-100');
            dom.sidebarPan.classList.remove('translate-x-full');
        }, 10);
    } else {
        dom.sidebarOver.classList.remove('opacity-100');
        dom.sidebarOver.classList.add('opacity-0');
        dom.sidebarPan.classList.add('translate-x-full');
        setTimeout(() => {
            dom.sidebarCont.classList.add('invisible');
        }, 300);
    }
}

// 5. RECOPILACIÓN Y ENVÍO DE DATOS
function crearPayloadJSON() {
    return {
        cliente: document.getElementById('inp-nombre').value,
        correo: document.getElementById('inp-correo').value,
        telefono: document.getElementById('inp-tel').value,
        fecha_evento: document.getElementById('inp-fecha').value,
        notas: document.getElementById('inp-notas').value,
        pedidos: Object.values(cotizacion).map(p => ({
            producto: p.nombre, 
            cantidad: p.qty, 
            precio_unitario: p.precio, 
            subtotal: p.qty * p.precio
        })),
        total_cordobas: Object.values(cotizacion).reduce((a, c) => a + (c.precio * c.qty), 0)
    };
}

function notificar(msg, esError) {
    dom.msgStatus.innerText = msg;
    dom.msgStatus.className = `text-sm text-center font-medium py-3 rounded-lg block mt-4 ${esError ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`;
}

// Enviar a Webhook de n8n
async function procesarN8n(e) {
    e.preventDefault();
    if (Object.keys(cotizacion).length === 0) return alert("Agrega platillos a la proforma antes de enviar.");

    const payload = crearPayloadJSON();
    const textoOriginal = dom.btnN8n.innerText;
    
    dom.btnN8n.innerText = 'Procesando...';
    dom.btnN8n.disabled = true;
    dom.msgStatus.classList.add('hidden');

    // === URL DEL WEBHOOK N8N ===
    const URL_WEBHOOK = 'https://tu-dominio-n8n.com/webhook/proforma';

    try {
        // Simulación para prueba visual (Descomentar fetch para producción)
        await new Promise(r => setTimeout(r, 1200)); 
        /*
        const response = await fetch(URL_WEBHOOK, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        if(!response.ok) throw new Error("Fallo en la respuesta del servidor");
        */
        
        notificar("¡Proforma enviada al sistema! Te contactaremos pronto.", false);
        limpiarSistema();
    } catch (error) {
        notificar("Error de conexión. Usa el botón de Telegram.", true);
    } finally {
        dom.btnN8n.innerText = textoOriginal;
        dom.btnN8n.disabled = false;
    }
}

// Generador de Mensaje Markdown para Telegram
function procesarTelegram() {
    if (!dom.form.checkValidity()) return dom.form.reportValidity();
    if (Object.keys(cotizacion).length === 0) return alert("Agrega platillos a la proforma antes de enviar.");

    const pl = crearPayloadJSON();
    
    // Formateo Limpio con Markdown de Telegram
    let md = `🧾 *PROFORMA - RESTAURANTE EL LOBITO*\n\n`;
    md += `👤 *Cliente:* ${pl.cliente}\n`;
    md += `✉️ *Correo:* ${pl.correo}\n`;
    md += `📞 *Teléfono:* ${pl.telefono}\n`;
    md += `📅 *Fecha del Evento:* ${pl.fecha_evento}\n`;
    if(pl.notas) md += `📝 *Notas Extra:* ${pl.notas}\n`;
    md += `\n🍽 *SERVICIOS SOLICITADOS:*\n`;
    
    pl.pedidos.forEach(p => {
        md += `▪️ ${p.cantidad}x ${p.producto} (C$ ${p.subtotal.toLocaleString()})\n`;
    });
    md += `\n💰 *TOTAL ESTIMADO: C$ ${pl.total_cordobas.toLocaleString()}*`;

    // === URL DEL BOT DE TELEGRAM ===
    const urlBot = `https://t.me/TuBotTelegram?text=${encodeURIComponent(md)}`;
    window.open(urlBot, '_blank');
    
    limpiarSistema();
}

function limpiarSistema() {
    cotizacion = {};
    actualizarInterfaz();
    dom.form.reset();
    setTimeout(() => {
        dom.msgStatus.classList.add('hidden');
        toggleSidebar();
    }, 3000);
}