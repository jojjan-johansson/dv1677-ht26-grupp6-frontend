import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getResources } from "../api";

export default function Homepage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  window.sessionStorage.clear();

  const navigate = useNavigate();

  const addNewResource = () => {
    // navigate(`/resources/new`, { replace: true });
  }

  const resourceHandle = (id) => {
    window.sessionStorage.setItem("resource_id", id);
    navigate(`/resource/`, { replace: true });
  }

  useEffect(() => {
    getResources()
          .then(setResources)
          .catch(setError)
          .finally(() => setLoading(false))
  }, [])

  return (
    <main className="main" id="main">
      <h2>Resurser</h2>

      <button onClick={addNewResource} className="btn">
        Lägg till resurs
      </button>

      {error && <p>{error}</p>}

      {resources.map((resource) => (
        <div key={resource._id} className="resource-card">
          <h3>{resource.name}</h3>

          <div className="resource-meta">
            <p>Typ: {resource.type}</p>
            <p>{resource.description}</p>
            <p>Kapacitet: {resource.capacity}</p>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => resourceHandle(resource._id)}
          >
            Visa / boka
          </button>
        </div>
      ))}
    </main>
  )
}