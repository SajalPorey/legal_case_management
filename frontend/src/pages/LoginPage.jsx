import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <p className="eyebrow">Secure counsel workflow</p>
        <h1>Keep cases, hearings, and evidence in one operating system.</h1>
        <p>
          Track client matters, upload case documents, schedule hearings, and maintain an
          auditable timeline from intake to closure.
        </p>
      </section>
      <section className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>Login</h2>
          </div>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="lawyer@legalcms.com"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Enter your password"
            />
          </label>
          <button className="button" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
          <p className="muted-text">
            Need an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </section>
    </div>
  );
};

export default LoginPage;
