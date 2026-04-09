import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/clients", label: "Clients" },
  { to: "/cases", label: "Cases" },
  { to: "/documents", label: "Documents" },
  { to: "/hearings", label: "Hearings" },
  { to: "/timeline", label: "Timeline" },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Legal operations</p>
          <h1>Legal Case Management System</h1>
        </div>
        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.role}</p>
          </div>
          <button className="button button-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="content-shell">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
