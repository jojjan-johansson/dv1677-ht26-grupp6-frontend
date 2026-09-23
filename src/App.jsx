import { useEffect, useState } from 'react'
import './css/App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from './pages/Header';
import Footer from './pages/Footer';

import Homepage from './pages/Homepage';
import Recource from './pages/Resource';

export default function App() {


  return (
    <BrowserRouter>
      {/* <Layout> */}
        <Header />
          {/* Routes */}
          <Routes>
            <Route
              path="/"
              element={
                <Homepage />
              }
            />
            <Route
              path="/resource"
              element={
                <Recource />
              }
            />
            {/* <Route
              path="/finished"
              element={
                <Finished />
              }
            /> */}
          </Routes>
        <Footer />
      {/* </Layout> */}
    </BrowserRouter>
  );
}

// function App() {
//   const [resources, setResources] = useState([])
//   const [error, setError] = useState('')

//   useEffect(() => {
//     const apiUrl = import.meta.env.VITE_API_URL

//     fetch(`${apiUrl}/api/resources`)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error('Kunde inte hämta resurser')
//         }

//         return response.json()
//       })
//       .then((data) => {
//         setResources(data)
//       })
//       .catch((error) => {
//         setError(error.message)
//       })
//   }, [])

//   return (
//     <main>
//       <h1>Proxmox Booking</h1>

//       <h2>Tillgängliga resurser</h2>

//       {error && <p>{error}</p>}

//       {resources.map((resource) => (
//         <div key={resource._id}>
//           <h3>{resource.name}</h3>
//           <p>Typ: {resource.type}</p>
//           <p>{resource.description}</p>
//           <p>Kapacitet: {resource.capacity}</p>
//         </div>
//       ))}
//     </main>
//   )
// }

// export default App