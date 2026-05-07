import { useEffect, useState } from "react"

import logo from "./images/logo.png"
import instagram from "./images/instagram.png"
import tiktok from "./images/tiktok.png"

import aurora from "./images/cajaaurora.png"
import vita from "./images/cajavita.png"
import nebula from "./images/cajanebula.png"
import cita from "./images/cita.png"

/* ================= DATA ================= */

const WHATSAPP_DESTINO = "573226081851"
const PEDIDO_KEY = "magicBooksLastOrderNumber"
const PEDIDO_INFO_KEY = "magicBooksLastOrderInfo"

const LIBROS = [
  "Orgullo y prejuicio",
  "Heartstopper",
  "Boulevard",
  "A través de mi ventana",
  "Alas de sangre",
  "Twisted Love",
  "Romper el círculo",
  "Antes de diciembre",
  "Nosotros en la luna",
  "Ciudades de papel"
]

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

const CAJAS = {
  aurora: {
    nombre: "Caja Aurora",
    precio: "60.000 COP",
    img: aurora,
    descripcion:
      "Incluye un libro seleccionado, stickers temáticos, separador y post-its."
  },
  vita: {
    nombre: "Caja Vita",
    precio: "100.000 COP",
    img: vita,
    descripcion:
      "Incluye un libro seleccionado, separador, vela aromática, post-its, stickers, resaltadores y bolígrafo."
  },
  nebula: {
    nombre: "Caja Nébula",
    precio: "180.000 COP",
    img: nebula,
    descripcion:
      "Incluye un libro seleccionado, separador, agenda, resaltadores, stickers, post-its, tote bag, vela aromática y detalle sorpresa."
  }
}

const CITAS = {
  clasica: {
    nombre: "Cita a Ciegas — Edición Clásica",
    precio: "80.000 COP",
    img: cita,
    descripcion:
      "Déjate sorprender por una historia elegida especialmente para enamorarte página tras página. No conoces el libro hasta abrirlo."
  },
  premium: {
    nombre: "Cita a Ciegas — Edición Premium",
    precio: "150.000 COP",
    img: cita,
    descripcion:
      "Una experiencia más especial para lectores que aman las ediciones únicas. Tu cita puede incluir una edición especial o un libro en tapa dura."
  }
}

const MENU_ITEMS = [
  { key: "cajitas", label: "Cajitas literarias" },
  { key: "citas", label: "Citas ciegas" },
  { key: "productos", label: "Más productos" }
]

const CANTIDADES = [1, 2, 3, 4, 5]

const GENEROS = [
  "Romance",
  "Fantasía",
  "Thriller / Suspenso",
  "Misterio",
  "Juvenil",
  "Dark romance",
  "Contemporáneo",
  "Ciencia ficción",
  "Terror",
  "Histórico",
  "Drama",
  "Comedia romántica",
  "New adult"
]

const TIPOS_HISTORIA = [
  "Cozy y ligera",
  "Romántica",
  "Triste y emocional",
  "Intensa y adictiva",
  "Misteriosa",
  "Oscura",
  "Fantástica",
  "Inspiradora"
]

const SPICE = ["Sin spice", "Poco spice", "Intermedio", "Mucho spice"]

const TROPES = [
  "Enemies to lovers",
  "Friends to lovers",
  "Fake dating",
  "Slow burn",
  "Grumpy x Sunshine",
  "Found family",
  "Amor prohibido",
  "Academia / universidad",
  "Second chance",
  "Proximidad forzada",
  "Matrimonio por conveniencia",
  "Viaje o aventura"
]

const ESTILOS = [
  "Coquette",
  "Dark academia",
  "Cozy reader",
  "Romántico",
  "Minimalista",
  "Fantasy",
  "Gótico",
  "Cute y colorido"
]

const PREFERENCIA_LIBRO = ["Autoconclusivos", "Sagas", "Me da igual"]

const CIUDADES_ENVIO = [
  { value: "cali", label: "Cali", costo: 8000 },
  { value: "palmira", label: "Palmira", costo: 15000 },
  { value: "yumbo", label: "Yumbo", costo: 15000 },
  { value: "jamundi", label: "Jamundí", costo: 15000 },
  { value: "medellin", label: "Medellín", costo: 25000 },
  { value: "bogota", label: "Bogotá", costo: 25000 },
  { value: "otra", label: "Otra ciudad", costo: 25000 }
]

/* ================= HELPERS ================= */

const isBlank = (v) => !String(v || "").trim()

const createFormularios = (length, actual = []) =>
  Array.from({ length }, (_, i) => ({
    libro: actual[i]?.libro || "",
    color: actual[i]?.color || ""
  }))

