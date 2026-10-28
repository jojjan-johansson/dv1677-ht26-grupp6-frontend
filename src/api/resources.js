const BASE_URL = import.meta.env.VITE_API_URL || ''

async function requestGet(path) {
  const res = await fetch(`${BASE_URL}${path}`)

  if (!res.ok) {
    throw new Error(`API svarade ${res.status} ${res.statusText}`)
  }

  return res.json()
}


// Resurces

export function getResources() {
  return requestGet('/api/resources')
}

export function getResource(id) {
  return requestGet(`/api/resources/${id}`)
}
