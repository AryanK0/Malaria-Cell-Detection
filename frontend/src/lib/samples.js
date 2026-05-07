const localHosts = new Set(['localhost', '127.0.0.1'])
const isLocalHost = localHosts.has(window.location.hostname)

export const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  window.location.port === '5173' 
    ? `http://${window.location.hostname}:8000/api` // Guessing 8000 as default FastAPI port
    : '/api'
)


export const fallbackSamples = [
  { name: 'Parasitized 1', src: '/samples/para_1.png', expected: 'Parasitized' },
  { name: 'Parasitized 2', src: '/samples/para_2.png', expected: 'Parasitized' },
  { name: 'Uninfected 1', src: '/samples/uninf_1.png', expected: 'Uninfected' },
  { name: 'Uninfected 2', src: '/samples/uninf_2.png', expected: 'Uninfected' },
]

export function shuffleSamples(samples = fallbackSamples, limit = 4) {
  const next = [...samples]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next.slice(0, limit)
}

export async function getRandomSamples(limit = 4) {
  try {
    const response = await fetch(`${API_BASE}/samples?limit=${limit}&refresh=${Date.now()}`)
    if (!response.ok) throw new Error('Sample API unavailable')
    const body = await response.json()
    if (!Array.isArray(body.samples) || body.samples.length === 0) {
      throw new Error('No sample images returned')
    }
    return body.samples
  } catch {
    return shuffleSamples(fallbackSamples, limit)
  }
}
