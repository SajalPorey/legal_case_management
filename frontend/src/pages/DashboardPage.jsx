import { useEffect, useState } from "react";
import api from "../api/client";
import StatCard from "../components/StatCard";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get("/dashboard/summary");
        setSummary(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard");
      }
    };

    fetchSummary();
  }, []);

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!summary) {
    return <div className="page-shell centered">Loading dashboard...</div>;
  }

  const counts = summary.counts;

  return (
    <div className="page-shell">
      <section className="page-header">
        <div>
          <p className="eyebrow">Operational overview</p>
          <h2>Dashboard</h2>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard title="Total cases" value={counts.totalCases} helper="All active and archived matters" />
        <StatCard title="Open matters" value={counts.Open + counts["In Progress"]} helper="Requires ongoing work" />
        <StatCard title="Upcoming hearings" value={counts.upcomingHearings} helper="Within the next 7 days" />
        <StatCard title="Stored documents" value={counts.totalDocuments} helper="Evidence and filings on record" />
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Recent case activity</h3>
          </div>
          <div className="list-stack">
            {summary.recentCases.map((legalCase) => (
              <div key={legalCase._id} className="list-item">
                <div>
                  <strong>{legalCase.title}</strong>
                  <p>{legalCase.clientId?.name || "Unknown client"}</p>
                </div>
                <span className={`pill status-${legalCase.status.replace(/\s+/g, "-").toLowerCase()}`}>
                  {legalCase.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Next hearings</h3>
          </div>
          <div className="list-stack">
            {summary.upcomingHearings.length ? (
              summary.upcomingHearings.map((hearing) => (
                <div key={hearing._id} className="list-item">
                  <div>
                    <strong>{hearing.caseId?.title}</strong>
                    <p>{hearing.caseId?.clientId?.name || "Client unavailable"}</p>
                  </div>
                  <span>{new Date(hearing.hearingDate).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No hearings scheduled within the next week.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
