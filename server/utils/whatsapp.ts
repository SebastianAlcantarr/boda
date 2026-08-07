import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    type WASocket
} from '@whiskeysockets/baileys'

import QRCode from 'qrcode'
import pino from 'pino'

const AUTH_DIR = './whatsapp-session'

let socket: WASocket | null = null
let qrActual: string | null = null
let conectado = false
let iniciando = false
let reinicioPendiente = false
let inicioPromise: Promise<void> | null = null

function obtenerStatusCode(error: any) {
    return error?.output?.statusCode ?? error?.statusCode ?? error?.cause?.output?.statusCode
}

async function crearSocket() {
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

        console.log('connection.update', {
            connection,
            hasQr: Boolean(qr)
        })

        if (qr) {
            console.log('QR generado')
            qrActual = await QRCode.toDataURL(qr)
        }

        if (connection === 'connecting') {
            console.log('connecting')
        }

        if (connection === 'open') {
            console.log('open')
            conectado = true
            qrActual = null
            reinicioPendiente = false
        }

        if (connection === 'close') {
            const statusCode = obtenerStatusCode(lastDisconnect?.error)
            console.log('close')
            console.log('statusCode de desconexión', statusCode)
            console.error('error completo', lastDisconnect?.error)

            conectado = false
            socket = null

            if (statusCode === DisconnectReason.loggedOut) {
                qrActual = null
                reinicioPendiente = false
                return
            }

            if (!reinicioPendiente) {
                reinicioPendiente = true
                setTimeout(() => {
                    reinicioPendiente = false
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
    inicioPromise = (async () => {
        try {
            console.log('connecting')
            socket = await crearSocket()
        } catch (error) {
            console.error('error completo', error)
            socket = null
            conectado = false
            qrActual = null
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
        qr: qrActual
    }
}

export function obtenerSocketWhatsApp() {
    return socket
}

export function estaConectadoWhatsApp() {
    return conectado
}
