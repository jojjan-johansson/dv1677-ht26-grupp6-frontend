import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import './css/App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

import Header from './pages/Header';
import Footer from './pages/Footer';

import Homepage from './pages/Homepage';
import Recource from './pages/Resource';
import Login from './pages/Login';
import RegisterPage from './pages/Register';

function Nav() {
  const navigate = useNavigate();

  const navigateLink = (link) => {
    navigate(link, { replace: true });
  }

  const { user, logout } = useAuth()
  return (
    <nav className='nav'>
      <button
        type="button"
        className="navChoice"
        onClick={() => navigateLink("/")}
      >Resurser</button>
      {user ? (
        <>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user.email}</span>
          <button className="secondary" style={{ padding: '0.3rem 0.7rem' }} onClick={logout}>Logga ut</button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="navChoice"
            onClick={() => navigateLink("/login")}
          >Logga in</button>
          <button
            type="button"
            className="navChoice"
            onClick={() => navigateLink("/register")}
          >Registrera</button>
        </>
      )}
    </nav>
  )
}

export default function App() {
  

  return (
    <BrowserRouter basename="/dv1677-ht26-grupp6-frontend">
      {/* <Layout> */}
        <Header />
          <AuthProvider>
            <Nav />
            {/* Routes */}
            <Routes>
              <Route
                path="/"
                element={
                  <Homepage />
                }
              />
              <Route
                path="/login"
                element={
                  <Login />
                }
              />
              <Route
                path="/register"
                element={
                  <RegisterPage />
                }
              />
              <Route
                path="/resource"
                element={
                  <Recource />
                }
              />
            </Routes>
          </AuthProvider>
        <Footer />
      {/* </Layout> */}
    </BrowserRouter>
  );
}
