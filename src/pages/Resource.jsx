import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Recource() {
    const [resource, setResource] = useState([])
    const [bookings, setBookings] = useState([])
    const [bookingsIsOk, setBookingsIsOk] = useState(false)
    const [error, setError] = useState('')
    const resource_id = window.sessionStorage.getItem("resource_id");

    useEffect(() => {
      const apiUrl = import.meta.env.VITE_API_URL

      fetch(`${apiUrl}/api/resources/${resource_id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Kunde inte hämta resursen')
          }

          return response.json()
        })
        .then((data) => {
          setResource(data)
        })
        .catch((error) => {
          setError(error.message)
        })

      fetch(`${apiUrl}/api/bookings/resource/${resource_id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Kunde inte hämta bokningarna')
          }

          return response.json()
        })
        .then((data) => {
          setBookings(data)
          setBookingsIsOk(true)
        })
        .catch((error) => {
          setError(error.message)
        })
    }, [])

  return (
    <main className="main" id="main">
      <h2>{resource.name}</h2>
    <p>{resource.type} — {resource.description}</p>
    <p>Kapacitet: {resource.capacity}</p>

    <h3>Bokningar</h3>
    {bookingsIsOk ? (
        bookings.map((booking) => (
            <div key={booking._id} onClick={() => booking(booking._id) } className="booking-card">
                <p><strong>{booking.user}</strong></p>
                <p>{booking.start_time} - {booking.end_time}</p>
                <p className="status">{booking.status}</p>
            </div>
        ))
    ) : (
    <div>
        <p>Inga bokningar för denna resurs.</p>
    </div>
    )}
    

    {/* <h3>Ny bokning</h3>
    <form method="POST" action="/bookings" className="booking-form">
        <input type="hidden" name="resource_id" value="${resource_id}" />

        <label for="user">Användare</label>
        <input type="text" name="user" placeholder="namn@student.bth.se" required />

        <label for="start_time">Starttid</label>
        <input type="datetime-local" name="start_time" required />

        <label for="end_time">Sluttid</label>
        <input type="datetime-local" name="end_time" required />

        <input type="submit" value="Boka" />
    </form> */}
      
    </main>
  );
}
