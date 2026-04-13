const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER ?? '+5493412101694';

export async function enviarWhatsAppAdmin(mensaje: string): Promise<void> {
  if (!mensaje || !mensaje.trim()) {
    throw new Error('enviarWhatsAppAdmin: mensaje vacío');
  }

  // TODO Fase 2: reemplazar por llamada real al provider usado en /api/agendar-visita
  console.log(
    `[whatsapp] (stub) destino=${ADMIN_NUMBER} len=${mensaje.length} preview="${mensaje.slice(0, 80)}..."`,
  );
}

export function getAdminNumber(): string {
  return ADMIN_NUMBER;
}
