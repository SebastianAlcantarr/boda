import {
    iniciarWhatsApp,
    obtenerEstadoWhatsApp
} from '../../utils/whatsapp'

export default defineEventHandler(async () => {
    await iniciarWhatsApp()

    return obtenerEstadoWhatsApp()
})