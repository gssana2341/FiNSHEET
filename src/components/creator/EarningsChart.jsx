import './EarningsChart.css';

export default function EarningsChart({ data = [] }) {
  if (!data.length) return null;

  const maxAmount = Math.max(...data.map((d) => d.amount));

  return (
    <div className="earnings-chart" id="earnings-chart">
      <h3 className="earnings-chart-title">Weekly Sales</h3>
      <div className="earnings-chart-bars">
        {data.map((item, i) => {
          const heightPct = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
          return (
            <div key={i} className="earnings-bar-col">
              <div className="earnings-bar-wrapper">
                <div
                  className="earnings-bar"
                  style={{ height: `${heightPct}%` }}
                  title={`฿${(item.amount / 100).toFixed(0)}`}
                >
                  <span className="earnings-bar-value">฿{(item.amount / 100).toFixed(0)}</span>
                </div>
              </div>
              <span className="earnings-bar-label">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
