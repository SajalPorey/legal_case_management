import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const AdminRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      const { data } = await api.get("/admin-requests");
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const { data } = await api.patch(`/admin-requests/${id}/approve`);
      setMessage(data.message);
      setError("");
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to approve request");
    }
  };

  const handleReject = async (id) => {
    try {
      const { data } = await api.patch(`/admin-requests/${id}/reject`);
      setMessage(data.message);
      setError("");
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reject request");
    }
  };

  if (user?.role !== "Admin") {
    return (
      <div className="page-shell">
        <div className="alert alert-error">Access denied. Admins only.</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Role Management</p>
          <h2>Admin Access Requests</h2>
        </div>
      </section>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <section>
        <div className="panel">
          <div className="panel-header">
            <h3>Pending Requests ({requests.length})</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length ? (
                  requests.map((req) => (
                    <tr key={req._id}>
                      <td>
                        <strong>{req.userId?.name}</strong>
                      </td>
                      <td>{req.userId?.email}</td>
                      <td>
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="action-cell">
                        <button
                          className="button"
                          style={{ padding: "6px 14px", fontSize: "13px" }}
                          onClick={() => handleApprove(req._id)}
                        >
                          Accept
                        </button>
                        <button
                          className="text-button danger"
                          onClick={() => handleReject(req._id)}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="empty-state">No pending admin requests.</div>
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

export default AdminRequestsPage;
