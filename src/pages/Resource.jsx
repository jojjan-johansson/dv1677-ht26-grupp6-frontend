import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getResource, getBookingsByResource, getUsers, addBooking, deleteBookings } from "../api";

export default function Recource() {
  const [resource, setResource] = useState({});
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookedBy, setBookedBy] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");


  const resourceId = window.sessionStorage.getItem("resource_id");
  const navigate = useNavigate();

  const loadBookings = () => {

    return getBookingsByResource(resourceId)
            .then(setBookings)
            .catch(setError)
            .finally(() => setLoading(false))
  };

  useEffect(() => {
    getResource(resourceId)
      .then(setResource)
      .catch(setError)
          .finally(() => setLoading(false))

    loadBookings().catch((error) => {
      setError(error.message);
    });

    getUsers()
      .then((data) => {
        setUsers(data);

        if (data.length > 0) {
          setBookedBy(data[0]._id);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, []);

  const getUserEmail = (userId) => {
    const user = users.find((user) => user._id === userId);
    return user ? user.email : userId;
  };

  const createBooking = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true)

    if (!bookedBy || !startTime || !endTime) {
      setError("Fyll i alla fält.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("Sluttiden måste vara efter starttiden.");
      return;
    }

    try {

      const data = {
          resource_id: resourceId,
          booked_by: bookedBy,
          start_time: startTime,
          end_time: endTime
        }
      const response = await addBooking(data)

      if (!response.ok) {
        throw new Error("Kunde inte skapa bokningen");
      }

      setStartTime("");
      setEndTime("");

      await loadBookings();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false)
    }
  };

  const deleteBooking = async (bookingId) => {
    setError("");
    setLoading(true)

    try {
      const response = await deleteBookings(bookingId)

      if (!response.ok) {
        throw new Error("Kunde inte ta bort bokningen");
      }

      await loadBookings();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false)
    }
  };

  const backToResources = () => {
    navigate("/");
  };

  if (loading) return <p>Laddar..</p>

  return (
    <main className="main" id="main">
      <button
        type="button"
        className="btn"
        onClick={backToResources}
      >
        ← Tillbaka till resurser
      </button>

      <h2>{resource.name}</h2>

      <p>
        {resource.type} — {resource.description}
      </p>

      <p>Kapacitet: {resource.capacity}</p>

      {error && <p>{error}</p>}
      

      <h3>Bokningar</h3>

      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div key={booking._id} className="booking-card">
            <p>
              <strong>{getUserEmail(booking.booked_by)}</strong>
            </p>

            <p>
              {booking.start_time} - {booking.end_time}
            </p>

            <p className="status">{booking.status}</p>

            <button
              type="button"
              className="btn"
              onClick={() => deleteBooking(booking._id)}
            >
              Ta bort bokning
            </button>
          </div>
        ))
      ) : (
        <p>Inga bokningar för denna resurs.</p>
      )}

      <h3>Ny bokning</h3>

      <form className="booking-form" onSubmit={createBooking}>
        <label htmlFor="booked_by">Användare</label>

        <select
          id="booked_by"
          value={bookedBy}
          onChange={(event) => setBookedBy(event.target.value)}
          required
        >
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.email}
            </option>
          ))}
        </select>

        <label htmlFor="start_time">Starttid</label>

        <input
          id="start_time"
          type="datetime-local"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          required
        />

        <label htmlFor="end_time">Sluttid</label>

        <input
          id="end_time"
          type="datetime-local"
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
          required
        />

        <button type="submit" className="btn">
          Boka
        </button>
      </form>
    </main>
  );
}