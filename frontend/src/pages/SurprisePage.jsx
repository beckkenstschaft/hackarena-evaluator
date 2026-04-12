import { useState, useEffect } from 'react';

export default function SurprisePage() {
  const [showContent, setShowContent] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      color: ['#6366f1', '#f472b6', '#a5b4fc', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
    }));
    setParticles(newParticles);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="surprise-container">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
      
      <div className="surprise-content">
        <div className="gift-box" onClick={() => setShowContent(!showContent)}>
          <div className="gift-lid"></div>
          <div className="gift-body">
            <div className="gift-bow"></div>
          </div>
        </div>

        {showContent && (
          <div className="message-container animate-bounce-in">
            <h1 className="surprise-title">That's a surprise! 🎁</h1>
            <p className="surprise-text">
              Results are hidden from judges to keep the excitement alive!
            </p>
            <p className="surprise-subtext">
              Ask your admin to reveal the scores when the time is right.
            </p>
            <div className="confetti-emoji">🎉</div>
          </div>
        )}
      </div>

      <style>{`
        .surprise-container {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          animation: float-particle linear infinite;
          opacity: 0.6;
        }

        @keyframes float-particle {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }

        .surprise-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          z-index: 1;
        }

        .gift-box {
          cursor: pointer;
          position: relative;
          animation: shake 2s ease-in-out infinite;
        }

        @keyframes shake {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        .gift-body {
          width: 100px;
          height: 80px;
          background: linear-gradient(135deg, #f472b6, #ec4899);
          border-radius: 8px;
          position: relative;
          box-shadow: 0 10px 30px rgba(244, 114, 182, 0.4);
        }

        .gift-lid {
          width: 110px;
          height: 25px;
          background: linear-gradient(135deg, #f472b6, #ec4899);
          border-radius: 8px 8px 4px 4px;
          position: absolute;
          top: -20px;
          left: -5px;
          box-shadow: 0 4px 15px rgba(244, 114, 182, 0.3);
        }

        .gift-bow {
          width: 30px;
          height: 30px;
          background: #fbbf24;
          border-radius: 50%;
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.5);
        }

        .message-container {
          text-align: center;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 48px;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 450px;
        }

        .animate-bounce-in {
          animation: bounceIn 0.6s ease-out;
        }

        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        .surprise-title {
          font-size: 36px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          background: linear-gradient(135deg, #6366f1, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
        }

        .surprise-text {
          font-size: 18px;
          color: var(--text-secondary, #71717a);
          margin-bottom: 12px;
          line-height: 1.6;
        }

        .surprise-subtext {
          font-size: 14px;
          color: var(--text-muted, #a1a1aa);
          font-style: italic;
        }

        .confetti-emoji {
          font-size: 48px;
          margin-top: 24px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @media (max-width: 768px) {
          .surprise-title {
            font-size: 28px;
          }
          .message-container {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
}