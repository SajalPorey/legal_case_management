import { useEffect, useState } from "react";
import api from "../api/client";

const emptyForm = {
  caseId: "",
  hearingDate: "",
  location: "",
  notes: "",
};

const HearingsPage = () => {
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  const fetchCases = async () => {
    try {
      const { data } = await api.get("/cases");
      setCases(data);
      if (!editingId && !form.caseId && data.length) {
        setForm((current) => ({ ...current, caseId: data[0]._id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load cases");
    }
  };

  const fetchHearings = async () => {
    try {
      const { data } = await api.get("/hearings");
      setHearings(data);

      const upcoming = data.find((hearing) => {
        const diff = new Date(hearing.hearingDate).getTime() - Date.now();
        return diff > 0 && diff <= 24 * 60 * 60 * 1000;
      });

      if (upcoming && !sessionStorage.getItem(`hearing-alert-${upcoming._id}`)) {
        sessionStorage.setItem(`hearing-alert-${upcoming._id}`, "true");
        window.alert(
          `Reminder: ${upcoming.caseId?.title || "A case"} has a hearing on ${new Date(
            upcoming.hearingDate
          ).toLocaleString()}`
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load hearings");
    }
  };

  useEffect(() => {
    fetchCases();
    fetchHearings();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.put(`/hearings/${editingId}`, form);
      } else {
        await api.post("/hearings", form);
      }

      setEditingId("");
      setForm((current) => ({ ...emptyForm, caseId: current.caseId || "" }));
      fetchHearings();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save hearing");
    }
  };

  const handleEdit = (hearing) => {
    setEditingId(hearing._id);
    setForm({
      caseId: hearing.caseId?._id || "",
      hearingDate: new Date(hearing.hearingDate).toISOString().slice(0, 16),
      location: hearing.location || "",
      notes: hearing.notes || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/hearings/${id}`);
      if (editingId === id) {
        setEditingId("");
        setForm(emptyForm);
      }
      fetchHearings();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete hearing");
    }
  };

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Court calendar</p>
          <h2>Hearing Scheduler</h2>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="two-column-grid">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h3>{editingId ? "Update hearing" : "Schedule hearing"}</h3>
          </div>
          <label>
            Case
            <select name="caseId" value={form.caseId} onChange={handleChange} required>
              <option value="">Select case</option>
              {cases.map((legalCase) => (
                <option key={legalCase._id} value={legalCase._id}>
                  {legalCase.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Hearing date
            <input
              name="hearingDate"
              type="datetime-local"
              value={form.hearingDate}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Location
            <input name="location" value={form.location} onChange={handleChange} />
          </label>
          <label>
            Notes
            <textarea name="notes" rows="4" value={form.notes} onChange={handleChange} />
          </label>
          <div className="button-row">
            <button className="button" type="submit">
              {editingId ? "Save hearing" : "Schedule"}
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setEditingId("");
                setForm(emptyForm);
              }}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="panel">
          <div className="panel-header">
            <h3>Upcoming hearings</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hearings.length ? (
                  hearings.map((hearing) => (
                    <tr key={hearing._id}>
                      <td>
                        <strong>{hearing.caseId?.title}</strong>
                        <div className="muted-cell">{hearing.caseId?.clientId?.name || "No client"}</div>
                      </td>
                      <td>{new Date(hearing.hearingDate).toLocaleString()}</td>
                      <td>{hearing.location || "Not set"}</td>
                      <td className="action-cell">
                        <button className="text-button" onClick={() => handleEdit(hearing)}>
                          Edit
                        </button>
                        <button className="text-button danger" onClick={() => handleDelete(hearing._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="empty-state">No hearings scheduled.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HearingsPage;
