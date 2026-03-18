import { useState, useEffect } from 'react';
import { getSessions } from '../utils/api';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessions(50)
      .then((res) => setSessions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading sessions...
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>Session History</h2>

      {sessions.length === 0 ? (
        <div className="history-empty">
          <p>No sessions yet. Complete a typing exercise to see your history!</p>
        </div>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>WPM</th>
              <th>Accuracy</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{new Date(session.created_at).toLocaleDateString()}</td>
                <td>{Math.round(session.wpm)}</td>
                <td>{Math.round(session.accuracy)}%</td>
                <td>{Math.round(session.duration)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
