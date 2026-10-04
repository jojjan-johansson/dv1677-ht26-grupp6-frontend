const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`)

  if (!res.ok) {
    throw new Error(`API svarade ${res.status} ${res.statusText}`)
  }

  return res.json()
}

async function requestPost(path, data) {
  
  const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          data
        )})
  console.log(res)
  if (!res.ok) {
    throw new Error(`API svarade ${res.status} ${res.statusText}`)
  }

  return res
}

async function requestDelete(path) {
  const res = await fetch(`${BASE_URL}${path}`,
        {
          method: "DELETE"
        })

  if (!res.ok) {
    throw new Error(`API svarade ${res.status} ${res.statusText}`)
  }

  return res
}

export function getResources() {
  return request('/api/resources')
}

export function getResource(id) {
  return request(`/api/resources/${id}`)
}

export function getBookingsByResource(id) {
  return request(`/api/bookings/resource/${id}`)
}

export function getUsers() {
  return request(`/api/users`)
}

export function addBooking(body) {
  return requestPost(`/api/bookings`, body)
}

export function deleteBookings(id) {
  console.log("ok")
  return requestDelete(`/api/bookings/${id}`)
}