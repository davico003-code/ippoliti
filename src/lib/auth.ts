import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { getAgentById, type Agent } from './agents'

const SECRET = new TextEncoder().encode(process.env.AGENT_JWT_SECRET ?? 'si-secret-2026')
const COOKIE_NAME = 'si_agent_token'

export async function createAgentToken(agent: Agent): Promise<string> {
  return new SignJWT({ id: agent.id, username: agent.username, name: agent.name, role: agent.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyAgentToken(token: string): Promise<Agent | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    const id = payload.id as string
    return getAgentById(id)
  } catch {
    return null
  }
}

export async function getAgentFromCookies(): Promise<Agent | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyAgentToken(token)
}

export { COOKIE_NAME, SECRET }
