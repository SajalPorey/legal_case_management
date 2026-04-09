import { useEffect, useState } from "react";
import api from "../api/client";
import TimelineList from "../components/TimelineList";

const TimelinePage = () => {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [activity, setActivity] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState("");

  const fetchCases = async () => {
    try {
      const { data } = await api.get("/cases");
      setCases(data);
      if (!selectedCaseId && data.length) {
        setSelectedCaseId(data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load cases");
    }
  };

  const fetchTimeline = async (caseId) => {
    if (!caseId) {
      setTimeline([]);
      return;
    }

    try {
      const { data } = await api.get(`/timelines/${caseId}`);
      setTimeline(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load timeline");
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    fetchTimeline(selectedCaseId);
  }, [selectedCaseId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedCaseId || !activity.trim()) {
      setError("Select a case and provide activity details");
      return;
    }

    try {
      await api.post("/timelines", {
        caseId: selectedCaseId,
        activity,
      });
      setActivity("");
      fetchTimeline(selectedCaseId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add timeline activity");
    }
  };

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Matter history</p>
          <h2>Timeline View</h2>
        </div>
      </section>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="two-column-grid">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h3>Add timeline note</h3>
          </div>
          <label>
            Case
            <select value={selectedCaseId} onChange={(event) => setSelectedCaseId(event.target.value)}>
              <option value="">Select case</option>
              {cases.map((legalCase) => (
                <option key={legalCase._id} value={legalCase._id}>
                  {legalCase.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Activity
            <textarea
              rows="5"
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
              placeholder="Recorded witness statement and uploaded exhibits."
            />
          </label>
          <button className="button" type="submit">
            Add entry
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <h3>Case activity</h3>
          </div>
          <TimelineList items={timeline} />
        </div>
      </section>
    </div>
  );
};

export default TimelinePage;
