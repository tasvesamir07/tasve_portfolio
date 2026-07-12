export async function createSessionToken(password: string): Promise<string> {
  const uuid = crypto.randomUUID()
  const encoder = new TextEncoder()
  const keyData = encoder.encode(password)
  const data = encoder.encode(uuid)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', key, data)

  const hmac = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return `${uuid}.${hmac}`
}

export async function validateSessionToken(token: string, password: string): Promise<boolean> {
  const [uuid, hmac] = token.split('.')
  if (!uuid || !hmac) return false

  const encoder = new TextEncoder()
  const keyData = encoder.encode(password)
  const data = encoder.encode(uuid)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', key, data)

  const expected = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return hmac === expected
}
