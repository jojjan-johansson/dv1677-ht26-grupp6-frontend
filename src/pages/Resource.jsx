import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getResource} from "../api/resources.js";
import { getUsers } from "../api/users.js";
import { getBookings, createBooking, cancelBooking, deleteBooking } from "../api/bookings.js";
import { useAuth } from '../context/AuthContext.jsx'

export default function Recource() {
  const { token, user } = useAuth()
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

  const loadBookings = useCallback(async () => {
    if (!token) return
    const b = await getBookings(token)
    setBookings(b.filter(bookings => bookings.resource_id === resourceId || bookings.resource_id?._id === resourceId))
  }, [token, resourceId])

  const getUserEmail = (userId) => {
    const user = users.find((user) => user._id === userId);
    return user ? user.email : userId;
  };

  useEffect(() => {
    getResource(resourceId)
      .then(setResource)
      .catch(setError)
          .finally(() => setLoading(false))

    loadBookings().catch((error) => {
      setError(error.message);
      console.log(error.message)
    });

    getUsers()
      .then((data) => {
        setUsers(data);

        if (user?.role === 'admin' && data.length > 0) {
          setBookedBy(data[0]._id);
        } else if (user?._id) {
          setBookedBy(user._id);
        }
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, []);

  const formattedTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return `${start.toLocaleString('sv-SE', {
      dateStyle: 'short',
      timeStyle: 'short'
    })} - ${end.toLocaleString('sv-SE', {
      dateStyle: 'short',
      timeStyle: 'short'
    })}`;
  }

  const createABooking = async (event) => {
    event.preventDefault();
    setError("");
    
    if (!bookedBy || !startTime || !endTime) {
      setError("Fyll i alla fält.");
      return;
    }
    
    if (new Date(endTime) <= new Date(startTime)) {
      setError("Sluttiden måste vara efter starttiden.");
      return;
    }
    setLoading(true)

    try {

      const data = {
          resource_id: resourceId,
          booked_by: bookedBy,
          start_time: startTime,
          end_time: endTime
        }
      await createBooking(token, data)

      setStartTime("");
      setEndTime("");

      await loadBookings();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false)
    }
  };

  const cancelTheBooking = async (bookingId) => {
    setError("");
    setLoading(true)

    try {
      await cancelBooking(token, bookingId)

      await loadBookings();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false)
    }
  };

  const deleteTheBooking = async (bookingId) => {
    setError("");
    setLoading(true)

    try {
      await deleteBooking(token, bookingId)

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

            <p>Bokad av: {getUserEmail(booking.booked_by)}</p>

            <p>
              {formattedTime(booking.start_time, booking.end_time )}
            </p>

            <p className="status">{booking.status}</p>

            <button
              type="button"
              className="btn"
              onClick={() => cancelTheBooking(booking._id)}
            >
              Avboka
            </button>

            {user.role === 'admin' ? (
          <>
            <button
              type="button"
              className="btn"
              onClick={() => deleteTheBooking(booking._id)}
            >
              Ta bort
            </button>
          </>)
        : null
        }
          </div>
        ))
      ) : (
        <p>Inga bokningar för denna resurs.</p>
      )}

      <h3>Ny bokning</h3>

      <form className="booking-form" onSubmit={createABooking}>

        {user.role === 'admin' ? (
          <>
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
          </>)
        : null
        }

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