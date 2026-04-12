import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Lawyer",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <p className="eyebrow">Team onboarding</p>
        <h1>Spin up a secure legal workspace for admin and lawyer roles.</h1>
        <p>
          JWT authentication, hashed passwords, protected APIs, and an interface built for
          day-to-day case administration.
        </p>
      </section>
      <section className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Create account</p>
            <h2>Register</h2>
          </div>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <label>
            Full name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ava Counsel"
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="lawyer@firm.com"
            />
          </label>
          <label>
            Password
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                style={{ width: "100%", paddingRight: "60px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="Lawyer">Lawyer</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
          <button className="button" disabled={submitting}>
            {submitting ? "Creating..." : "Register"}
          </button>
          <p className="muted-text">
            Already have access? <Link to="/login">Go to login</Link>
          </p>
        </form>
      </section>
    </div>
  );
};

export default RegisterPage;
