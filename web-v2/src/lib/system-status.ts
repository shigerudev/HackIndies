export type SystemStatusState = 'online' | 'degraded' | 'offline' | 'loading'

export interface SystemStatus {
  state: SystemStatusState
  label: string
}

export function buildStatusMessage(
  apiOnline: boolean | null,
  pendingCount: number
): SystemStatus {
  if (apiOnline === null)
    return { state: 'loading', label: 'Conectando con el backend…' }
  if (!apiOnline)
    return { state: 'offline', label: 'Sin conexión al backend' }
  if (pendingCount === 0)
    return { state: 'online', label: 'Todo en orden · sin pendientes' }
  if (pendingCount === 1)
    return { state: 'degraded', label: '1 alerta esperando revisión' }
  return { state: 'degraded', label: `${pendingCount} alertas esperando revisión` }
}