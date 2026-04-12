import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

const ClientsPage = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  const fetchClients = async () => {
    try {
      const { data } = await api.get("/clients", { params: search ? { keyword: search } : {} });
      setClients(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load clients");
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, form);
      } else {
        await api.post("/clients", form);
      }

      setForm(emptyForm);
      setEditingId("");
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save client");
    }
  };

  const handleEdit = (client) => {
    setEditingId(client._id);
    setForm({
      name: client.name || "",
      email: client.contactInfo?.email || "",
      phone: client.contactInfo?.phone || "",
      address: client.address || "",
      notes: client.notes || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      if (editingId === id) {
        setEditingId("");
        setForm(emptyForm);
      }
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete client");
    }
  };

  const title = useMemo(() => (editingId ? "Edit client" : "Add client"), [editingId]);

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Client records</p>
          <h2>Client Management</h2>
        </div>
        <input
          className="search-input"
          placeholder="Search clients"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="two-column-grid">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h3>{title}</h3>
          </div>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} />
          </label>
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
          <label>
            Address
            <textarea name="address" rows="3" value={form.address} onChange={handleChange} />
          </label>
          <label>
            Notes
            <textarea name="notes" rows="4" value={form.notes} onChange={handleChange} />
          </label>
          <div className="button-row">
            <button className="button" type="submit">
              {editingId ? "Update client" : "Create client"}
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
            <h3>Client directory</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length ? (
                  clients.map((client) => (
                    <tr key={client._id}>
                      <td>
                        <strong>{client.name}</strong>
                        <div className="muted-cell">{client.address || "No address"}</div>
                      </td>
                      <td>
                        <div>{client.contactInfo?.email || "No email"}</div>
                        <div className="muted-cell">{client.contactInfo?.phone || "No phone"}</div>
                      </td>
                      <td className="action-cell">
                        <button className="text-button" onClick={() => handleEdit(client)}>
                          Edit
                        </button>
                        {user?.role === "Admin" && (
                          <button className="text-button danger" onClick={() => handleDelete(client._id)}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">
                      <div className="empty-state">No clients found.</div>
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

export default ClientsPage;
