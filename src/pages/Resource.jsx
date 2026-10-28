import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import BookingComments from "../components/BookingComments.jsx";

import { getResource, getAvailability } from "../api/resources.js";
import { getUsers } from "../api/users.js";
import {
  getBookingsByResource,
  createBooking,
  cancelBooking,
  editBooking
} from "../api/bookings.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Recource() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const resourceId = window.sessionStorage.getItem("resource_id");

  const [resource, setResource] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookedBy, setBookedBy] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("sv-SE")
  );
  const [vcpus, setVcpus] = useState(1);
  const [ramMb, setRamMb] = useState(1024);
  const [diskGb, setDiskGb] = useState(1);
  const [error, setError] = useState("");

  // Hämta bokningar för vald resurs.
  const loadBookings = useCallback(async () => {
    if (!token || !resourceId) return
    const b = await getBookingsByResource(token, resourceId)
    setBookings(b)
  }, [token, resourceId])

  
  const loadAvailability = useCallback(async () => {
    if (!resourceId) return
    const s = await getAvailability(resourceId, date)
    setSlots(s)
    setSelectedSlot(null)

  }, [resourceId, date])

  // Socket.io: uppdatera bokningarna i realtid.
  useEffect(() => {
    if (!token || !resourceId) return;

    const socketUrl =
      import.meta.env.VITE_API_URL || window.location.origin;

    const socket = io(socketUrl);

    const handleBookingChange = () => {
      loadBookings().catch((err) => {
        console.error("Socket.io bokningsuppdatering:", err);
        setError(err.message);
      });
    };

    socket.on("connect", () => {
      console.log("Socket.io ansluten:", socket.id);

      socket.emit("join", `resource:${resourceId}`);

      handleBookingChange();
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.io anslutningsfel:", err.message);
    });

    socket.on("booking:created", handleBookingChange);
    socket.on("booking:updated", handleBookingChange);
    socket.on("booking:canceled", handleBookingChange);
    socket.on("booking:deleted", handleBookingChange);

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("booking:created", handleBookingChange);
      socket.off("booking:updated", handleBookingChange);
      socket.off("booking:canceled", handleBookingChange);
      socket.off("booking:deleted", handleBookingChange);

      socket.disconnect();
    };
  }, [token, resourceId, loadBookings]);

  useEffect(() => {
    if (!resourceId) return;

    loadAvailability().catch((err) => {
      setError(err.message);
    });
  }, [resourceId, loadAvailability]);

  // Hämta resurs, användare och bokningar.
  useEffect(() => {
    if (!resourceId) {
      setError("Ingen resurs har valts.");
      setLoading(false);
      return;
    }

    let active = true;

    const initialize = async () => {
      setLoading(true);

      try {
        const resourceData = await getResource(resourceId);

        if (active) {
          setResource(resourceData);
        }

        await loadBookings().catch((err) => {
          setError(err.message);
        });

        if (user?.role === "admin") {
          const userData = await getUsers();

          if (active) {
            setUsers(userData);
            setBookedBy(userData[0]?._id || "");
          }
        } else if (active && user?._id) {
          setBookedBy(user._id);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, [
    resourceId,
    loadBookings,
    user?._id,
    user?.role
  ]);

  // Hitta användarens e-postadress.
  const getUserEmail = (userId) => {
    const id =
      typeof userId === "object"
        ? userId?._id
        : userId;

    const foundUser = users.find(
      (item) => item._id === id
    );

    if (foundUser) return foundUser.email;

    if (user?._id === id) {
      return user.email || id;
    }

    return id || "Okänd användare";
  };

  // Formatera bokningens datum och tid.
  const formattedTime = (startTimeValue, endTimeValue) => {
    const start = new Date(startTimeValue);
    const end = new Date(endTimeValue);

    return `${start.toLocaleString("sv-SE", {
      dateStyle: "short",
      timeStyle: "short"
    })} – ${end.toLocaleString("sv-SE", {
      dateStyle: "short",
      timeStyle: "short"
    })}`;
  };

  const timeInPast = (startTime) => {
    const start = new Date(startTime).getTime();
    const currentTime = Date.now();

    return start <= currentTime;
  }


  const createABooking = async (event) => {
    event.preventDefault();
    setError("");

    if (!bookedBy || !startTime || !endTime) {
      setError("Fyll i alla obligatoriska fält.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("Sluttiden måste vara efter starttiden.");
      return;
    }

    setSaving(true);

    try {
      let want = {};

      if (resource.provider === "proxmox") {
        want = {
          vcpus: Number(vcpus),
          ramMb: Number(ramMb),
          diskGb: Number(diskGb)
        };
      } else if (resource.provider === "openstack") {
        want = {
          vcpus: Number(vcpus),
          ramMb: Number(ramMb)
        };
      }

      const data = {
        resource_id: resourceId,
        booked_by: bookedBy,
        start_time: startTime,
        end_time: endTime,
        want: want
      };

      await createBooking(token, data);

      setStartTime("");
      setEndTime("");
      setVcpus(1);
      setRamMb(1024);
      setDiskGb(1);

      await loadBookings();
      await loadAvailability();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Avboka bokning.
  const cancelTheBooking = async (bookingId) => {
    setError("");
    setSaving(true);

    try {
      await cancelBooking(token, bookingId);
      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Förläng bokningen med en timme.
  const editTheBooking = async (booking) => {
    setError("");
    setSaving(true);

    try {
      const newEndTime = new Date(booking.end_time);

      if (Number.isNaN(newEndTime.getTime())) {
        throw new Error("Bokningens sluttid är ogiltig.");
      }

      newEndTime.setHours(newEndTime.getHours() + 1);

      await editBooking(token, booking._id, {
        resource_id: resourceId,
        end_time: newEndTime.toISOString()
      });

      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const backToResources = () => {
    navigate("/");
  };

  if (loading) {
    return <p>Laddar...</p>;
  }

  return (
    <main className="main" id="main">
      <button
        type="button"
        className="btn"
        onClick={backToResources}
      >
        ← Tillbaka till resurser
      </button>

      <div className="booking_card">
        <h2>{resource.name}</h2>

        <div className="resource-meta">
          <p>Provider: {resource.provider}</p>
          <p>Status: {resource.active ? ("Aktiv") : ("Oaktiv")}</p>
          <p>Kapacitet:</p>
          <p>vcpus: {Math.round(resource.capacity?.vcpus)}</p>
          <p>ramMb: {Math.round(resource.capacity?.ramMb)}</p>
          {resource.provider === "proxmox" && (
            <p>diskGb: {Math.round(resource.capacity?.diskGb)}</p>
          )}
        </div>
      </div>

      {error && (
        <p role="alert">{error}</p>
      )}

      <div className="booking_card">

      <h3>Bokningar</h3>

      {bookings.length > 0 ? (
        bookings.map((booking) => {
          const ownerId =
            typeof booking.booked_by === "object"
              ? booking.booked_by?._id
              : booking.booked_by;

          const canManage =
            user?.role === "admin" ||
            String(ownerId) === String(user?._id);

          const isActive =
            booking.status !== "canceled" &&
            booking.status !== "cancelled";

          return (
            <div
              key={booking._id}
              className="booking-card"
            >
              <p>
                Bokad av: {getUserEmail(booking.booked_by)}
              </p>

              <p>
                {formattedTime(
                  booking.start_time,
                  booking.end_time
                )}
              </p>

              <p className="status">
                {booking.status}
              </p>

              {canManage && isActive && (
                <>
                  <button
                    type="button"
                    className="btn"
                    disabled={saving}
                    onClick={() =>
                      cancelTheBooking(booking._id)
                    }
                  >
                    Avboka
                  </button>

                  <button
                    type="button"
                    className="btn"
                    disabled={saving}
                    onClick={() =>
                      editTheBooking(booking)
                    }
                  >
                    Förläng din bokning med 1 timme
                  </button>
                </>
              )}

              {/* Krav 3: Kommentarer för bokningen */}
              <BookingComments
                bookingId={booking._id}
                resourceId={resourceId}
              />
            </div>
          );
        })
      ) : (
        <p>Inga bokningar för denna resurs.</p>
      )}
      </div>


      <div className="booking_card">

      <h3>Ny bokning</h3>

      <form
        className="booking-form"
        onSubmit={createABooking}
      >
        {user?.role === "admin" && (
          <>
            <div className="new_booking_card">           
            <label htmlFor="booked_by" className="main_label">
              Användare
            </label>

            <select
              id="booked_by"
              value={bookedBy}
              onChange={(event) =>
                setBookedBy(event.target.value)
              }
              required
            >
              {users.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.email}
                </option>
              ))}
            </select>
             </div>
          </>
        )}

        <div className="new_booking_card">
          <label htmlFor="date" className="main_label">
            Dag
          </label>

          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
          />
        </div>

        <div className="timeslots">
          <label className="main_label">Tillgängliga tider</label>
          <div className="slot-grid">
          {slots.map(slot => {
            if (timeInPast(slot.startsAt)){
              return(null)
            } else {
              const hour = new Date(slot.startsAt).getHours()

              const isSelected = selectedSlot?.startsAt === slot.startsAt
              return (
                <div
                key={slot.startsAt} className={`slot ${!slot.available ? 'booked' : isSelected ? 'selected' : 'available'}`}
                onClick={() => {
                if (!slot.available) return;

                if (isSelected) {
                  setSelectedSlot(null);
                  setStartTime("");
                  setEndTime("");
                } else {
                  setSelectedSlot(slot);
                  setStartTime(slot.startsAt);
                  setEndTime(slot.endsAt);
                }
              }}
                >
                  {hour}:00 – {hour + 1}:00
                </div>
              )
            }
            
          })}
          </div>
        </div>

        {(resource.provider === "openstack" ||
          resource.provider === "proxmox") && (
          <div>
            <div className="wants">
              <label className="main_label">Behov</label>

              <label htmlFor="vcpus">
                vCPUs
              </label>

              <input
                id="vcpus"
                type="number"
                value={vcpus}
                min="1"
                max="5"
                onChange={(event) =>
                  setVcpus(Number(event.target.value))
                }
                required
              />

              <label htmlFor="ramMb">
                RAM (MB)
              </label>

              <input
                id="ramMb"
                type="number"
                value={ramMb}
                min="1024"
                max="4096"
                step="1024"
                onChange={(event) =>
                  setRamMb(Number(event.target.value))
                }
                required
              />

              {resource.provider === "proxmox" && (
                <>
                  <label htmlFor="diskGb">
                    Disk (GB)
                  </label>

                  <input
                    id="diskGb"
                    type="number"
                    value={diskGb}
                    min="1"
                    max="5"
                    onChange={(event) =>
                      setDiskGb(Number(event.target.value))
                    }
                    required
                  />
                </>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn"
          disabled={saving}
        >
          {saving ? "Sparar..." : "Boka"}
        </button>
      </form>
      </div>
    </main>
  );
}