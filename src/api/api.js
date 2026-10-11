const BASE_URL = import.meta.env.VITE_API_URL || ''

async function requestGet(path) {
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


// Resurces

export function getResources() {
  return requestGet('/api/resources')
}

export function getResource(id) {
  return requestGet(`/api/resources/${id}`)
}

export function getBookingsByResource(id) {
  return requestGet(`/api/bookings/resource/${id}`)
}

// Booking

export function addBooking(body) {
  return requestPost(`/api/bookings`, body)
}

export function deleteBookings(id) {
  return requestDelete(`/api/bookings/${id}`)
}


// User

export function getUsers() {
  return requestGet(`/api/users`)
}
