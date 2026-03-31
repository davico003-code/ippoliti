export type Agent = {
  id: string
  username: string
  name: string
  role: 'admin' | 'agent'
}

export const AGENTS: Agent[] = [
  { id: 'aldana',    username: 'aldana',    name: 'Aldana Ruiz',          role: 'agent' },
  { id: 'carolina',  username: 'carolina',  name: 'Carolina Echen',       role: 'agent' },
  { id: 'david',     username: 'david',     name: 'David Flores',         role: 'admin' },
  { id: 'gino',      username: 'gino',      name: 'Gino Pecchenino',      role: 'agent' },
  { id: 'gisela',    username: 'gisela',    name: 'Gisela Ramallo',       role: 'agent' },
  { id: 'laura',     username: 'laura',     name: 'Laura Flores',         role: 'admin' },
  { id: 'leticia',   username: 'leticia',   name: 'Leticia Alexenicer',   role: 'agent' },
  { id: 'lucia',     username: 'lucia',     name: 'Lucia Wilson',         role: 'agent' },
  { id: 'mariajose', username: 'mariajose', name: 'Maria Jose Espilocin', role: 'agent' },
  { id: 'mariana',   username: 'mariana',   name: 'Mariana Orlate',       role: 'agent' },
  { id: 'mauro',     username: 'mauro',     name: 'Mauro Matteucci',      role: 'agent' },
  { id: 'micaela',   username: 'micaela',   name: 'Micaela Gonzalez',     role: 'agent' },
]

const PASSWORD = process.env.AGENT_PASS ?? 'inmobiliaria2026'

export function findAgent(username: string, password: string): Agent | null {
  if (password !== PASSWORD) return null
  return AGENTS.find(a => a.username === username) ?? null
}

export function getAgentById(id: string): Agent | null {
  return AGENTS.find(a => a.id === id) ?? null
}
