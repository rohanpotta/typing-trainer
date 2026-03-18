import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getExercises, createSession } from './utils/api';
import TypingTest from './components/TypingTest';
import Results from './components/Results';
import Login from './components/Login';
import Register from './components/Register';
import History from './components/History';
import './index.css';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Main typing page — handles exercise selection, test flow, and results
function TypingPage() {
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [sessionResult, setSessionResult] = useState(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadExercises = useCallback(async (diff) => {
    setLoading(true);
    try {
      const res = await getExercises(diff);
      setExercises(res.data);
      if (res.data.length > 0) {
        setCurrentExercise(res.data[0]);
        setExerciseIndex(0);
      }
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExercises(difficulty);
  }, [difficulty, loadExercises]);

  const handleComplete = async (result) => {
    const { wpm, accuracy, duration, keystrokes } = result;

    // Save session to backend
    try {
      await createSession({
        exercise_id: currentExercise.id,
        wpm,
        accuracy,
        duration,
        keystroke_log: {
          keystrokes: keystrokes.map((k) => ({
            char: k.char,
            expected: k.expected,
            timestamp: k.timestamp,
            correct: k.correct,
            index: k.index,
          })),
        },
      });
    } catch (err) {
      console.error('Failed to save session:', err);
    }

    setSessionResult(result);
  };

  const handleRestart = () => {
    setSessionResult(null);
  };

  const handleNext = () => {
    const nextIndex = (exerciseIndex + 1) % exercises.length;
    setExerciseIndex(nextIndex);
    setCurrentExercise(exercises[nextIndex]);
    setSessionResult(null);
  };

  if (loading) {
    return <div className="loading"><div className="spinner" />Loading exercises...</div>;
  }

  if (!currentExercise) {
    return <div className="loading">No exercises available. Run the seed script.</div>;
  }

  // Show results if session completed
  if (sessionResult) {
    return (
      <Results
        sessionData={sessionResult}
        exercise={currentExercise}
        onRestart={handleRestart}
        onNext={handleNext}
      />
    );
  }

  return (
    <div>
      {/* Difficulty filter */}
      <div className="typing-config" style={{ marginBottom: '1rem' }}>
        {[null, 'easy', 'medium', 'hard'].map((diff) => (
          <button
            key={diff || 'all'}
            className={difficulty === diff ? 'active' : ''}
            onClick={() => setDifficulty(diff)}
          >
            {diff || 'all'}
          </button>
        ))}
      </div>

      {/* Use a key to force remount on exercise change */}
      <TypingTest
        key={currentExercise.id}
        exercise={currentExercise}
        onComplete={handleComplete}
      />
    </div>
  );
}

// Header with nav
function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="app-header">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>⌨ Adaptive Typing Trainer</h1>
      </Link>
      <nav>
        {user ? (
          <>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Practice
            </Link>
            <Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>
              History
            </Link>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {user.username}
            </span>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
              Login
            </Link>
            <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TypingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
