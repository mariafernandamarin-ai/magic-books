import { useEffect, useMemo, useState } from "react"

import logo from "./images/logo.png"
import instagram from "./images/instagram.png"
import tiktok from "./images/tiktok.png"
import aurora from "./images/cajaaurora.png"
import vita from "./images/cajavita.png"
import nebula from "./images/cajanebula.png"
import cita from "./images/cita.png"
import fondom from "./images/fondom.png"

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwUdiC3Rv5KmMuMzp_x-s9WERCJwFZQrMtE3qxBYDW08XbxIXgNClKpfPcMQqiwrpfejg/exec"

const ADMIN_PASSWORD = "ZoePedidos2026"
const PEDIDO_INFO_KEY = "magicBooksLastOrderInfo"
const TICKET_PREFIX = "magicBooksPrivateTicket_"
const WHATSAPP_DESTINO = "573148179439"

const MENU_ITEMS = [
  { key: "cajitas", label: "Cajitas literarias" },
  { key: "citas", label: "Citas ciegas" },
  { key: "productos", label: "Mas productos" },
  { key: "admin", label: "Panel privado" }
]

const CANTIDADES = [1, 2, 3, 4, 5]

const COLORES = [
  "Rosado pastel",
  "Morado",
  "Azul cielo",
  "Verde menta",
  "Amarillo pastel",
  "Rojo",
  "Vino tinto",
  "Blanco",
  "Negro",
  "Beige"
]

const CIUDADES_ENVIO = [
  { value: "cali", label: "Cali", costo: 9000 },
  { value: "palmira", label: "Palmira", costo: 9000 },
  { value: "yumbo", label: "Yumbo", costo: 9000 },
  { value: "jamundi", label: "Jamundi", costo: 9000 },
  { value: "medellin", label: "Medellin", costo: 9000 },
  { value: "bogota", label: "Bogota", costo: 9000 },
  { value: "otra", label: "Otra ciudad", costo: 9000 }
]

const CAJAS = {
  aurora: {
    nombre: "Caja Aurora",
    precio: 100000,
    img: aurora,
    descripcion: "Incluye libro, stickers, separador y post-its."
  },
  vita: {
    nombre: "Caja Vita",
    precio: 165000,
    img: vita,
    descripcion: "Incluye libro y accesorios premium."
  },
  nebula: {
    nombre: "Caja Nebula",
    precio: 230000,
    img: nebula,
    descripcion: "Incluye libro, agenda y experiencia completa."
  }
}

const CITAS = {
  clasica: {
    nombre: "Cita a Ciegas - Edicion Clasica",
    precio: 80000,
    img: cita,
    descripcion: "Una experiencia sorpresa para descubrir una nueva historia."
  },
  premium: {
    nombre: "Cita a Ciegas - Edicion Premium",
    precio: 150000,
    img: cita,
    descripcion: "Version premium con seleccion especial."
  }
}

const formatoCOP = (v) => `${Number(v || 0).toLocaleString("es-CO")} COP`
const isBlank = (v) => !String(v || "").trim()
const onlyNumber = (v) => Number(String(v || "").replace(/[^\d]/g, "") || 0)

const parseJsonSafe = async (res) => {
  const txt = await res.text()
  try {
    return JSON.parse(txt)
  } catch {
    return { ok: false, error: "Respuesta invalida", raw: txt }
  }
}

const callAppsScript = async (payload, method = "POST") => {
  const query = new URLSearchParams({
    ...payload,
    _t: String(Date.now())
  }).toString()

  const url = method === "GET" ? `${APPS_SCRIPT_URL}?${query}` : APPS_SCRIPT_URL

  const res = await fetch(
    url,
    method === "GET"
      ? { method: "GET", cache: "no-store" }
      : {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        }
  )

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.ok) throw new Error(data?.error || "Error de conexion")
  return data
}

const isOlderThan30Days = (dateValue) => {
  if (!dateValue) return false
  const d = new Date(dateValue)
  if (Number.isNaN(d.getTime())) return false
  return Date.now() - d.getTime() > 30 * 24 * 60 * 60 * 1000
}

