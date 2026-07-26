import React, { useState, useEffect, useMemo } from 'react';
import './NeuralTraceWidget.css';

const MESSAGES = [
  "Searching Criminal Database...",
  "Cross-referencing Known Associates...",
  "Analyzing Financial Transactions...",
  "Tracking Telecom Metadata...",
  "Correlating Open Source Intel...",
  "Target Lock Acquired",
  "Generating Intelligence Report..."
];

export const NeuralTraceWidget: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(timeInterval);
    };
  }, []);

  // Generate tactical blips for the radar
  const blips = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 85;
      return {
        id: i,
        left: `calc(50% + ${Math.cos(angle) * radius}px)`,
        top: `calc(50% + ${Math.sin(angle) * radius}px)`,
        animationDelay: `${(Math.random() * 3).toFixed(2)}s`,
      };
    });
  }, []);

  return (
    <div className="sherlock-scanner-panel">
      <div className="header">INTELLIGENCE SCANNER</div>
      
      <div className="scanner">
        <div className="sweep"></div>
        <div className="ring"></div>
        <div className="ring r2"></div>
        <div className="ring r3"></div>
        <div className="cross"></div>
        <div className="dot"></div>
        
        {/* Radar Blips */}
        {blips.map((b) => (
          <div
            key={b.id}
            className="blip"
            style={{
              left: b.left,
              top: b.top,
              animationDelay: b.animationDelay,
            }}
          />
        ))}
      </div>

      <div className="log">
        <div className="status">{MESSAGES[msgIndex]}</div>
        <div className="bar">
          <div className="fill"></div>
        </div>
      </div>

      <div className="footer">
        <span>Target Threat: <b style={{ color: '#ef4444' }}>ELEVATED</b></span>
        <span>{currentTime}</span>
      </div>
    </div>
  );
};

export default NeuralTraceWidget;