const createEncuestaBase = () => ({
  generos: [],
  tipoHistoria: [],
  spicy: "",
  tropes: [],
  estiloPaquete: [],
  libroFavorito: "",
  autoresAmas: "",
  noQuieresRecibir: "",
  preferenciaLibro: "",
  comentarios: ""
})

const createEncuestas = (length, actual = []) =>
  Array.from({ length }, (_, i) => ({
    ...createEncuestaBase(),
    ...actual[i]
  }))

const precioATotal = (precioTexto) => {
  const soloNumeros = precioTexto.replace(/[^\d]/g, "")
  return Number(soloNumeros || 0)
}

const formatoCOP = (valor) => `${valor.toLocaleString("es-CO")} COP`

const costoEnvioPorCiudad = (ciudad) =>
  CIUDADES_ENVIO.find((c) => c.value === ciudad)?.costo || 25000

const siguienteNumeroPedido = () => {
  const ultimo = Number(localStorage.getItem(PEDIDO_KEY) || "0")
  const siguiente = ultimo + 1
  localStorage.setItem(PEDIDO_KEY, String(siguiente))
  return siguiente
}

function DropdownMultiSelect({
  label,
  options,
  selected,
  max,
  onToggle,
  placeholder
}) {
  return (
    <details style={styles.dropdownMulti}>
      <summary style={styles.dropdownSummary}>
        {label}
        <span style={styles.dropdownCount}>
          {selected.length > 0 ? `${selected.length} seleccionados` : placeholder}
        </span>
      </summary>

      <div style={styles.dropdownPanel}>
        {options.map((option) => {
          const checked = selected.includes(option)
          const disabled = !checked && selected.length >= max

          return (
            <label
              key={option}
              style={{
                ...styles.checkboxItem,
                opacity: disabled ? 0.6 : 1
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => onToggle(option)}
              />
              {option}
            </label>
          )
        })}
      </div>
    </details>
  )
}

export default function App() {
  const [vista, setVista] = useState("home")
  const [menuOpen, setMenuOpen] = useState(false)
  const [carritoOpen, setCarritoOpen] = useState(false)

  const [producto, setProducto] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [formularios, setFormularios] = useState(createFormularios(1))

  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [cantidadCita, setCantidadCita] = useState(1)
  const [encuestasCita, setEncuestasCita] = useState(createEncuestas(1))

  const [pedidos, setPedidos] = useState([])
  const [ultimoPedido, setUltimoPedido] = useState(null)

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

  useEffect(() => {
    const guardado = localStorage.getItem(PEDIDO_INFO_KEY)
    if (guardado) {
      try {
        setUltimoPedido(JSON.parse(guardado))
      } catch {
        setUltimoPedido(null)
      }
    }
  }, [])

  const totalEnCarrito = pedidos.reduce((acc, item) => acc + item.cantidad, 0)
  const subtotalCOP = pedidos.reduce((acc, item) => acc + item.totalItem, 0)

  const envioCOP = pedidos.length > 0 ? costoEnvioPorCiudad(checkout.ciudadEnvio) : 0
  const totalFinalCOP = subtotalCOP + envioCOP

  const ciudadLabel =
    checkout.ciudadEnvio === "otra"
      ? checkout.otraCiudad || "Otra ciudad"
      : CIUDADES_ENVIO.find((c) => c.value === checkout.ciudadEnvio)?.label || "Sin definir"

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev)
    setCarritoOpen(false)
  }

  const toggleCarrito = () => {
    setCarritoOpen((prev) => !prev)
    setMenuOpen(false)
  }

  const irAVista = (nuevaVista) => {
    setVista(nuevaVista)
    setMenuOpen(false)
  }

  const abrirProducto = (key) => {
    setProducto(CAJAS[key])
    setCantidad(1)
    setFormularios(createFormularios(1))
    setVista("producto")
  }

  const abrirCita = (key) => {
    setCitaSeleccionada(CITAS[key])
    setCantidadCita(1)
    setEncuestasCita(createEncuestas(1))
    setVista("citaProducto")
  }

  const cambiarCantidad = (nuevaCantidad) => {
    if (totalEnCarrito + nuevaCantidad > 5) {
      alert("El límite máximo de compra por persona es de 5 productos.")
      return
    }
    setCantidad(nuevaCantidad)
    setFormularios((prev) => createFormularios(nuevaCantidad, prev))
  }

  const cambiarCantidadCita = (nuevaCantidad) => {
    if (totalEnCarrito + nuevaCantidad > 5) {
      alert("El límite máximo de compra por persona es de 5 productos.")
      return
    }
    setCantidadCita(nuevaCantidad)
    setEncuestasCita((prev) => createEncuestas(nuevaCantidad, prev))
  }

  const actualizarFormulario = (index, campo, valor) => {
    setFormularios((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item))
    )
  }

  const toggleMultiSelectCita = (citaIndex, campo, valor, max) => {
    setEncuestasCita((prev) =>
      prev.map((encuesta, i) => {
        if (i !== citaIndex) return encuesta

        const actual = encuesta[campo]
        const existe = actual.includes(valor)

        if (existe) {
          return {
            ...encuesta,
            [campo]: actual.filter((item) => item !== valor)
          }
        }

        if (actual.length >= max) {
          alert(`En la Cita ${citaIndex + 1}, solo puedes elegir hasta ${max} opciones.`)
          return encuesta
        }

        return {
          ...encuesta,
          [campo]: [...actual, valor]
        }
      })
    )
  }

  const actualizarTextoCita = (citaIndex, campo, valor) => {
    setEncuestasCita((prev) =>
      prev.map((encuesta, i) =>
        i === citaIndex ? { ...encuesta, [campo]: valor } : encuesta
      )
    )
  }

  const actualizarCheckout = (campo, valor) => {
    setCheckout((prev) => ({ ...prev, [campo]: valor }))
  }

  const agregarCarrito = () => {
    const incompleto = formularios.some((f) => !f.libro || !f.color)

    if (incompleto) {
      alert("Debes seleccionar libro y color en todas las cajitas.")
      return
    }

    const precioUnitario = precioATotal(producto.precio)

    setPedidos((prev) => [
      ...prev,
      {
        tipo: "cajita",
        producto: producto.nombre,
        precioUnitario,
        cantidad,
        totalItem: precioUnitario * cantidad,
        personalizacion: [...formularios]
      }
    ])

    setVista("cajitas")
  }

  const validarEncuestaCita = (e) => {
    const faltantes = []

    if (e.generos.length === 0) faltantes.push("géneros")
    if (e.tipoHistoria.length === 0) faltantes.push("tipo de historia")
    if (!e.spicy) faltantes.push("spice")
    if (e.tropes.length === 0) faltantes.push("tropes")
    if (e.estiloPaquete.length === 0) faltantes.push("estilo de paquete")
    if (isBlank(e.libroFavorito)) faltantes.push("libro favorito")
    if (isBlank(e.autoresAmas)) faltantes.push("autores que amas")
    if (!e.preferenciaLibro) faltantes.push("preferencia libro")

    return faltantes
  }

  const agregarCitaCarrito = () => {
    const errores = encuestasCita
      .map((encuesta, i) => {
        const faltantes = validarEncuestaCita(encuesta)
        return faltantes.length
          ? `Cita ${i + 1}: ${faltantes.join(", ")}`
          : null
      })
      .filter(Boolean)

    if (errores.length > 0) {
      alert(`Faltan campos por completar:\n${errores.join("\n")}`)
      return
    }

    const precioUnitario = precioATotal(citaSeleccionada.precio)

    setPedidos((prev) => [
      ...prev,
      {
        tipo: "cita",
        producto: citaSeleccionada.nombre,
        precioUnitario,
        cantidad: cantidadCita,
        totalItem: precioUnitario * cantidadCita,
        encuestas: [...encuestasCita]
      }
    ])

    setVista("citas")
  }

  const vaciarCarrito = () => setPedidos([])

  const reiniciarDesdeCero = () => {
    setPedidos([])
    setCheckout({
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
    setVista("home")
  }

  const irACheckout = () => {
    if (pedidos.length === 0) {
      alert("Tu carrito está vacío.")
      return
    }
    setVista("checkout")
    setCarritoOpen(false)
  }

  const generarMensajeWhatsApp = (numeroPedido) => {
    const lineasPedidos = pedidos
      .map((p, idx) => {
        let detalle = `${idx + 1}) ${p.producto} x${p.cantidad}\nSubtotal: *${formatoCOP(
          p.totalItem
        )}*`

        if (p.tipo === "cajita") {
          const personalizacion = p.personalizacion
            .map(
              (x, i) =>
                `  - Cajita ${i + 1}: Libro *${x.libro}*, Color *${x.color}*`
            )
            .join("\n")
          detalle += `\n${personalizacion}`
        }

        if (p.tipo === "cita") {
          const encuestas = p.encuestas
            .map(
              (e, i) =>
                `  - Cita ${i + 1}: Generos *${e.generos.join(", ")}*, Historia *${e.tipoHistoria.join(
                  ", "
                )}*, Spice *${e.spicy}*`
            )
            .join("\n")
          detalle += `\n${encuestas}`
        }

        return detalle
      })
      .join("\n\n")

    const mensaje = [
      "Hola, quiero confirmar este pedido de Magic Books",
      `Numero de pedido: *#${numeroPedido}*`,
      "",
      "DATOS DEL CLIENTE",
      `Nombre completo: *${checkout.nombre}*`,
      `WhatsApp: *${checkout.whatsapp}*`,
      `Ciudad: *${ciudadLabel}*`,
      `Direccion: *${checkout.direccion}*`,
      `Tipo de vivienda: *${checkout.tipoVivienda}*`,
      `Pedido para: *${checkout.tipoEntrega === "regalo" ? "Regalo" : "Uso personal"}*`,
      checkout.tipoEntrega === "regalo"
        ? `Nombre de quien recibe: *${checkout.nombreRecibe || "Sin dato"}*`
        : null,
      checkout.tipoEntrega === "regalo"
        ? `Mensaje para tarjeta: *${checkout.mensajeRegalo || "Sin mensaje"}*`
        : null,
      `Metodo de pago: *${checkout.metodoPago}*`,
      "",
      "RESUMEN DEL PEDIDO",
      lineasPedidos,
      "",
      `Subtotal productos: *${formatoCOP(subtotalCOP)}*`,
      `Envio: *${formatoCOP(envioCOP)}*`,
      `TOTAL A PAGAR: *${formatoCOP(totalFinalCOP)}*`
    ]
      .filter(Boolean)
      .join("\n")

    return mensaje
  }

  const finalizarPorWhatsApp = () => {
    if (isBlank(checkout.nombre) || isBlank(checkout.whatsapp) || isBlank(checkout.direccion)) {
      alert("Completa nombre, WhatsApp y dirección.")
      return
    }

    if (isBlank(checkout.tipoVivienda)) {
      alert("Completa el tipo de vivienda.")
      return
    }

    if (!checkout.metodoPago) {
      alert("Selecciona el método de pago.")
      return
    }

    if (checkout.ciudadEnvio === "otra" && isBlank(checkout.otraCiudad)) {
      alert("Escribe la ciudad de envío.")
      return
    }

    if (checkout.tipoEntrega === "regalo" && isBlank(checkout.nombreRecibe)) {
      alert("Escribe el nombre de quien recibe el regalo.")
      return
    }

    const numeroPedido = siguienteNumeroPedido()
    const mensaje = generarMensajeWhatsApp(numeroPedido)
    const pedidoInfo = {
      numero: numeroPedido,
      estado: "Pedido listo, gestionando por WhatsApp"
    }
    localStorage.setItem(PEDIDO_INFO_KEY, JSON.stringify(pedidoInfo))
    setUltimoPedido(pedidoInfo)
    const url = `https://wa.me/${WHATSAPP_DESTINO}?text=${encodeURIComponent(mensaje)}`
    window.open(url, "_blank")
    reiniciarDesdeCero()
    setVista("pedidoConfirmado")
  }

  return (
    <div style={styles.app}>
      <div style={styles.topBar}>
        <div style={styles.menuWrapper}>
          <button style={styles.iconBtn} onClick={toggleMenu}>
            Menú
          </button>
          {menuOpen && (
            <div style={styles.dropdown}>
              {MENU_ITEMS.map((item, idx) => (
                <div key={item.key}>
                  <div style={styles.menuItem} onClick={() => irAVista(item.key)}>
                    {item.label}
                  </div>
                  {idx < MENU_ITEMS.length - 1 && <div style={styles.divider} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.menuWrapper}>
          <button style={styles.iconBtn} onClick={toggleCarrito}>
            Carrito {totalEnCarrito > 0 ? `(${totalEnCarrito})` : ""}
          </button>

          {carritoOpen && (
            <div style={styles.cartBox}>
              {pedidos.length === 0 ? (
                <p style={styles.emptyCart}>Tu carrito está vacío</p>
              ) : (
                <>
                  {pedidos.map((p, i) => (
                    <div key={i} style={styles.cartItem}>
                      <h4 style={styles.cartTitle}>
                        {p.producto} x{p.cantidad}
                      </h4>
                      <p style={styles.cartText}>Subtotal: {formatoCOP(p.totalItem)}</p>
                    </div>
                  ))}

                  <div style={styles.resumeBox}>
                    <p style={styles.resumeText}>Productos: {totalEnCarrito}</p>
                    <p style={styles.resumeTotal}>
                      Total productos: {formatoCOP(subtotalCOP)}
                    </p>
                  </div>

                  <button style={styles.clearBtn} onClick={vaciarCarrito}>
                    Vaciar carrito
                  </button>
                  <button style={styles.buyBtnCart} onClick={irACheckout}>
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
          <button style={styles.btn} onClick={() => setVista("cajitas")}>
            Cajitas literarias
          </button>
          <button style={styles.btn} onClick={() => setVista("citas")}>
            Citas ciegas
          </button>
          <button style={styles.btn} onClick={() => setVista("productos")}>
            Más productos
          </button>
        </div>
      )}

      {vista === "pedidoConfirmado" && (
        <div style={styles.page}>
          <div style={styles.confirmCard}>
            <h2 style={styles.sectionTitle}>Pedido listo</h2>
            <p style={styles.description}>
              Tu pedido quedó registrado correctamente y ya está en gestión por WhatsApp.
            </p>
            {ultimoPedido && (
              <p style={styles.resumeTotal}>Número de pedido: #{ultimoPedido.numero}</p>
            )}
            <button style={styles.buyBtn} onClick={reiniciarDesdeCero}>
              Volver a la página principal
            </button>
          </div>
        </div>
      )}

      {vista === "cajitas" && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("home")}>
            Volver
          </button>
          <h2 style={styles.sectionTitle}>Cajitas literarias</h2>
          {Object.entries(CAJAS).map(([key, caja]) => (
            <div key={key} style={styles.card} onClick={() => abrirProducto(key)}>
              <img src={caja.img} style={styles.productImg} alt={caja.nombre} />
              <div>
                <h3>{caja.nombre}</h3>
                <p>{caja.precio}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {vista === "citas" && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("home")}>
            Volver
          </button>
          <h2 style={styles.sectionTitle}>Citas a ciegas</h2>
          <div style={styles.citaContainer}>
            <img src={cita} style={styles.citaImg} alt="Citas a ciegas" />
          </div>
          {Object.entries(CITAS).map(([key, item]) => (
            <div key={key} style={styles.citaCard}>
              <h3>{item.nombre}</h3>
              <p style={styles.price}>{item.precio}</p>
              <p style={styles.description}>{item.descripcion}</p>
              <button style={styles.buyBtn} onClick={() => abrirCita(key)}>
                Personalizar esta cita
              </button>
            </div>
          ))}
        </div>
      )}

      {vista === "producto" && producto && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("cajitas")}>
            Volver
          </button>
          <div style={styles.productPage}>
            <img src={producto.img} style={styles.bigImg} alt={producto.nombre} />
            <h2>{producto.nombre}</h2>
            <p style={styles.price}>{producto.precio}</p>
            <p style={styles.description}>{producto.descripcion}</p>

            <select
              value={cantidad}
              onChange={(e) => cambiarCantidad(Number(e.target.value))}
              style={styles.select}
            >
              {CANTIDADES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            {formularios.map((form, index) => (
              <div key={index} style={styles.formBox}>
                <h4>Cajita {index + 1}</h4>
                <select
                  value={form.libro}
                  onChange={(e) => actualizarFormulario(index, "libro", e.target.value)}
                  style={styles.input}
                >
                  <option value="">Selecciona libro</option>
                  {LIBROS.map((libro) => (
                    <option key={libro} value={libro}>
                      {libro}
                    </option>
                  ))}
                </select>
                <select
                  value={form.color}
                  onChange={(e) => actualizarFormulario(index, "color", e.target.value)}
                  style={styles.input}
                >
                  <option value="">Selecciona color</option>
                  {COLORES.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <button style={styles.buyBtn} onClick={agregarCarrito}>
              Personalizar y agregar
            </button>
          </div>
        </div>
      )}

      {vista === "citaProducto" && citaSeleccionada && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("citas")}>
            Volver
          </button>
          <div style={styles.productPage}>
            <img
              src={citaSeleccionada.img}
              style={styles.bigImg}
              alt={citaSeleccionada.nombre}
            />
            <h2>{citaSeleccionada.nombre}</h2>
            <p style={styles.price}>{citaSeleccionada.precio}</p>
            <p style={styles.description}>{citaSeleccionada.descripcion}</p>

            <h3 style={styles.sectionTitle}>Encuesta de personalización</h3>

            <div style={styles.formBox}>
              <label style={styles.label}>Cantidad de citas</label>
              <select
                value={cantidadCita}
                onChange={(e) => cambiarCantidadCita(Number(e.target.value))}
                style={styles.input}
              >
                {CANTIDADES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {encuestasCita.map((encuesta, citaIndex) => (
              <div key={citaIndex} style={styles.formBox}>
                <h4 style={styles.subTitle}>Cita {citaIndex + 1}</h4>

                <DropdownMultiSelect
                  label="1) ¿Qué géneros disfrutas más? (máx. 3)"
                  options={GENEROS}
                  selected={encuesta.generos}
                  max={3}
                  placeholder="Selecciona hasta 3"
                  onToggle={(value) =>
                    toggleMultiSelectCita(citaIndex, "generos", value, 3)
                  }
                />

                <DropdownMultiSelect
                  label="2) ¿Qué tipo de historia quieres recibir? (máx. 2)"
                  options={TIPOS_HISTORIA}
                  selected={encuesta.tipoHistoria}
                  max={2}
                  placeholder="Selecciona hasta 2"
                  onToggle={(value) =>
                    toggleMultiSelectCita(citaIndex, "tipoHistoria", value, 2)
                  }
                />

                <label style={styles.label}>3) ¿Qué tan spicy te gustan los libros?</label>
                <select
                  value={encuesta.spicy}
                  onChange={(e) =>
                    actualizarTextoCita(citaIndex, "spicy", e.target.value)
                  }
                  style={styles.input}
                >
                  <option value="">Selecciona una opción</option>
                  {SPICE.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <DropdownMultiSelect
                  label="4) ¿Qué tropes amas leer? (máx. 3)"
                  options={TROPES}
                  selected={encuesta.tropes}
                  max={3}
                  placeholder="Selecciona hasta 3"
                  onToggle={(value) =>
                    toggleMultiSelectCita(citaIndex, "tropes", value, 3)
                  }
                />

                <DropdownMultiSelect
                  label="5) ¿Qué estilo quieres para tu paquete? (máx. 2)"
                  options={ESTILOS}
                  selected={encuesta.estiloPaquete}
                  max={2}
                  placeholder="Selecciona hasta 2"
                  onToggle={(value) =>
                    toggleMultiSelectCita(citaIndex, "estiloPaquete", value, 2)
                  }
                />

                <label style={styles.label}>6) ¿Cuál es uno de tus libros favoritos?</label>
                <input
                  type="text"
                  value={encuesta.libroFavorito}
                  onChange={(e) =>
                    actualizarTextoCita(citaIndex, "libroFavorito", e.target.value)
                  }
                  style={styles.input}
                />

                <label style={styles.label}>7) ¿Qué autores amas leer?</label>
                <input
                  type="text"
                  value={encuesta.autoresAmas}
                  onChange={(e) =>
                    actualizarTextoCita(citaIndex, "autoresAmas", e.target.value)
                  }
                  style={styles.input}
                />

                <label style={styles.label}>8) ¿Qué autores o libros NO quieres recibir? (opcional)</label>
                <input
                  type="text"
                  value={encuesta.noQuieresRecibir}
                  onChange={(e) =>
                    actualizarTextoCita(citaIndex, "noQuieresRecibir", e.target.value)
                  }
                  style={styles.input}
                />

                <label style={styles.label}>9) ¿Prefieres libros...?</label>
                <select
                  value={encuesta.preferenciaLibro}
                  onChange={(e) =>
                    actualizarTextoCita(citaIndex, "preferenciaLibro", e.target.value)
                  }
                  style={styles.input}
                >
                  <option value="">Selecciona una opción</option>
                  {PREFERENCIA_LIBRO.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <label style={styles.label}>10) Comentarios adicionales (opcional)</label>
                <textarea
                  value={encuesta.comentarios}
                  onChange={(e) =>
                    actualizarTextoCita(citaIndex, "comentarios", e.target.value)
                  }
                  style={styles.textarea}
                />
              </div>
            ))}

            <button style={styles.buyBtn} onClick={agregarCitaCarrito}>
              Guardar encuesta(s) y agregar al carrito
            </button>
          </div>
        </div>
      )}

      {vista === "checkout" && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("home")}>
            Volver
          </button>
          <h2 style={styles.sectionTitle}>Finalizar compra</h2>

          <div style={styles.formBox}>
            <label style={styles.label}>Nombre completo</label>
            <input
              style={styles.input}
              value={checkout.nombre}
              onChange={(e) => actualizarCheckout("nombre", e.target.value)}
            />

            <label style={styles.label}>Número de WhatsApp</label>
            <input
              style={styles.input}
              value={checkout.whatsapp}
              onChange={(e) => actualizarCheckout("whatsapp", e.target.value)}
            />

            <label style={styles.label}>Ciudad</label>
            <select
              style={styles.input}
              value={checkout.ciudadEnvio}
              onChange={(e) => actualizarCheckout("ciudadEnvio", e.target.value)}
            >
              {CIUDADES_ENVIO.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {checkout.ciudadEnvio === "otra" && (
              <>
                <label style={styles.label}>Escribe tu ciudad</label>
                <input
                  style={styles.input}
                  value={checkout.otraCiudad}
                  onChange={(e) => actualizarCheckout("otraCiudad", e.target.value)}
                />
              </>
            )}

            <label style={styles.label}>Dirección</label>
            <input
              style={styles.input}
              value={checkout.direccion}
              onChange={(e) => actualizarCheckout("direccion", e.target.value)}
            />

            <label style={styles.label}>Tipo de vivienda</label>
            <input
              style={styles.input}
              placeholder="Casa, apartamento, unidad..."
              value={checkout.tipoVivienda}
              onChange={(e) => actualizarCheckout("tipoVivienda", e.target.value)}
            />

            <label style={styles.label}>¿Es para ti o es regalo?</label>
            <select
              style={styles.input}
              value={checkout.tipoEntrega}
              onChange={(e) => actualizarCheckout("tipoEntrega", e.target.value)}
            >
              <option value="personal">Para mí</option>
              <option value="regalo">Es regalo</option>
            </select>

            {checkout.tipoEntrega === "regalo" && (
              <>
                <label style={styles.label}>Nombre de quien recibe</label>
                <input
                  style={styles.input}
                  value={checkout.nombreRecibe}
                  onChange={(e) => actualizarCheckout("nombreRecibe", e.target.value)}
                />

                <label style={styles.label}>Mensaje para tarjeta</label>
                <textarea
                  style={styles.textarea}
                  value={checkout.mensajeRegalo}
                  onChange={(e) => actualizarCheckout("mensajeRegalo", e.target.value)}
                />
              </>
            )}

            <label style={styles.label}>Método de pago</label>
            <select
              style={styles.input}
              value={checkout.metodoPago}
              onChange={(e) => actualizarCheckout("metodoPago", e.target.value)}
            >
              <option value="">Selecciona método</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Efectivo contra entrega (solo Cali)">
                Efectivo contra entrega (solo Cali)
              </option>
            </select>

            <p style={styles.notice}>Domicilio en Cali: 8.000 COP</p>
            <p style={styles.notice}>Palmira, Yumbo, Jamundí: 15.000 COP</p>
            <p style={styles.notice}>Medellín y Bogotá: 25.000 COP</p>

            <div style={styles.resumeBox}>
              <p style={styles.resumeText}>Subtotal productos: {formatoCOP(subtotalCOP)}</p>
              <p style={styles.resumeText}>Envío: {formatoCOP(envioCOP)}</p>
              <p style={styles.resumeTotal}>Total a pagar: {formatoCOP(totalFinalCOP)}</p>
            </div>

            <button style={styles.buyBtn} onClick={finalizarPorWhatsApp}>
              Confirmar compra por WhatsApp
            </button>
          </div>
        </div>
      )}

      {vista === "productos" && (
        <div style={styles.page}>
          <button style={styles.back} onClick={() => setVista("home")}>
            Volver
          </button>
          <h2 style={styles.sectionTitle}>Más productos</h2>
          <p style={styles.text}>Próximamente nuevos productos de la tienda.</p>
        </div>
      )}

      <div style={styles.footer}>
        <div style={styles.footerBlock}>
          <h3>Magic Books</h3>
          <p style={styles.textLong}>
            Magic Books es una tienda de experiencias literarias personalizadas.
            Diseñamos cada cajita y cada cita a ciegas para que leer sea un momento
            especial, íntimo y memorable.
          </p>
        </div>

        <div style={styles.footerBlockCentered}>
          <h3>Redes</h3>
          <a
            href="https://www.instagram.com/magicbooks.shop?igsh=MWtiaTEyOTYxOWZkeg=="
            target="_blank"
            rel="noreferrer"
            style={styles.social}
          >
            <img src={instagram} style={styles.icon} alt="Instagram" />
            Instagram
          </a>
          <a
            href="https://www.tiktok.com/@magic.books.shop?_r=1&_t=ZS-96A9iTH8EHE"
            target="_blank"
            rel="noreferrer"
            style={styles.social}
          >
            <img src={tiktok} style={styles.icon} alt="TikTok" />
            TikTok
          </a>
        </div>
      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const styles = {
  app: { fontFamily: "sans-serif", background: "#f7f0ff", minHeight: "100vh", padding: "20px" },
  topBar: { display: "flex", justifyContent: "flex-end", gap: "15px", position: "relative" },
  menuWrapper: { position: "relative" },
  iconBtn: {
    fontSize: "16px",
    border: "none",
    background: "#ffffff",
    cursor: "pointer",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#5b3a8a"
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "42px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    padding: "10px",
    minWidth: "220px",
    zIndex: 999
  },
  menuItem: { padding: "12px", cursor: "pointer", color: "#5b3a8a", fontWeight: "500" },
  divider: { height: "1px", background: "#eee" },
  cartBox: {
    position: "absolute",
    right: 0,
    top: "42px",
    background: "#fff",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    width: "340px",
    zIndex: 999,
    maxHeight: "70vh",
    overflowY: "auto"
  },
  emptyCart: { margin: 0 },
  cartItem: { borderBottom: "2px solid #ddd", paddingBottom: "12px", marginBottom: "12px", textAlign: "left" },
  cartTitle: { marginBottom: "10px", color: "#5b3a8a" },
  cartText: { margin: "4px 0", color: "#444", fontSize: "14px" },
  resumeBox: { background: "#f3e7ff", borderRadius: "10px", padding: "10px 12px", marginTop: "8px", marginBottom: "10px" },
  resumeText: { margin: "4px 0", color: "#5b3a8a", fontSize: "14px" },
  resumeTotal: { margin: "4px 0", color: "#5b3a8a", fontWeight: "bold" },
  clearBtn: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "10px",
    background: "#eee",
    cursor: "pointer",
    marginTop: "10px"
  },
  buyBtnCart: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "10px",
    background: "#d9b3ff",
    cursor: "pointer",
    marginTop: "10px"
  },
  header: { textAlign: "center" },
  logo: { width: "90px" },
  title: { fontSize: "40px", color: "#5b3a8a" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", marginTop: "40px" },
  orderStatusBox: {
    background: "#fff",
    border: "1px solid #e6d6ff",
    borderRadius: "12px",
    padding: "14px",
    width: "320px",
    textAlign: "center"
  },
  orderStatusTitle: { margin: "0 0 6px 0", color: "#5b3a8a" },
  orderStatusText: { margin: 0, color: "#666", fontSize: "14px" },
  btn: { padding: "12px", width: "220px", borderRadius: "12px", border: "none", background: "#d9b3ff", cursor: "pointer" },
  page: { padding: "20px" },
  back: { marginBottom: "20px", border: "none", background: "#eee", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" },
  sectionTitle: { textAlign: "center", color: "#5b3a8a" },
  subTitle: { color: "#5b3a8a", marginTop: 0 },
  card: { display: "flex", gap: "15px", background: "#fff", padding: "12px", borderRadius: "12px", marginBottom: "10px", cursor: "pointer" },
  citaContainer: { display: "flex", justifyContent: "center", marginBottom: "25px" },
  citaImg: { width: "220px", borderRadius: "15px" },
  citaCard: { background: "#fff", padding: "20px", borderRadius: "15px", marginBottom: "15px" },
  productImg: { width: "70px", height: "70px", objectFit: "cover", borderRadius: "10px" },
  productPage: { textAlign: "center" },
  bigImg: { width: "220px", borderRadius: "15px" },
  price: { color: "#5b3a8a", fontWeight: "bold" },
  description: { maxWidth: "650px", margin: "0 auto 20px" },
  select: { padding: "10px", borderRadius: "10px", marginBottom: "15px" },
  formBox: {
    marginTop: "15px",
    background: "#fff",
    padding: "15px",
    borderRadius: "12px",
    maxWidth: "760px",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "left"
  },
  confirmCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    maxWidth: "520px",
    margin: "0 auto",
    textAlign: "center"
  },
  input: { display: "block", width: "100%", margin: "8px 0 16px", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" },
  textarea: {
    display: "block",
    width: "100%",
    marginTop: "8px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    minHeight: "90px",
    resize: "vertical"
  },
  buyBtn: { marginTop: "15px", padding: "12px", background: "#d9b3ff", border: "none", borderRadius: "10px", cursor: "pointer" },
  notice: { margin: "6px 0", color: "#666", fontSize: "14px" },
  footer: {
    marginTop: "50px",
    borderTop: "1px solid #ddd",
    paddingTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap"
  },
  footerBlock: { flex: "1 1 320px", maxWidth: "650px" },
  footerBlockCentered: { flex: "1 1 260px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  text: { fontSize: "14px", color: "#666" },
  textLong: { fontSize: "14px", color: "#666", lineHeight: "1.6" },
  social: { display: "flex", gap: "8px", alignItems: "center", textDecoration: "none", marginTop: "8px", color: "#5b3a8a" },
  icon: { width: "18px", height: "18px" },
  label: { display: "block", marginBottom: "6px", color: "#5b3a8a", fontWeight: 600 },
  dropdownMulti: { marginBottom: "16px", border: "1px solid #ddd", borderRadius: "10px", overflow: "hidden", background: "#fff" },
  dropdownSummary: {
    cursor: "pointer",
    listStyle: "none",
    padding: "12px",
    fontWeight: 600,
    color: "#5b3a8a",
    display: "flex",
    justifyContent: "space-between",
    gap: "8px"
  },
  dropdownCount: { fontWeight: 400, color: "#666", fontSize: "13px" },
  dropdownPanel: { borderTop: "1px solid #eee", maxHeight: "220px", overflowY: "auto", padding: "10px" },
  checkboxItem: { display: "flex", gap: "8px", alignItems: "center", padding: "6px 0", color: "#444" }
}