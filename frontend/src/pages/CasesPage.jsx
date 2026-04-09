import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  clientId: "",
  title: "",
  type: "",
  description: "",
  status: "Open",
};

const statuses = ["Open", "In Progress", "Hearing Scheduled", "Closed"];

const CasesPage = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  const fetchCases = async () => {
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/cases", { params });
      setCases(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load cases");
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await api.get("/clients");
      setClients(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load clients");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchCases();
  }, [keyword, statusFilter]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      ...form,
      assignedLawyer: user?.id,
    };

    try {
      if (editingId) {
        await api.put(`/cases/${editingId}`, payload);
      } else {
        await api.post("/cases", payload);
      }

      setForm(emptyForm);
      setEditingId("");
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save case");
    }
  };

  const handleEdit = (legalCase) => {
    setEditingId(legalCase._id);
    setForm({
      clientId: legalCase.clientId?._id || legalCase.clientId || "",
      title: legalCase.title || "",
      type: legalCase.type || "",
      description: legalCase.description || "",
      status: legalCase.status || "Open",
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/cases/${id}`);
      if (editingId === id) {
        setEditingId("");
        setForm(emptyForm);
      }
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete case");
    }
  };

  return (
    <div className="page-shell">
      <section className="page-header split-header">
        <div>
          <p className="eyebrow">Matter operations</p>
          <h2>Case Management</h2>
        </div>
        <div className="filters-row">
          <input
            className="search-input"
            placeholder="Search case title or type"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="two-column-grid">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h3>{editingId ? "Update case" : "Create case"}</h3>
          </div>
          <label>
            Client
            <select name="clientId" value={form.clientId} onChange={handleChange} required>
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label>
            Case type
            <input name="type" value={form.type} onChange={handleChange} required />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Description
            <textarea
              name="description"
              rows="5"
              value={form.description}
              onChange={handleChange}
            />
          </label>
          <div className="button-row">
            <button className="button" type="submit">
              {editingId ? "Save changes" : "Create case"}
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
            <h3>Case list</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.length ? (
                  cases.map((legalCase) => (
                    <tr key={legalCase._id}>
                      <td>
                        <strong>{legalCase.title}</strong>
                        <div className="muted-cell">{legalCase.type}</div>
                      </td>
                      <td>{legalCase.clientId?.name || "Unknown client"}</td>
                      <td>
                        <span className={`pill status-${legalCase.status.replace(/\s+/g, "-").toLowerCase()}`}>
                          {legalCase.status}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button className="text-button" onClick={() => handleEdit(legalCase)}>
                          Edit
                        </button>
                        <button className="text-button danger" onClick={() => handleDelete(legalCase._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="empty-state">No cases found.</div>
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

export default CasesPage;
