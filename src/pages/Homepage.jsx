import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const [resources, setResources] = useState([])
  const [error, setError] = useState('')

  const navigate = useNavigate();
  
  const addNewResource = () => {
    // navigate(`/resources/new`, { replace: true });
  }

  const resource = (id) => {
    navigate(`/resource/`, { replace: true, state: { id: id } });
  }

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL

    fetch(`${apiUrl}/api/resources`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Kunde inte hämta resurser')
        }

        return response.json()
      })
      .then((data) => {
        setResources(data)
      })
      .catch((error) => {
        setError(error.message)
      })
  }, [])

  

  return (
    <main className="main" id="main">
      <h2>Resurser</h2>
      <button onClick={addNewResource} className="btn">Lägg till resurs</button>

      {resources.map((resource) => (
        <div key={resource._id} onClick={() => resource(resource._id) } className="resource-card">
          <h3>{resource.name}</h3>
          <div className="resource-meta">
            <p>Typ: {resource.type}</p>
            <p>{resource.description}</p>
            <p>Kapacitet: {resource.capacity}</p>
          </div>
        </div>
      ))}
    </main>
  )

}
