import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    type WASocket
} from '@whiskeysockets/baileys'

import QRCode from 'qrcode'
import pino from 'pino'
import { resolve } from 'node:path'

// Hostinger deploys each build under a versioned directory. This must point to
// a directory outside that build so Baileys credentials survive deployments.
const AUTH_DIR = resolve(process.env.WHATSAPP_AUTH_DIR || '/home/u676878540/whatsapp-session')

let socket: WASocket | null = null
let qrActual: string | null = null
let conectado = false
let iniciando = false
let reinicioPendiente = false
let inicioPromise: Promise<void> | null = null
let estado: 'starting' | 'qr' | 'connecting' | 'connected' | 'logged_out' | 'error' = 'starting'
let errorActual: string | null = null

function obtenerStatusCode(error: any) {
    return error?.output?.statusCode ?? error?.statusCode ?? error?.cause?.output?.statusCode
}

async function crearSocket() {
    console.log('[WhatsApp] iniciando socket', { authDir: AUTH_DIR })
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)

    const nuevoSocket = makeWASocket({
        auth: state,
        logger: pino({ level: 'info' }),
        browser: Browsers.macOS('Chrome'),
        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: false
    })

    nuevoSocket.ev.on('creds.update', saveCreds)

    nuevoSocket.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            console.log('[WhatsApp] QR recibido')
            qrActual = await QRCode.toDataURL(qr)
            estado = 'qr'
            errorActual = null
        }

        if (connection === 'connecting') {
            console.log('[WhatsApp] conectando')
            estado = 'connecting'
            errorActual = null
        }

        if (connection === 'open') {
            console.log('[WhatsApp] conexión abierta')
            conectado = true
            qrActual = null
            reinicioPendiente = false
            estado = 'connected'
            errorActual = null
        }

        if (connection === 'close') {
            const statusCode = obtenerStatusCode(lastDisconnect?.error)
            const message = lastDisconnect?.error?.message || 'Conexión cerrada'
            console.log('[WhatsApp] conexión cerrada')
            console.log('[WhatsApp] reason:', statusCode ?? 'unknown')

            conectado = false
            socket = null

            if (statusCode === DisconnectReason.loggedOut) {
                console.log('[WhatsApp] loggedOut')
                qrActual = null
                reinicioPendiente = false
                estado = 'logged_out'
                errorActual = 'Sesión cerrada; se requiere un nuevo QR.'
                return
            }

            // A conflict means another process/device is using this session.
            // Retrying in a loop would keep both connections fighting.
            if (statusCode === DisconnectReason.connectionReplaced || message.toLowerCase().includes('conflict')) {
                estado = 'error'
                errorActual = 'Conflicto de conexión de WhatsApp. Verifica que solo haya una aplicación usando esta sesión.'
                reinicioPendiente = false
                return
            }

            estado = 'error'
            errorActual = `Conexión cerrada (${statusCode ?? 'sin código'}).`

            if (!reinicioPendiente && statusCode !== DisconnectReason.badSession) {
                reinicioPendiente = true
                setTimeout(() => {
                    reinicioPendiente = false
                    console.log('[WhatsApp] reconectando')
                    void iniciarWhatsApp()
                }, 3000)
            }
        }
    })

    return nuevoSocket
}

export async function iniciarWhatsApp() {
    if (socket || iniciando) return inicioPromise ?? undefined

    iniciando = true
    estado = 'starting'
    errorActual = null
    inicioPromise = (async () => {
        try {
            socket = await crearSocket()
        } catch (error) {
            console.error('[WhatsApp] error al iniciar socket', error)
            socket = null
            conectado = false
            qrActual = null
            estado = 'error'
            errorActual = 'No se pudo iniciar la conexión de WhatsApp.'
        } finally {
            iniciando = false
            inicioPromise = null
        }
    })()

    return inicioPromise
}

export function obtenerEstadoWhatsApp() {
    return {
        conectado,
        qr: qrActual,
        estado,
        error: errorActual
    }
}

export function obtenerSocketWhatsApp() {
    return socket
}

export function estaConectadoWhatsApp() {
    return conectado
}
