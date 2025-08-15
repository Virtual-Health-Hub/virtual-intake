"use client";

import { useState } from "react";
import Loader from "./loading";

export default function DashboardPage() {
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome back, User!</h1>
        <div className="header-buttons">
          <button className="btn primary">Start Interview</button>
          <button className="btn secondary">Open Forms</button>
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
          <button className="btn">New Interview</button>
          <button className="btn">Review Forms</button>
          <button className="btn">Settings</button>
        </div>
      </section>

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          color: #475569;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .dashboard-header h1 {
          font-size: 2rem;
          margin: 0;
          font-weight: 700;
          color: #1e293b;
        }
        .header-buttons .btn {
          margin-left: 1rem;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn.primary {
          background-color: #4338ca;
          color: white;
        }
        .btn.secondary {
          background-color: #f1f5f9;
          color: #1e293b;
        }
        .kpi-cards {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .card {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
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
          color: #4338ca;
        }
        .two-column {
          display: flex;
          gap: 2rem;
        }
        .recent-activity,
        .quick-actions {
          flex: 1;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
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
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
          color: #475569;
        }
        .recent-activity li:last-child {
          border-bottom: none;
        }
        .quick-actions .btn {
          display: block;
          width: 100%;
          margin-bottom: 1rem;
          padding: 0.75rem;
          font-size: 1rem;
          background-color: #4338ca;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          text-align: center;
        }
        .quick-actions .btn:last-child {
          margin-bottom: 0;
          background-color: #334155;
        }
        .quick-actions .btn:hover {
          background-color: #4f46e5;
          opacity: 0.9;
        }
      `}</style>
    </main>
  );
}
