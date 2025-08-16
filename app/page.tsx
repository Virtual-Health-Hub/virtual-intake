"use client";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome back, User!</h1>
        <div className="header-buttons">
          <Link href={"/interview"} className="btn primary">
            Start Interview
          </Link>
          <Link href={"/forms"} className="btn secondary">
            Open Forms
          </Link>
        </div>
      </header>

      <section className="kpi-cards">
        <div className="card">
          <h2>Interviews Today</h2>
          <p>5</p>
        </div>
        <div className="card">
          <h2>Forms Completed</h2>
          <p>12</p>
        </div>
        <div className="card">
          <h2>Pending Reviews</h2>
          <p>3</p>
        </div>
      </section>

      <section className="two-column">
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <ul>
            <li>Interview with John Doe completed</li>
            <li>Form #123 submitted</li>
            <li>Review pending for Jane Smith</li>
          </ul>
        </div>
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <Link href="/interview" className="btn">
            New Interview
          </Link>
          <Link href="/forms" className="btn">
            Review Forms
          </Link>
          <Link href="/settings" className="btn">
            Settings
          </Link>
        </div>
      </section>

      <style jsx>{`
        .dashboard {
          width: 100%;
          padding: 2rem;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          color: #475569;
          background-color: #f9fafb;
          box-sizing: border-box;
        }
        .dashboard-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: #fff;

          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .dashboard-header h1 {
          font-size: 2rem;
          margin: 0;
          font-weight: 700;
          color: #1e293b;
        }
        .header-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
        }
        .header-buttons :global(.btn) {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }
        .kpi-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .card h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: #1e293b;
          font-weight: 600;
        }
        .card p {
          font-size: 2rem;
          margin: 0;
          font-weight: bold;
          color: #2563eb;
        }
        .two-column {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 768px) {
          .two-column {
            grid-template-columns: 1fr;
          }
        }
        .recent-activity,
        .quick-actions {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .recent-activity h3,
        .quick-actions h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          color: #1e293b;
          font-weight: 600;
        }
        .recent-activity ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .recent-activity li {
          padding: 0.5rem;
          color: #475569;
        }
        .recent-activity li:last-child {
          border-bottom: none;
        }
        .quick-actions :global(.btn) {
          display: block;
          width: 100%;
          margin-bottom: 1rem;
          padding: 0.75rem;
          font-size: 1rem;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-align: center;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }
        .quick-actions :global(.btn):hover {
          background-color: #1d4ed8;
        }
      `}</style>
      <style jsx global>{`
        .dashboard .btn {
          display: inline-block;
          text-decoration: none;
          line-height: 1.25;
        }
        .dashboard .btn:focus-visible {
          outline: 2px solid #1d4ed8;
          outline-offset: 2px;
        }
        .dashboard .btn.primary {
          background-color: #2563eb;
          color: white;
          border: none;
        }
        .dashboard .btn.primary:hover {
          background-color: #1d4ed8;
        }
        .dashboard .btn.secondary {
          background-color: #f1f5f9;
          color: #1e293b;
          border: none;
        }
        .dashboard .btn.secondary:hover {
          background-color: #e2e8f0;
        }
      `}</style>
    </main>
  );
}
