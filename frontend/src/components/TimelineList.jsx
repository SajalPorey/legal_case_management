const TimelineList = ({ items }) => {
  if (!items.length) {
    return <div className="empty-state">No timeline activity yet.</div>;
  }

  return (
    <div className="timeline-list">
      {items.map((item) => (
        <div key={item._id} className="timeline-item">
          <div className="timeline-dot" />
          <div>
            <strong>{item.activity}</strong>
            <p>
              {new Date(item.timestamp).toLocaleString()}
              {item.createdBy?.name ? ` by ${item.createdBy.name}` : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineList;
