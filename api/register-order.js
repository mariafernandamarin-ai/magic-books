const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzTUP91hSA0j_kM9JwQ4JShS14jgpapeNA0j3GJxNBDaC3tVRVpUUueGWypW4eAi-bLWA/exec"
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" })
  }

  try {
    const payload = req.body || {}

    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })

    const text = await upstream.text()
    let data = null

    try {
      data = JSON.parse(text)
    } catch {
      data = { ok: false, error: "Respuesta inválida de Apps Script", raw: text }
    }

    if (!upstream.ok) {
      return res.status(502).json({
        ok: false,
        error: data?.error || `Apps Script HTTP ${upstream.status}`,
        raw: data?.raw
      })
    }

    if (!data?.ok || !data?.numeroPedido) {
      return res.status(502).json({
        ok: false,
        error: data?.error || "Apps Script no devolvió numeroPedido"
      })
    }

    return res.status(200).json({
      ok: true,
      numeroPedido: Number(data.numeroPedido)
    })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || "Error interno registrando pedido"
    })
  }
}
