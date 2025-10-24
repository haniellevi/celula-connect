import { randomBytes } from 'crypto'

export function generateApiKey(): string {
  const bytes = randomBytes(32)
  return bytes.toString('hex')
}


