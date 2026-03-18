import { buildTransitionGraph, getKeyColor, getLatencyClass } from '../utils/transitionGraph';

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

/**
 * Results — Post-session screen with stats and transition graph analysis.
 */
export default function Results({ sessionData, exercise, onRestart, onNext }) {
  const { wpm, accuracy, duration, keystrokes } = sessionData;
  const graph = buildTransitionGraph(keystrokes);
  const { analytics, nodeErrors } = graph;

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Session Complete</h2>
      </div>

      {/* Main stats */}
      <div className="results-stats">
        <div className="results-stat-card">
          <div className="stat-value">{wpm}</div>
          <div className="stat-label">WPM</div>
        </div>
        <div className="results-stat-card">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
        <div className="results-stat-card">
          <div className="stat-value">{duration}s</div>
          <div className="stat-label">Duration</div>
        </div>
      </div>

      {/* Slowest transitions */}
      {analytics.slowestTransitions?.length > 0 && (
        <div className="results-section">
          <h3>Slowest Transitions</h3>
          <div className="transition-list">
            {analytics.slowestTransitions.slice(0, 8).map((edge) => {
              const maxLatency = analytics.slowestTransitions[0].avgLatency;
              const widthPercent = Math.round((edge.avgLatency / maxLatency) * 100);
              const latencyClass = getLatencyClass(edge.avgLatency);
              return (
                <div key={`${edge.from}→${edge.to}`} className="transition-item">
                  <span className="transition-pair">
                    {edge.from === ' ' ? '␣' : edge.from} → {edge.to === ' ' ? '␣' : edge.to}
                  </span>
                  <div className="transition-bar">
                    <div
                      className="transition-bar-fill"
                      style={{
                        width: `${widthPercent}%`,
                        background: latencyClass === 'slow' ? '#f38ba8' :
                                   latencyClass === 'medium' ? '#fab387' : '#a6e3a1',
                      }}
                    />
                  </div>
                  <span className={`transition-latency ${latencyClass}`}>
                    {edge.avgLatency}ms
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error-prone transitions */}
      {analytics.mostErrors?.length > 0 && (
        <div className="results-section">
          <h3>Most Errors</h3>
          <div className="transition-list">
            {analytics.mostErrors.slice(0, 6).map((edge) => (
              <div key={`err-${edge.from}→${edge.to}`} className="transition-item">
                <span className="transition-pair">
                  {edge.from === ' ' ? '␣' : edge.from} → {edge.to === ' ' ? '␣' : edge.to}
                </span>
                <span className="transition-latency slow">
                  {edge.errors}/{edge.count} errors ({edge.errorRate}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard heatmap */}
      <div className="results-section">
        <h3>Keyboard Heatmap</h3>
        <div className="keyboard-heatmap">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="keyboard-row">
              {row.map((key) => {
                const nodeData = nodeErrors[key];
                const errorRate = nodeData?.errorRate || 0;
                const bgColor = nodeData ? getKeyColor(errorRate) : undefined;
                return (
                  <div
                    key={key}
                    className="keyboard-key"
                    style={bgColor ? { backgroundColor: bgColor, borderColor: bgColor } : {}}
                    title={nodeData ? `${key}: ${nodeData.errors}/${nodeData.total} errors (${errorRate}%)` : key}
                  >
                    {key}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="keyboard-row">
            <div
              className="keyboard-key space"
              style={{
                backgroundColor: nodeErrors[' '] ? getKeyColor(nodeErrors[' '].errorRate) : undefined,
              }}
            >
              space
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button className="btn-primary" onClick={onRestart}>
          Try Again
        </button>
        <button className="btn-secondary" onClick={onNext}>
          Next Exercise
        </button>
      </div>
    </div>
  );
}
