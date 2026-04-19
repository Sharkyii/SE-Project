import React from 'react';

interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative min-h-screen overflow-hidden bg-gray-950 ${className}`}>
      {/* Aurora Effect - BEHIND CONTENT */}
      <div className="aurora-container fixed inset-0 z-0">
        <div className="aurora aurora-1"></div>
        <div className="aurora aurora-2"></div>
        <div className="aurora aurora-3"></div>
      </div>
      
      {/* Overlay for better text visibility */}
      <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-[1px] z-0"></div>
      
      {/* Content - IN FRONT */}
      <div className="relative z-50">
        {children}
      </div>

      <style>{`
        .aurora-container {
          position: fixed;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        .aurora {
          position: absolute;
          width: 100%;
          height: 100%;
          filter: blur(80px);
          opacity: 0.5;
        }

        .aurora-1 {
          background: radial-gradient(
            circle at 20% 50%,
            rgba(59, 130, 246, 0.5) 0%,
            transparent 50%
          );
          animation: aurora-1 20s ease-in-out infinite;
        }

        .aurora-2 {
          background: radial-gradient(
            circle at 80% 30%,
            rgba(139, 92, 246, 0.5) 0%,
            transparent 50%
          );
          animation: aurora-2 25s ease-in-out infinite;
        }

        .aurora-3 {
          background: radial-gradient(
            circle at 50% 80%,
            rgba(16, 185, 129, 0.4) 0%,
            transparent 50%
          );
          animation: aurora-3 30s ease-in-out infinite;
        }

        @keyframes aurora-1 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
            opacity: 0.5;
          }
          33% {
            transform: translate(10%, -10%) scale(1.1);
            opacity: 0.6;
          }
          66% {
            transform: translate(-10%, 10%) scale(0.9);
            opacity: 0.4;
          }
        }

        @keyframes aurora-2 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
            opacity: 0.5;
          }
          33% {
            transform: translate(-15%, 15%) scale(1.2);
            opacity: 0.6;
          }
          66% {
            transform: translate(15%, -15%) scale(0.8);
            opacity: 0.4;
          }
        }

        @keyframes aurora-3 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translate(10%, 10%) scale(1.15);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};
