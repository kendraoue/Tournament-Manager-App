import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "flowbite-react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import Profile from "../components/Profile";
import axios from "axios";

const AppShell = ({ user, userTeam, setUserTeam }) => {
  const [activeLink, setActiveLink] = useState("Home");
  const navigate = useNavigate(); // Hook for navigating after logout

  const navLinks = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="#BCE345"
            d="M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19"
          />
        </svg>
      ),
      label: "Home",
      path: "/dashboard",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="#BCE345"
            d="M2 2v2h5v4H2v2h5c1.11 0 2-.89 2-2V7h5v10H9v-1c0-1.11-.89-2-2-2H2v2h5v4H2v2h5c1.11 0 2-.89 2-2v-1h5c1.11 0 2-.89 2-2v-4h6v-2h-6V7c0-1.11-.89-2-2-2H9V4c0-1.11-.89-2-2-2z"
          />
        </svg>
      ),
      label: "Tournaments",
      path: "/dashboard/tournament",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="#BCE345"
            fillRule="evenodd"
            d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1-8 0m0 6a5 5 0 0 0-5 5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3a5 5 0 0 0-5-5z"
            clipRule="evenodd"
          />
        </svg>
      ),
      label: "Profile",
      path: "/dashboard/profile",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="#BCE345"
            d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6q.425 0 .713.288T12 4t-.288.713T11 5H5v14h6q.425 0 .713.288T12 20t-.288.713T11 21zm12.175-8H10q-.425 0-.712-.288T9 12t.288-.712T10 11h7.175L15.3 9.125q-.275-.275-.275-.675t.275-.7t.7-.313t.725.288L20.3 11.3q.3.3.3.7t-.3.7l-3.575 3.575q-.3.3-.712.288t-.713-.313q-.275-.3-.262-.712t.287-.688z"
          />
        </svg>
      ),
      label: "Logout",
      specialAction: "logout",
    },
  ];

  // Handle Logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("discord_token");

      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      localStorage.removeItem("discord_token");
      navigate("/login");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <div className="flex h-screen text-[#BCE345] bg-[#6C45E3]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-full bg-[#6C45E3]">
        <div className="flex flex-col flex-1 overflow-y-auto p-8 gap-2">
          <h2 className="text-[25px] font-semibold mb-8">{activeLink}</h2>
          <nav className="flex-1 flex flex-col items-start gap-2" aria-label="Sidebar Navigation">
            {navLinks.slice(0, -1).map(({ icon, label, path }) => (
              <button key={label} onClick={() => setActiveLink(label)}>
                <Link to={path} className="inline-flex gap-2 hover:font-semibold">
                  {icon}
                  {label}
                </Link>
              </button>
            ))}
          </nav>
          {/* Logout Button always at the bottom */}
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="inline-flex gap-2 hover:font-semibold"
            >
              {navLinks.at(-1).icon}
              {navLinks.at(-1).label}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full">
        {/* Top Navbar - visible on small screens */}
        <header>
          <Navbar
            fluid
            className="min-h-[50px] px-4 fixed w-full z-50 lg:hidden"
            style={{ backgroundColor: "#6C45E3" }}
          >
            <div className="flex justify-between w-full items-center text-white">
              <span className="font-bold text-lg">Naraka Tournament</span>
              <nav className="flex gap-4" aria-label="Mobile Navigation">
                {navLinks.map(({ icon, label, path }) => (
                  <Link
                    key={label}
                    to={path}
                    onClick={() => setActiveLink(label)}
                    className="hover:font-semibold inline-flex"
                  >
                    {icon}
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </Navbar>
        </header>

        {/* Routed Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#987DE8] mt-12 lg:mt-0 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
