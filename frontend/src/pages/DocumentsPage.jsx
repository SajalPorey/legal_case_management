import { useEffect, useState } from "react";
import api from "../api/client";

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const serverBaseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  const fetchCases = async () => {
    try {
      const { data } = await api.get("/cases");
      setCases(data);
      if (!caseId && data.length) {
        setCaseId(data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load cases");
    }
  };

  const fetchDocuments = async (selectedCaseId) => {
    try {
      const { data } = await api.get("/documents", {
        params: selectedCaseId ? { caseId: selectedCaseId } : {},
      });
      setDocuments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load documents");
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    fetchDocuments(caseId);
  }, [caseId]);

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");

    if (!caseId || !file) {
      setError("Select a case and choose a document");
      return;
    }

    const formData = new FormData();
    formData.append("caseId", caseId);
    formData.append("file", file);

    try {
      await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      event.target.reset();
      fetchDocuments(caseId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload document");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments(caseId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete document");
    }
  };

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Evidence repository</p>
          <h2>Document Upload</h2>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="two-column-grid">
        <form className="panel form-grid" onSubmit={handleUpload}>
          <div className="panel-header">
            <h3>Upload document</h3>
          </div>
          <label>
            Case
            <select value={caseId} onChange={(event) => setCaseId(event.target.value)} required>
              <option value="">Select case</option>
              {cases.map((legalCase) => (
                <option key={legalCase._id} value={legalCase._id}>
                  {legalCase.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            File
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              required
            />
          </label>
          <button className="button" type="submit">
            Upload document
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <h3>Stored documents</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Case</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length ? (
                  documents.map((document) => (
                    <tr key={document._id}>
                      <td>{document.fileName}</td>
                      <td>{document.caseId?.title || "Unknown case"}</td>
                      <td className="action-cell">
                        <a
                          className="text-button"
                          href={`${serverBaseUrl}${document.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                        <button className="text-button danger" onClick={() => handleDelete(document._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">
                      <div className="empty-state">No documents found for this case.</div>
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

export default DocumentsPage;
