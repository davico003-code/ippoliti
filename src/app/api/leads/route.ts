import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const apiKey = process.env.TOKKO_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const tokkoPayload = {
    name: body.name || '',
    email: body.email || '',
    phone: body.phone || '',
    message: `Operación: ${body.operation || 'Venta'} | Tipo: ${body.propertyType || 'Casa'} | Presupuesto: ${body.budget || 'Sin límite'} | Fuente: Web siinmobiliaria.com`,
    source: 'Web',
    tags: [body.operation || 'Venta', body.propertyType || 'Casa'],
  }

  try {
    const response = await fetch(
      `https://www.tokkobroker.com/api/v1/contact/?key=${apiKey}&format=json`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokkoPayload),
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Error saving lead' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error connecting to CRM' }, { status: 500 })
  }
}
