const StatCard = ({ title, value, helper }) => (
  <div className="stat-card">
    <p>{title}</p>
    <h3>{value}</h3>
    <span>{helper}</span>
  </div>
);

export default StatCard;
