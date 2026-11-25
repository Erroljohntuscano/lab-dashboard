import { useCallback, useEffect, useState } from "react";

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("en-PH");

export default function App() {
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  const load = useCallback(async (simulate) => {
    setState({ status: "loading", data: null, error: null });
    try {
      const url = "/api/reports/summary" + (simulate ? `?simulate=${simulate}` : "");
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
      const data = await res.json();
      const status = data.kpis.totalRegistrations === 0 ? "empty" : "ready";
      setState({ status, data, error: null });
    } catch (err) {
      setState({ status: "error", data: null, error: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { status, data, error } = state;

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1>Event Registration Dashboard</h1>
          {data && (
            <p className="muted">
              Data range: <strong>{data.range.label}</strong> · Last updated:{" "}
              <time dateTime={data.updatedAt}>
                {new Date(data.updatedAt).toLocaleString("en-PH")}
              </time>
            </p>
          )}
        </div>
        <button className="btn" onClick={() => load()} disabled={status === "loading"}>
          {status === "loading" ? "Refreshing…" : "Refresh data"}
        </button>
      </header>

      {status === "loading" && <Loading />}

      {status === "error" && (
        <div className="notice notice-error" role="alert">
          <h2>Couldn’t load the report</h2>
          <p>{error}</p>
          <button className="btn" onClick={() => load()}>Try again</button>
        </div>
      )}

      {status === "empty" && (
        <div className="notice" role="status">
          <h2>No registrations yet</h2>
          <p>Once people register, their numbers will show up here.</p>
        </div>
      )}

      {status === "ready" && <Dashboard data={data} />}

      {import.meta.env.DEV && (
        <footer className="devtools">
          <span>Test states:</span>
          <button onClick={() => load("slow")}>Loading</button>
          <button onClick={() => load("empty")}>Empty</button>
          <button onClick={() => load("error")}>Error</button>
          <button onClick={() => load()}>Ready</button>
        </footer>
      )}
    </main>
  );
}

function Dashboard({ data }) {
  const { kpis, registrationsByDay } = data;
  return (
    <>
      <section aria-label="Key performance indicators" className="kpi-grid">
        <KpiCard label="Total registrations" value={num.format(kpis.totalRegistrations)} note="All sign-ups this week" />
        <KpiCard
          label="Checked in"
          value={num.format(kpis.checkedIn)}
          note={`Check-in rate: ${kpis.checkInRate}%`}
        />
        <KpiCard
          label="Payment status"
          value={`${num.format(kpis.paid)} paid`}
          note={`${num.format(kpis.pending)} pending · ${num.format(kpis.waived)} waived`}
        />
        <KpiCard
          label="Revenue"
          value={peso.format(kpis.revenue)}
          note={`${peso.format(kpis.feePerPaid)} × ${num.format(kpis.paid)} paid registrations`}
        />
      </section>

      <section className="card" aria-labelledby="chart-title">
        <h2 id="chart-title">Registrations by day</h2>
        <p className="decision">
          <strong>Decision it supports:</strong> which days need the most registration-desk
          staff, and when to send reminder messages.
        </p>
        <BarChart rows={registrationsByDay} />
      </section>
    </>
  );
}

function KpiCard({ label, value, note }) {
  return (
    <article className="card kpi">
      <h2 className="kpi-label">{label}</h2>
      <p className="kpi-value">{value}</p>
      <p className="muted">{note}</p>
    </article>
  );
}

function BarChart({ rows }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const summary = rows.map((r) => `${r.day}: ${r.count}`).join(", ");

  return (
    <>
      <div className="chart" role="img" aria-label={`Bar chart of registrations by day. ${summary}`}>
        {rows.map((r) => (
          <div className="bar-col" key={r.day}>
            <span className="bar-value">{r.count}</span>
            <div className="bar" style={{ height: `${(r.count / max) * 100}%` }} />
            <span className="bar-label">{r.day}</span>
          </div>
        ))}
      </div>
      <p className="sum">
        {rows.map((r) => r.count).join(" + ")} = <strong>{num.format(total)}</strong>
      </p>
      <details>
        <summary>View chart data as a table</summary>
        <table>
          <thead><tr><th>Day</th><th>Registrations</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.day}><td>{r.day}</td><td>{r.count}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}

function Loading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <p className="muted">Loading report…</p>
      <div className="kpi-grid">
        {[1, 2, 3, 4].map((n) => (
          <div className="card skeleton" key={n} />
        ))}
      </div>
    </div>
  );
}