export default function App() {
  const [vista, setVista] = useState("home")
  const [menuOpen, setMenuOpen] = useState(false)
  const [carritoOpen, setCarritoOpen] = useState(false)

  const [books, setBooks] = useState([])
  const [catalogProducts, setCatalogProducts] = useState([])

  const [productoCaja, setProductoCaja] = useState(null)
  const [cantidadCaja, setCantidadCaja] = useState(1)
  const [formulariosCaja, setFormulariosCaja] = useState([{ libroId: "", color: "" }])

  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [cantidadCita, setCantidadCita] = useState(1)

  const [pedidos, setPedidos] = useState([])
  const [ultimoPedido, setUltimoPedido] = useState(null)
  const [ticketPrivado, setTicketPrivado] = useState(null)

  const [checkout, setCheckout] = useState({
    nombre: "",
    whatsapp: "",
    direccion: "",
    tipoVivienda: "",
    tipoEntrega: "personal",
    nombreRecibe: "",
    mensajeRegalo: "",
    metodoPago: "",
    ciudadEnvio: "cali",
    otraCiudad: ""
  })

  // Admin
  const [adminAuthed, setAdminAuthed] = useState(false)
  const [adminPassInput, setAdminPassInput] = useState("")
  const [adminPedidos, setAdminPedidos] = useState([])
  const [adminExpanded, setAdminExpanded] = useState({})
  const [adminError, setAdminError] = useState("")
  const [adminLoading, setAdminLoading] = useState(false)

  const [bookForm, setBookForm] = useState({ nombre: "", excedenteText: "0" })
  const [productForm, setProductForm] = useState({
    nombre: "",
    descripcion: "",
    precioText: "0",
    fotoUrl: ""
  })

  useEffect(() => {
    const guardado = localStorage.getItem(PEDIDO_INFO_KEY)
    if (guardado) {
      try {
        setUltimoPedido(JSON.parse(guardado))
      } catch {}
    }
    cargarLibros()
    cargarProductos()
  }, [])

  const totalItems = pedidos.reduce((a, p) => a + p.cantidad, 0)
  const subtotal = pedidos.reduce((a, p) => a + p.totalItem, 0)
  const envio = pedidos.length > 0 ? 9000 : 0
  const totalFinal = subtotal + envio

  const ciudadLabel =
    checkout.ciudadEnvio === "otra"
      ? checkout.otraCiudad || "Otra ciudad"
      : CIUDADES_ENVIO.find((c) => c.value === checkout.ciudadEnvio)?.label || "Sin definir"

  const deliveredMini = useMemo(
    () =>
      adminPedidos.filter(
        (p) => p.estado === "Entregado" && !isOlderThan30Days(p.fechaEstado || p.fechaCreacion)
      ),
    [adminPedidos]
  )

  const activeAdmin = useMemo(
    () => adminPedidos.filter((p) => p.estado !== "Entregado"),
    [adminPedidos]
  )

  const cargarLibros = async () => {
    try {
      const data = await callAppsScript({ action: "list_books" }, "GET")
      setBooks(data.books || [])
    } catch (e) {
      console.error(e)
    }
  }

  const cargarProductos = async () => {
    try {
      const data = await callAppsScript({ action: "list_products" }, "GET")
      setCatalogProducts(data.products || [])
    } catch (e) {
      console.error(e)
    }
  }

  const cargarPedidosAdmin = async () => {
    setAdminLoading(true)
    setAdminError("")
    try {
      const data = await callAppsScript({ action: "list_orders" }, "GET")
      const list = (data.pedidos || []).filter((p) => Number(p.numeroPedido) > 0 && p.nombre !== "nombre")
      setAdminPedidos(list)
    } catch (e) {
      setAdminError(e.message || "Error cargando pedidos")
    } finally {
      setAdminLoading(false)
    }
  }

  const loginAdmin = async () => {
    if (adminPassInput !== ADMIN_PASSWORD) return alert("Clave incorrecta")
    setAdminAuthed(true)
    await cargarPedidosAdmin()
    await cargarLibros()
    await cargarProductos()
  }

  const abrirCaja = (key) => {
    setProductoCaja(CAJAS[key])
    setCantidadCaja(1)
    setFormulariosCaja([{ libroId: "", color: "" }])
    setVista("productoCaja")
  }

  const cambiarCantidadCaja = (n) => {
    if (totalItems + n > 5) return alert("Maximo 5 productos por compra.")
    setCantidadCaja(n)
    setFormulariosCaja((prev) =>
      Array.from({ length: n }, (_, i) => ({
        libroId: prev[i]?.libroId || "",
        color: prev[i]?.color || ""
      }))
    )
  }

  const agregarCajaCarrito = () => {
    if (!productoCaja) return
    if (formulariosCaja.some((f) => !f.libroId || !f.color)) {
      return alert("Completa libro y color en todas las cajitas.")
    }

    const detalle = formulariosCaja.map((f) => {
      const b = books.find((x) => x.id === f.libroId)
      return {
        libroId: f.libroId,
        libro: b?.nombre || "Libro",
        excedente: Number(b?.excedente || 0),
        color: f.color
      }
    })

    const excedenteTotal = detalle.reduce((a, x) => a + Number(x.excedente || 0), 0)
    const unit = Number(productoCaja.precio || 0)
    const totalItem = unit * cantidadCaja + excedenteTotal

    setPedidos((prev) => [
      ...prev,
      {
        tipo: "cajita",
        producto: productoCaja.nombre,
        precioUnitario: unit,
        cantidad: cantidadCaja,
        totalItem,
        personalizacion: detalle
      }
    ])

    setVista("cajitas")
    setCarritoOpen(true)
  }

  const abrirCita = (key) => {
    setCitaSeleccionada(CITAS[key])
    setCantidadCita(1)
    setVista("citaProducto")
  }

  const agregarCitaCarrito = () => {
    if (!citaSeleccionada) return
    if (totalItems + cantidadCita > 5) return alert("Maximo 5 productos por compra.")
    const unit = Number(citaSeleccionada.precio || 0)
    const totalItem = unit * cantidadCita
    setPedidos((prev) => [
      ...prev,
      {
        tipo: "cita",
        producto: citaSeleccionada.nombre,
        precioUnitario: unit,
        cantidad: cantidadCita,
        totalItem
      }
    ])
    setVista("citas")
    setCarritoOpen(true)
  }

  const agregarProductoExtra = (prod) => {
    if (totalItems + 1 > 5) return alert("Maximo 5 productos por compra.")
    setPedidos((prev) => [
      ...prev,
      {
        tipo: "extra",
        producto: prod.nombre,
        precioUnitario: Number(prod.precio || 0),
        cantidad: 1,
        totalItem: Number(prod.precio || 0),
        descripcion: prod.descripcion || "",
        fotoUrl: prod.fotoUrl || ""
      }
    ])
    setCarritoOpen(true)
  }

  const vaciarCarrito = () => setPedidos([])

  const finalizarCompra = async () => {
    if (isBlank(checkout.nombre) || isBlank(checkout.whatsapp) || isBlank(checkout.direccion)) {
      return alert("Completa nombre, WhatsApp y direccion.")
    }
    if (isBlank(checkout.tipoVivienda)) return alert("Completa tipo de vivienda.")
    if (!checkout.metodoPago) return alert("Selecciona metodo de pago.")
    if (checkout.ciudadEnvio === "otra" && isBlank(checkout.otraCiudad)) return alert("Escribe la ciudad.")

    const detallePedido = pedidos.map((p) => ({
      tipo: p.tipo,
      producto: p.producto,
      cantidad: p.cantidad,
      totalItem: p.totalItem,
      personalizacion: p.personalizacion || []
    }))

    let numeroPedido = null
    try {
      const data = await callAppsScript({
        action: "create_order",
        nombre: checkout.nombre,
        whatsapp: checkout.whatsapp,
        ciudad: ciudadLabel,
        direccion: checkout.direccion,
        tipoVivienda: checkout.tipoVivienda,
        tipoEntrega: checkout.tipoEntrega,
        nombreRecibe: checkout.nombreRecibe || "",
        mensajeRegalo: checkout.mensajeRegalo || "",
        metodoPago: checkout.metodoPago,
        subtotal,
        envio,
        total: totalFinal,
        detallePedido
      })
      numeroPedido = Number(data.numeroPedido)
    } catch {
      numeroPedido = Math.floor(Date.now() / 1000)
    }

    const ticket = {
      token: `${Date.now()}_${Math.floor(Math.random() * 1e9)}`,
      numeroPedido,
      pedidos,
      checkout,
      ciudadLabel,
      createdAt: new Date().toISOString()
    }
    localStorage.setItem(`${TICKET_PREFIX}${ticket.token}`, JSON.stringify(ticket))
    setTicketPrivado(ticket)

    const orderInfo = { numero: numeroPedido, estado: "Pedido listo" }
    localStorage.setItem(PEDIDO_INFO_KEY, JSON.stringify(orderInfo))
    setUltimoPedido(orderInfo)

    const mensaje = [
      "Hola, quiero confirmar este pedido de Magic Books",
      `Numero de pedido: *#${numeroPedido}*`,
      `Nombre: *${checkout.nombre}*`,
      `WhatsApp: *${checkout.whatsapp}*`,
      `Ciudad: *${ciudadLabel}*`,
      `Direccion: *${checkout.direccion}*`,
      "",
      ...pedidos.map((p, i) => `${i + 1}) ${p.producto} x${p.cantidad} - ${formatoCOP(p.totalItem)}`),
      "",
      `Subtotal: *${formatoCOP(subtotal)}*`,
      `Envio: *${formatoCOP(envio)}*`,
      `TOTAL: *${formatoCOP(totalFinal)}*`
    ].join("\n")

    window.open(`https://wa.me/${WHATSAPP_DESTINO}?text=${encodeURIComponent(mensaje)}`, "_blank")

    setPedidos([])
    setVista("pedidoConfirmado")
  }

  const saveBookAdmin = async () => {
    if (isBlank(bookForm.nombre)) return alert("Nombre del libro requerido")
    const excedente = onlyNumber(bookForm.excedenteText)

    try {
      const data = await callAppsScript({
        action: "save_book",
        nombre: bookForm.nombre.trim(),
        excedente
      })

      if (data?.book) {
        setBooks((prev) => {
          const sinActual = prev.filter((x) => x.id !== data.book.id)
          return [...sinActual, data.book].sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)))
        })
      }

      setBookForm({ nombre: "", excedenteText: "0" })
      await cargarLibros()
    } catch (e) {
      alert(e.message)
    }
  }

  const deleteBookAdmin = async (id) => {
    try {
      await callAppsScript({ action: "delete_book", id })
      await cargarLibros()
    } catch (e) {
      alert(e.message)
    }
  }

  const saveProductAdmin = async () => {
    if (isBlank(productForm.nombre)) return alert("Nombre del producto requerido")
    const precio = onlyNumber(productForm.precioText)

    try {
      const data = await callAppsScript({
        action: "save_product",
        nombre: productForm.nombre.trim(),
        descripcion: productForm.descripcion.trim(),
        precio,
        fotoUrl: productForm.fotoUrl.trim()
      })

      if (data?.product) {
        setCatalogProducts((prev) => {
          const sinActual = prev.filter((x) => x.id !== data.product.id)
          return [...sinActual, data.product]
        })
      }

      setProductForm({ nombre: "", descripcion: "", precioText: "0", fotoUrl: "" })
      await cargarProductos()
    } catch (e) {
      alert(e.message)
    }
  }

  const deleteProductAdmin = async (id) => {
    try {
      await callAppsScript({ action: "delete_product", id })
      await cargarProductos()
    } catch (e) {
      alert(e.message)
    }
  }

  const cambiarEstadoAdmin = async (numeroPedido, estado) => {
    try {
      await callAppsScript({ action: "update_status", numeroPedido, estado })
      await cargarPedidosAdmin()
      if (ultimoPedido?.numero === Number(numeroPedido)) {
        const updated = { numero: Number(numeroPedido), estado }
        localStorage.setItem(PEDIDO_INFO_KEY, JSON.stringify(updated))
        setUltimoPedido(updated)
      }
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <div style={styles.menuWrapper}>
          <button
            style={styles.iconBtn}
            onClick={() => {
              setMenuOpen((p) => !p)
              setCarritoOpen(false)
            }}
          >
            Menu
          </button>
          {menuOpen && (
            <div style={styles.dropdown}>
              {MENU_ITEMS.map((item, idx) => (
                <div key={item.key}>
                  <div
                    style={styles.menuItem}
                    onClick={() => {
                      setVista(item.key)
                      setMenuOpen(false)
                    }}
                  >
                    {item.label}
                  </div>
                  {idx < MENU_ITEMS.length - 1 && <div style={styles.divider} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.menuWrapper}>
          <button
            style={styles.iconBtn}
            onClick={() => {
              setCarritoOpen((p) => !p)
              setMenuOpen(false)
            }}
          >
            Carrito {totalItems > 0 ? `(${totalItems})` : ""}
          </button>
          {carritoOpen && (
            <div style={styles.cartBox}>
              {pedidos.length === 0 ? (
                <p style={styles.text}>Tu carrito esta vacio</p>
              ) : (
                <>
                  {pedidos.map((p, i) => (
                    <div key={i} style={styles.cartItem}>
                      <b>{p.producto} x{p.cantidad}</b>
                      <p style={styles.text}>Subtotal: {formatoCOP(p.totalItem)}</p>
                    </div>
                  ))}
                  <button style={styles.clearBtn} onClick={vaciarCarrito}>
                    Vaciar carrito
                  </button>
                  <button
                    style={styles.buyBtn}
                    onClick={() => {
                      setVista("checkout")
                      setCarritoOpen(false)
                    }}
                  >
                    Comprar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={styles.header}>
        <img src={logo} style={styles.logo} alt="Logo Magic Books" />
        <h1 style={styles.title}>Magic Books</h1>
      </div>

      {vista === "home" && (
        <div style={styles.center}>
          {ultimoPedido && (
            <div style={styles.orderStatusBox}>
              <h3 style={styles.orderStatusTitle}>Pedido #{ultimoPedido.numero}</h3>
              <p style={styles.orderStatusText}>{ultimoPedido.estado}</p>
            </div>
          )}
          <button style={styles.btn} onClick={() => setVista("cajitas")}>Cajitas literarias</button>
          <button style={styles.btn} onClick={() => setVista("citas")}>Citas ciegas</button>
          <button style={styles.btn} onClick={() => setVista("productos")}>Mas productos</button>
        </div>
      )}

      {vista === "cajitas" && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("home")}>Volver</button>
          <h2 style={styles.sectionTitle}>Cajitas literarias</h2>
          {Object.entries(CAJAS).map(([key, caja]) => (
            <div key={key} style={styles.card} onClick={() => abrirCaja(key)}>
              <img src={caja.img} style={styles.productImg} alt={caja.nombre} />
              <div>
                <h3>{caja.nombre}</h3>
                <p>{formatoCOP(caja.precio)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {vista === "productoCaja" && productoCaja && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("cajitas")}>Volver</button>
          <div style={styles.productPage}>
            <h2>{productoCaja.nombre}</h2>
            <p style={styles.price}>{formatoCOP(productoCaja.precio)}</p>
            <p style={styles.text}>{productoCaja.descripcion}</p>

            <select
              value={cantidadCaja}
              onChange={(e) => cambiarCantidadCaja(Number(e.target.value))}
              style={styles.select}
            >
              {CANTIDADES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>

            {formulariosCaja.map((f, i) => (
              <div key={i} style={styles.formBox}>
                <h4>Cajita {i + 1}</h4>

                <select
                  style={styles.input}
                  value={f.libroId}
                  onChange={(e) => {
                    const v = e.target.value
                    setFormulariosCaja((prev) => prev.map((x, idx) => (idx === i ? { ...x, libroId: v } : x)))
                  }}
                >
                  <option value="">Selecciona libro</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nombre} {Number(b.excedente) > 0 ? `( +${formatoCOP(b.excedente)} )` : "(incluido)"}
                    </option>
                  ))}
                </select>

                <select
                  style={styles.input}
                  value={f.color}
                  onChange={(e) => {
                    const v = e.target.value
                    setFormulariosCaja((prev) => prev.map((x, idx) => (idx === i ? { ...x, color: v } : x)))
                  }}
                >
                  <option value="">Selecciona color</option>
                  {COLORES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ))}

            <button style={styles.buyBtn} onClick={agregarCajaCarrito}>Agregar al carrito</button>
          </div>
        </div>
      )}

      {vista === "citas" && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("home")}>Volver</button>
          <h2 style={styles.sectionTitle}>Citas a ciegas</h2>
          {Object.entries(CITAS).map(([key, item]) => (
            <div key={key} style={styles.card}>
              <img src={item.img} style={styles.productImg} alt={item.nombre} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{item.nombre}</h3>
                <p style={styles.text}>{item.descripcion}</p>
                <p style={styles.price}>{formatoCOP(item.precio)}</p>
                <button style={styles.buyBtn} onClick={() => abrirCita(key)}>
                  Personalizar esta cita
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {vista === "citaProducto" && citaSeleccionada && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("citas")}>Volver</button>
          <div style={styles.productPage}>
            <img src={citaSeleccionada.img} style={styles.productImg} alt={citaSeleccionada.nombre} />
            <h2>{citaSeleccionada.nombre}</h2>
            <p style={styles.price}>{formatoCOP(citaSeleccionada.precio)}</p>
            <p style={styles.text}>{citaSeleccionada.descripcion}</p>

            <label style={styles.label}>Cantidad</label>
            <select
              value={cantidadCita}
              onChange={(e) => setCantidadCita(Number(e.target.value))}
              style={styles.select}
            >
              {CANTIDADES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>

            <button style={styles.buyBtn} onClick={agregarCitaCarrito}>
              Agregar cita al carrito
            </button>
          </div>
        </div>
      )}

      {vista === "productos" && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("home")}>Volver</button>
          <h2 style={styles.sectionTitle}>Mas productos</h2>
          {catalogProducts.length === 0 ? (
            <p style={styles.text}>Aun no hay productos cargados.</p>
          ) : (
            catalogProducts.map((p) => (
              <div key={p.id} style={styles.card}>
                <img src={p.fotoUrl || logo} style={styles.productImg} alt={p.nombre} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>{p.nombre}</h3>
                  <p style={styles.text}>{p.descripcion}</p>
                  <p style={styles.price}>{formatoCOP(p.precio)}</p>
                  <button style={styles.buyBtn} onClick={() => agregarProductoExtra(p)}>
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {vista === "checkout" && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("home")}>Volver</button>
          <h2 style={styles.sectionTitle}>Finalizar compra</h2>

          <div style={styles.formBox}>
            <label style={styles.label}>Nombre completo</label>
            <input style={styles.input} value={checkout.nombre} onChange={(e) => setCheckout((p) => ({ ...p, nombre: e.target.value }))} />

            <label style={styles.label}>Numero de WhatsApp</label>
            <input style={styles.input} value={checkout.whatsapp} onChange={(e) => setCheckout((p) => ({ ...p, whatsapp: e.target.value }))} />

            <label style={styles.label}>Ciudad</label>
            <select style={styles.input} value={checkout.ciudadEnvio} onChange={(e) => setCheckout((p) => ({ ...p, ciudadEnvio: e.target.value }))}>
              {CIUDADES_ENVIO.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            {checkout.ciudadEnvio === "otra" && (
              <>
                <label style={styles.label}>Escribe tu ciudad</label>
                <input style={styles.input} value={checkout.otraCiudad} onChange={(e) => setCheckout((p) => ({ ...p, otraCiudad: e.target.value }))} />
              </>
            )}

            <label style={styles.label}>Direccion</label>
            <input style={styles.input} value={checkout.direccion} onChange={(e) => setCheckout((p) => ({ ...p, direccion: e.target.value }))} />

            <label style={styles.label}>Tipo de vivienda</label>
            <input style={styles.input} value={checkout.tipoVivienda} onChange={(e) => setCheckout((p) => ({ ...p, tipoVivienda: e.target.value }))} />

            <label style={styles.label}>Metodo de pago</label>
            <select style={styles.input} value={checkout.metodoPago} onChange={(e) => setCheckout((p) => ({ ...p, metodoPago: e.target.value }))}>
              <option value="">Selecciona metodo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Efectivo contra entrega (solo Cali)">Efectivo contra entrega (solo Cali)</option>
            </select>

            <p style={styles.notice}>Domicilio: 9.000 COP</p>
            <div style={styles.resumeBox}>
              <p style={styles.resumeText}>Subtotal: {formatoCOP(subtotal)}</p>
              <p style={styles.resumeText}>Envio: {formatoCOP(envio)}</p>
              <p style={styles.resumeTotal}>Total: {formatoCOP(totalFinal)}</p>
            </div>

            <button style={styles.buyBtn} onClick={finalizarCompra}>Confirmar compra por WhatsApp</button>
          </div>
        </div>
      )}

      {vista === "pedidoConfirmado" && (
        <div style={styles.page}>
          <div style={styles.confirmCard}>
            <h2 style={styles.sectionTitle}>Pedido listo</h2>
            <p style={styles.text}>Tu pedido quedo registrado correctamente.</p>
            {ultimoPedido && <p style={styles.resumeTotal}>Numero de pedido: #{ultimoPedido.numero}</p>}
            {ticketPrivado && (
              <button style={styles.buyBtn} onClick={() => setVista("ticketPrivado")}>
                Ver mi ticket de pedido
              </button>
            )}
          </div>
        </div>
      )}

      {vista === "ticketPrivado" && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("home")}>Volver</button>
          <h2 style={styles.sectionTitle}>Ticket de pedido</h2>
          {!ticketPrivado ? (
            <div style={styles.formBox}><p style={styles.text}>No se encontro ticket en este navegador.</p></div>
          ) : (
            <div style={styles.formBox}>
              <p style={styles.resumeTotal}>Pedido #{ticketPrivado.numeroPedido}</p>
              <p style={styles.text}>Fecha: {new Date(ticketPrivado.createdAt).toLocaleString("es-CO")}</p>
              <p style={styles.notice}>Recomendacion: toma screenshot o captura de pantalla.</p>
              <button style={styles.buyBtn} onClick={() => setVista("home")}>Volver a la pagina principal</button>
            </div>
          )}
        </div>
      )}

      {vista === "admin" && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("home")}>Volver</button>
          <h2 style={styles.sectionTitle}>Panel privado de administracion</h2>

          {!adminAuthed ? (
            <div style={styles.formBox}>
              <p style={styles.notice}>
                Este panel privado es solo para los duenos y trabajadores de Magic Books.
              </p>
              <label style={styles.label}>Clave privada</label>
              <input type="password" style={styles.input} value={adminPassInput} onChange={(e) => setAdminPassInput(e.target.value)} />
              <button style={styles.buyBtn} onClick={loginAdmin}>Entrar</button>
            </div>
          ) : (
            <>
              <div style={styles.formBox}>
                <h3 style={{ color: "#5b3a8a" }}>Gestion de Libros (Cajitas)</h3>
                <input
                  style={styles.input}
                  placeholder="Nombre del libro"
                  value={bookForm.nombre}
                  onChange={(e) => setBookForm((p) => ({ ...p, nombre: e.target.value }))}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  style={styles.input}
                  placeholder="Excedente (ej: 15000)"
                  value={bookForm.excedenteText}
                  onChange={(e) => setBookForm((p) => ({ ...p, excedenteText: e.target.value }))}
                />
                <button style={styles.buyBtn} onClick={saveBookAdmin}>Guardar libro</button>

                {books.map((b) => (
                  <div key={b.id} style={styles.adminRow}>
                    <span>{b.nombre}</span>
                    <span>{Number(b.excedente) > 0 ? `+${formatoCOP(b.excedente)}` : "Incluido"}</span>
                    <button style={styles.deleteBtn} onClick={() => deleteBookAdmin(b.id)}>Eliminar</button>
                  </div>
                ))}
              </div>

              <div style={styles.formBox}>
                <h3 style={{ color: "#5b3a8a" }}>Gestion de + Productos</h3>
                <input
                  style={styles.input}
                  placeholder="Nombre"
                  value={productForm.nombre}
                  onChange={(e) => setProductForm((p) => ({ ...p, nombre: e.target.value }))}
                />
                <textarea
                  style={styles.textarea}
                  placeholder="Descripcion"
                  value={productForm.descripcion}
                  onChange={(e) => setProductForm((p) => ({ ...p, descripcion: e.target.value }))}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  style={styles.input}
                  placeholder="Precio (ej: 45000)"
                  value={productForm.precioText}
                  onChange={(e) => setProductForm((p) => ({ ...p, precioText: e.target.value }))}
                />
                <input
                  style={styles.input}
                  placeholder="URL de la foto"
                  value={productForm.fotoUrl}
                  onChange={(e) => setProductForm((p) => ({ ...p, fotoUrl: e.target.value }))}
                />
                <button style={styles.buyBtn} onClick={saveProductAdmin}>Guardar producto</button>

                {catalogProducts.map((p) => (
                  <div key={p.id} style={styles.adminRow}>
                    <span>{p.nombre}</span>
                    <span>{formatoCOP(p.precio)}</span>
                    <button style={styles.deleteBtn} onClick={() => deleteProductAdmin(p.id)}>Eliminar</button>
                  </div>
                ))}
              </div>

              <div style={styles.formBox}>
                <h3 style={{ color: "#5b3a8a" }}>Pedidos</h3>
                <button style={styles.buyBtn} onClick={cargarPedidosAdmin}>Recargar pedidos</button>
                {adminLoading && <p style={styles.text}>Cargando...</p>}
                {adminError && <p style={{ ...styles.text, color: "#b00020" }}>{adminError}</p>}

                {activeAdmin.map((p) => (
                  <div key={p.numeroPedido} style={styles.adminTicket}>
                    <button
                      style={styles.adminTicketBtn}
                      onClick={() =>
                        setAdminExpanded((prev) => ({ ...prev, [p.numeroPedido]: !prev[p.numeroPedido] }))
                      }
                    >
                      <span style={styles.adminFecha}>
                        {p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleString("es-CO") : "Sin fecha"}
                      </span>
                      <span style={styles.adminNumero}>Pedido #{p.numeroPedido}</span>
                      <span style={styles.adminEstado}>{p.estado || "Pedido listo"}</span>
                    </button>

                    {adminExpanded[p.numeroPedido] && (
                      <div style={styles.adminDetail}>
                        <p style={styles.text}><b>Cliente:</b> {p.nombre} | <b>WhatsApp:</b> {p.whatsapp}</p>
                        <p style={styles.text}><b>Total:</b> {formatoCOP(p.total)}</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button style={styles.adminStateBtn} onClick={() => cambiarEstadoAdmin(p.numeroPedido, "Empacado")}>Empacado</button>
                          <button style={styles.adminStateBtn} onClick={() => cambiarEstadoAdmin(p.numeroPedido, "Enviado")}>Enviado</button>
                          <button style={styles.adminStateBtnDanger} onClick={() => cambiarEstadoAdmin(p.numeroPedido, "Entregado")}>Entregado</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {deliveredMini.length > 0 && (
                  <>
                    <h4 style={{ color: "#5b3a8a" }}>Registro de entregados (30 dias)</h4>
                    {deliveredMini.map((p) => (
                      <div key={p.numeroPedido} style={styles.adminDeliveredMini}>
                        <span>#{p.numeroPedido}</span>
                        <span>{p.nombre || "Cliente"}</span>
                        <span>{p.fechaEstado ? new Date(p.fechaEstado).toLocaleDateString("es-CO") : "Sin fecha"}</span>
                        <span>Entregado</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div style={styles.footer}>
        <div style={styles.footerBlock}>
          <h3>Magic Books</h3>
          <p style={styles.text}>Magic Books es una tienda de experiencias literarias personalizadas.</p>
        </div>
        <div style={styles.footerBlockCentered}>
          <h3>Redes</h3>
          <a href="https://www.instagram.com/magicbooks.shop?igsh=MWtiaTEyOTYxOWZkeg==" target="_blank" rel="noreferrer" style={styles.social}>
            <img src={instagram} style={styles.icon} alt="Instagram" />
            Instagram
          </a>
          <a href="https://www.tiktok.com/@magic.books.shop?_r=1&_t=ZS-96A9iTH8EHE" target="_blank" rel="noreferrer" style={styles.social}>
            <img src={tiktok} style={styles.icon} alt="TikTok" />
            TikTok
          </a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  app: {
    fontFamily: "sans-serif",
    backgroundColor: "#f7f0ff",
    backgroundImage: `url(${fondom})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "top center",
    minHeight: "100vh",
    padding: "20px"
  },
  topBar: { display: "flex", justifyContent: "flex-end", gap: "15px", position: "relative" },
  menuWrapper: { position: "relative" },
  iconBtn: { fontSize: "16px", border: "none", background: "#fff", cursor: "pointer", borderRadius: "8px", padding: "8px 12px", color: "#5b3a8a" },
  dropdown: { position: "absolute", right: 0, top: "42px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", padding: "10px", minWidth: "220px", zIndex: 999 },
  menuItem: { padding: "12px", cursor: "pointer", color: "#5b3a8a", fontWeight: "500" },
  divider: { height: "1px", background: "#eee" },

  cartBox: { position: "absolute", right: 0, top: "42px", background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", width: "340px", zIndex: 999, maxHeight: "70vh", overflowY: "auto" },
  cartItem: { borderBottom: "2px solid #ddd", paddingBottom: "12px", marginBottom: "12px" },

  header: { textAlign: "center" },
  logo: { width: "90px" },
  title: { fontSize: "50px", color: "#5b3a8a" },

  center: { display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", marginTop: "40px" },
  orderStatusBox: { background: "#fff", border: "1px solid #e6d6ff", borderRadius: "12px", padding: "14px", width: "320px", textAlign: "center" },
  orderStatusTitle: { margin: "0 0 6px 0", color: "#5b3a8a" },
  orderStatusText: { margin: 0, color: "#666", fontSize: "14px" },

  btn: { padding: "12px", width: "220px", borderRadius: "12px", border: "none", background: "#d9b3ff", cursor: "pointer" },
  page: { padding: "20px" },
  back: { marginBottom: "20px", border: "none", background: "#eee", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" },
  sectionTitle: { textAlign: "center", color: "#5b3a8a" },

  card: { display: "flex", gap: "15px", background: "#fff", padding: "12px", borderRadius: "12px", marginBottom: "10px", cursor: "pointer" },
  productImg: { width: "70px", height: "70px", objectFit: "cover", borderRadius: "10px" },
  productPage: { textAlign: "center" },

  price: { color: "#5b3a8a", fontWeight: "bold" },
  select: { padding: "10px", borderRadius: "10px", marginBottom: "15px" },
  formBox: { marginTop: "15px", background: "#fff", padding: "15px", borderRadius: "12px", maxWidth: "760px", marginLeft: "auto", marginRight: "auto", textAlign: "left" },
  confirmCard: { background: "#fff", borderRadius: "12px", padding: "20px", maxWidth: "520px", margin: "0 auto", textAlign: "center" },

  input: { display: "block", width: "100%", margin: "8px 0 16px", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" },
  textarea: { display: "block", width: "100%", marginTop: "8px", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", minHeight: "90px", resize: "vertical" },

  buyBtn: { marginTop: "15px", padding: "12px", background: "#d9b3ff", border: "none", borderRadius: "10px", cursor: "pointer" },
  clearBtn: { marginTop: "10px", padding: "10px 14px", border: "none", borderRadius: "10px", background: "#eee", cursor: "pointer" },

  notice: { margin: "6px 0", color: "#666", fontSize: "14px" },
  text: { fontSize: "14px", color: "#666" },
  resumeBox: { background: "#f3e7ff", borderRadius: "10px", padding: "10px 12px", marginTop: "8px", marginBottom: "10px" },
  resumeText: { margin: "4px 0", color: "#5b3a8a", fontSize: "14px" },
  resumeTotal: { margin: "4px 0", color: "#5b3a8a", fontWeight: "bold" },
  label: { display: "block", marginBottom: "6px", color: "#5b3a8a", fontWeight: 600 },

  adminTicket: { background: "#fff", borderRadius: "12px", margin: "12px auto", maxWidth: "760px", overflow: "hidden", border: "1px solid #eadbff" },
  adminTicketBtn: { width: "100%", border: "none", background: "#f3e7ff", cursor: "pointer", padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  adminFecha: { fontSize: 12, color: "#7b6a96" },
  adminNumero: { fontSize: 20, color: "#5b3a8a", fontWeight: 800 },
  adminEstado: { fontSize: 13, color: "#5b3a8a" },
  adminDetail: { padding: 14 },
  adminStateBtn: { border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", background: "#d9b3ff", color: "#3f2a62" },
  adminStateBtnDanger: { border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", background: "#ffc9de", color: "#7d1f46" },

  adminRow: {
    display: "grid",
    gridTemplateColumns: "1fr 160px 90px",
    gap: 8,
    padding: "8px 10px",
    border: "1px solid #eee",
    borderRadius: 8,
    marginBottom: 6,
    alignItems: "center"
  },
  deleteBtn: { border: "none", borderRadius: 8, padding: "6px 8px", background: "#ffe1ea", color: "#7d1f46", cursor: "pointer" },
  adminDeliveredMini: {
    display: "grid",
    gridTemplateColumns: "80px 1fr 130px 100px",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 8,
    background: "#faf8ff",
    border: "1px solid #eee",
    fontSize: 12,
    marginBottom: 6,
    color: "#666"
  },

  footer: { marginTop: "50px", borderTop: "1px solid #ddd", paddingTop: "20px", paddingBottom: "10px", background: "#f7f0ff", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" },
  footerBlock: { flex: "1 1 320px", maxWidth: "650px" },
  footerBlockCentered: { flex: "1 1 260px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  social: { display: "flex", gap: "8px", alignItems: "center", textDecoration: "none", marginTop: "8px", color: "#5b3a8a" },
  icon: { width: "18px", height: "18px" }
}