import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * TypingTest — Monkeytype-style typing interface.
 *
 * Captures keystrokes with timestamps for transition graph computation.
 * Shows live WPM and accuracy.
 */
export default function TypingTest({ exercise, onComplete }) {
  const text = exercise.text;
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [keystrokes, setKeystrokes] = useState([]);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [currentAccuracy, setCurrentAccuracy] = useState(100);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef(null);
  const keystrokeRef = useRef([]);

  // Focus input on mount and on click
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Timer — ticks every second independently
  useEffect(() => {
    if (!startTime || isFinished) return;
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTime) / 1000));
    }, 200);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  // Live stats update
  useEffect(() => {
    if (!startTime || input.length === 0) return;
    const elapsedMin = (Date.now() - startTime) / 1000 / 60; // minutes
    if (elapsedMin > 0) {
      const wordsTyped = input.length / 5; // standard: 5 chars = 1 word
      setCurrentWpm(Math.round(wordsTyped / elapsedMin) || 0);
    }

    const correct = input.split('').filter((c, i) => c === text[i]).length;
    if (input.length >= 3) {
      setCurrentAccuracy(Math.round((correct / input.length) * 100));
    }
  }, [input, startTime, text]);

  const handleKeyDown = (e) => {
    if (isFinished) return;

    // Prevent tab from leaving
    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }
  };

  const handleInput = (e) => {
    if (isFinished) return;

    const value = e.target.value;

    // Start timer on first keystroke
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Record keystroke
    if (value.length > input.length) {
      const charIndex = value.length - 1;
      const typedChar = value[charIndex];
      const expectedChar = text[charIndex];
      const keystroke = {
        char: typedChar,
        expected: expectedChar,
        timestamp: Date.now(),
        correct: typedChar === expectedChar,
        index: charIndex,
      };
      keystrokeRef.current = [...keystrokeRef.current, keystroke];
      setKeystrokes([...keystrokeRef.current]);
    }

    // Don't allow typing past the text length
    if (value.length > text.length) return;

    setInput(value);

    // Check if finished
    if (value.length === text.length) {
      setIsFinished(true);
      const duration = (Date.now() - startTime) / 1000;
      const wordsTyped = text.length / 5;
      const minutes = duration / 60;
      const wpm = Math.round(wordsTyped / minutes);
      const correct = value.split('').filter((c, i) => c === text[i]).length;
      const accuracy = Math.round((correct / text.length) * 100);

      onComplete({
        wpm,
        accuracy,
        duration: Math.round(duration * 10) / 10,
        keystrokes: keystrokeRef.current,
      });
    }
  };

  const handleRestart = () => {
    setInput('');
    setStartTime(null);
    setIsFinished(false);
    setKeystrokes([]);
    setCurrentWpm(0);
    setCurrentAccuracy(100);
    setElapsed(0);
    keystrokeRef.current = [];
    focusInput();
  };

  const renderText = () => {
    return text.split('').map((char, i) => {
      let className = 'char ';
      if (i < input.length) {
        className += input[i] === char ? 'correct' : 'incorrect';
      } else if (i === input.length) {
        className += 'current';
      } else {
        className += 'pending';
      }
      return (
        <span key={i} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="typing-container">
      <div className="typing-stats">
        <div className="stat-item">
          <div className="stat-value">{currentWpm}</div>
          <div className="stat-label">WPM</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{currentAccuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{elapsed}s</div>
          <div className="stat-label">Time</div>
        </div>
      </div>

      <div className="typing-text-area" onClick={focusInput}>
        {renderText()}
        <input
          ref={inputRef}
          className="typing-hidden-input"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      {!startTime && (
        <p className="typing-prompt">Click the text above and start typing...</p>
      )}

      {startTime && !isFinished && (
        <button className="typing-restart" onClick={handleRestart}>
          ↺ Restart
        </button>
      )}
    </div>
  );
}
