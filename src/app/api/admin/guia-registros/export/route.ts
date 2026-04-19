import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { Redis } from '@upstash/redis'
import type { GuiaRegistro } from '@/app/api/guia/acceso/route'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const GREEN = 'FF1A5C38'

function authorize(req: Request): boolean {
  const expected = process.env.ADMIN_EXPORT_TOKEN
  if (!expected) return false
  const header = req.headers.get('x-admin-token')
  const url = new URL(req.url)
  const qp = url.searchParams.get('token')
  const token = header ?? qp
  return token === expected
}

async function readAll(): Promise<GuiaRegistro[]> {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return []
  const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
  const raw = await redis.lrange('guia:registros:all', 0, -1)
  const items: GuiaRegistro[] = []
  for (const r of raw) {
    try {
      const parsed = typeof r === 'string' ? JSON.parse(r) : (r as unknown as GuiaRegistro)
      if (parsed && typeof parsed === 'object' && 'email' in parsed) {
        items.push(parsed as GuiaRegistro)
      }
    } catch { /* ignore */ }
  }
  items.sort((a, b) => (b.fecha > a.fecha ? 1 : -1))
  return items
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await readAll()

  const wb = new ExcelJS.Workbook()
  wb.creator = 'SI Inmobiliaria'
  wb.created = new Date()
  const ws = wb.addWorksheet('Registros Guía', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  ws.columns = [
    { header: 'Fecha', key: 'fecha', width: 22 },
    { header: 'Nombre', key: 'nombre', width: 28 },
    { header: 'Email', key: 'email', width: 32 },
    { header: 'WhatsApp', key: 'whatsapp', width: 18 },
    { header: 'IP', key: 'ip', width: 16 },
    { header: 'User Agent', key: 'userAgent', width: 50 },
  ]

  // Header styling
  const headerRow = ws.getRow(1)
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    cell.alignment = { vertical: 'middle', horizontal: 'left' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    }
  })
  headerRow.height = 24

  // Data rows
  for (const r of items) {
    const dt = new Date(r.fecha)
    ws.addRow({
      fecha: dt,
      nombre: r.nombre,
      email: r.email,
      whatsapp: r.whatsapp ?? '',
      ip: r.ip ?? '',
      userAgent: r.userAgent ?? '',
    })
  }

  // Apply date format to fecha column
  ws.getColumn('fecha').numFmt = 'yyyy-mm-dd hh:mm:ss'

  // Light zebra for readability
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return
    if (rowNumber % 2 === 0) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7F7' } }
      })
    }
    row.alignment = { vertical: 'middle' }
  })

  const buf = await wb.xlsx.writeBuffer()
  const filename = `guia-registros-${new Date().toISOString().slice(0, 10)}.xlsx`
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
