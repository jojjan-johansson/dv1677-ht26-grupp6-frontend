import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {

  return (
   <header>
        <h1><a href="/">Proxmox Booking</a></h1>
    </header>
  );
}