import { readBody, createError } from 'h3'
import {
    iniciarWhatsApp,
    obtenerSocketWhatsApp,
    estaConectadoWhatsApp
} from '../../utils/whatsapp'

function limpiarTelefono(valor: string) {
    return valor.replace(/\D/g, '')
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{ nombre?: string; telefono?: string }>(event)
    const nombre = body?.nombre?.trim()
    const telefono = limpiarTelefono(body?.telefono ?? '')

    if (!nombre) {
        throw createError({ statusCode: 400, statusMessage: 'Nombre requerido' })
    }

    if (!telefono) {
        throw createError({ statusCode: 400, statusMessage: 'Telefono requerido' })
    }

    await iniciarWhatsApp()

    const socket = obtenerSocketWhatsApp()

    if (!socket || !estaConectadoWhatsApp()) {
        return {
            ok: false,
            error: 'WhatsApp no conectado'
        }
    }

    const [consulta] = await socket.onWhatsApp(telefono)

    if (!consulta?.exists) {
        return {
            ok: false,
            error: 'El numero no existe en WhatsApp',
            telefono
        }
    }

    const jid = consulta.jid ?? `${telefono}@s.whatsapp.net`
    const texto = `💍 Nueva confirmación de asistencia\n\nNombre: ${nombre}`

    try {
        await socket.sendMessage(jid, { text: texto })

        return {
            ok: true
            , jid
        }
    } catch (error) {
        console.error('error completo', error)

        return {
            ok: false,
            error: 'No se pudo enviar el mensaje',
            details: String(error)
        }
    }
})
