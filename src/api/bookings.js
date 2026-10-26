const BASE_URL = import.meta.env.VITE_API_URL || ''

function authHeader(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export async function getBookings(token) {
  const res = await fetch(`${BASE_URL}/api/bookings`, { headers: authHeader(token) })
  if (!res.ok) throw new Error('Failed to fetch bookings')
  return res.json()
}

export async function getBooking(token, id) {
  const res = await fetch(`${BASE_URL}/api/bookings/${id}`, { headers: authHeader(token) })
  if (!res.ok) throw new Error('Failed to fetch bookings')
  return res.json()
}

export async function getBookingsByResource(token, id) {
  const res = await fetch(`${BASE_URL}/api/bookings/resource/${id}`, { headers: authHeader(token) })
  if (!res.ok) throw new Error('Failed to fetch booking')
  return res.json()
}

export async function createBooking(token, body) {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Booking failed')
  return data
}

export async function editBooking(token, id, body) {
  const res = await fetch(`${BASE_URL}/api/bookings/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Booking failed')
  return data
}

export async function cancelBooking(token, id) {
  const res = await fetch(`${BASE_URL}/api/booking/cancel/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  })
  if (!res.ok) throw new Error('Failed to cancel booking')
  return res.json()
}
