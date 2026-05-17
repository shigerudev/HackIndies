/** Mensajes legibles para errores de fetch en el cliente (solo UI). */

export function formatApiError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  const msg = raw.trim() || 'Error desconocido'
  const lower = msg.toLowerCase()

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    msg === 'Network request failed' ||
    lower.includes('load failed')
  ) {
    return 'Sin conexión con la API. Comprueba que el backend esté en marcha y que NEXT_PUBLIC_API_URL en web/.env.local apunte al puerto correcto.'
  }

  if (/^api\s+\d+/i.test(msg)) {
    return `La API respondió con error (${msg}). Revisa el servidor o la configuración.`
  }

  return msg
}
