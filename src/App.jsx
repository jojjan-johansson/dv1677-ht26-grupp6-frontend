import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [resources, setResources] = useState([])
  const [error, setError] = useState('')

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
    <main>
      <h1>Proxmox Booking</h1>

      <h2>Tillgängliga resurser</h2>

      {error && <p>{error}</p>}

      {resources.map((resource) => (
        <div key={resource._id}>
          <h3>{resource.name}</h3>
          <p>Typ: {resource.type}</p>
          <p>{resource.description}</p>
          <p>Kapacitet: {resource.capacity}</p>
        </div>
      ))}
    </main>
  )
}

export default App