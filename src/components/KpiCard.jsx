import { useState, useEffect } from 'react';

export default function KpiCard({ label, value, suffix = '', icon }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const end = parseInt(value, 10);
    
    // If it's not a number (e.g., a team name like "Arsenal"), set it directly
    if (isNaN(end)) {
      const timeout = setTimeout(() => setDisplayValue(value), 0);
      return () => clearTimeout(timeout);
    }

    if (end === 0) {
      const timeout = setTimeout(() => setDisplayValue(0), 0);
      return () => clearTimeout(timeout);
    }

    const duration = 1500; // 1.5 seconds
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      // Easing out quadratic
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress);
      const current = Math.round(easeProgress * end);

      setDisplayValue(current);

      if (frame >= totalFrames) {
        clearInterval(counter);
        setDisplayValue(end);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [value]);

  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <span className="kpi-label">{label}</span>
        {icon && <div className="kpi-icon-container">{icon}</div>}
      </div>
      <div className="kpi-body">
        <span className="kpi-value">
          {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
          {suffix && <span className="kpi-suffix">{suffix}</span>}
        </span>
      </div>
      <div className="kpi-glow"></div>
    </div>
  );
}
