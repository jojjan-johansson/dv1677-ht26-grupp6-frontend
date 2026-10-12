const BASE_URL = import.meta.env.VITE_API_URL || ''

async function requestGet(path) {
  const res = await fetch(`${BASE_URL}${path}`)

  if (!res.ok) {
    throw new Error(`API svarade ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// User

export function getUsers() {
  return requestGet(`/api/users`)
}
