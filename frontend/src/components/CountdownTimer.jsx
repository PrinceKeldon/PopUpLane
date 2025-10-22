import React, { useState, useEffect } from 'react';
import { calculateTimeRemaining, formatTimeUnit } from '../utils/countdown';

const CountdownTimer = ({ targetDate, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(targetDate);
      setTimeRemaining(remaining);

      if (remaining.isExpired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (timeRemaining.isExpired) {
    return (
      <div className="countdown-expired">
        <p className="text-xl font-semibold" style={{ color: '#3A7BD5' }}>The Lane is Now Open!</p>
      </div>
    );
  }

  return (
    <div className="countdown-timer flex gap-3 md:gap-6 items-center justify-center">
      {/* Days */}
      <div className="time-unit-box relative">
        <div 
          className="time-box p-4 md:p-6 rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(58, 123, 213, 0.2) 0%, rgba(255, 79, 129, 0.2) 100%)',
            border: '2px solid',
            borderImage: 'linear-gradient(135deg, #3A7BD5, #FF4F81) 1',
            boxShadow: '0 0 30px rgba(58, 123, 213, 0.4), 0 0 60px rgba(255, 79, 129, 0.2)',
            animation: 'pulse-glow 2s ease-in-out infinite'
          }}
        >
          <div className="text-4xl md:text-6xl font-bold" style={{ 
            fontFamily: 'Space Grotesk, sans-serif',
            background: 'linear-gradient(135deg, #3A7BD5 0%, #FF4F81 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {formatTimeUnit(timeRemaining.days)}
          </div>
        </div>
        <div className="text-xs md:text-sm uppercase tracking-wider mt-2 font-semibold" style={{ color: '#3A7BD5' }}>
          Days
        </div>
      </div>

      <div className="text-3xl md:text-4xl font-bold" style={{ color: '#FF4F81' }}>:</div>

      {/* Hours */}
      <div className="time-unit-box relative">
        <div 
          className="time-box p-4 md:p-6 rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(58, 123, 213, 0.2) 0%, rgba(255, 79, 129, 0.2) 100%)',
            border: '2px solid',
            borderImage: 'linear-gradient(135deg, #3A7BD5, #FF4F81) 1',
            boxShadow: '0 0 30px rgba(58, 123, 213, 0.4), 0 0 60px rgba(255, 79, 129, 0.2)',
            animation: 'pulse-glow 2s ease-in-out infinite 0.2s'
          }}
        >
          <div className="text-4xl md:text-6xl font-bold" style={{ 
            fontFamily: 'Space Grotesk, sans-serif',
            background: 'linear-gradient(135deg, #3A7BD5 0%, #FF4F81 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {formatTimeUnit(timeRemaining.hours)}
          </div>
        </div>
        <div className="text-xs md:text-sm uppercase tracking-wider mt-2 font-semibold" style={{ color: '#3A7BD5' }}>
          Hours
        </div>
      </div>

      <div className="text-3xl md:text-4xl font-bold" style={{ color: '#FF4F81' }}>:</div>

      {/* Minutes */}
      <div className="time-unit-box relative">
        <div 
          className="time-box p-4 md:p-6 rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(58, 123, 213, 0.2) 0%, rgba(255, 79, 129, 0.2) 100%)',
            border: '2px solid',
            borderImage: 'linear-gradient(135deg, #3A7BD5, #FF4F81) 1',
            boxShadow: '0 0 30px rgba(58, 123, 213, 0.4), 0 0 60px rgba(255, 79, 129, 0.2)',
            animation: 'pulse-glow 2s ease-in-out infinite 0.4s'
          }}
        >
          <div className="text-4xl md:text-6xl font-bold" style={{ 
            fontFamily: 'Space Grotesk, sans-serif',
            background: 'linear-gradient(135deg, #3A7BD5 0%, #FF4F81 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {formatTimeUnit(timeRemaining.minutes)}
          </div>
        </div>
        <div className="text-xs md:text-sm uppercase tracking-wider mt-2 font-semibold" style={{ color: '#3A7BD5' }}>
          Minutes
        </div>
      </div>

      <div className="text-3xl md:text-4xl font-bold" style={{ color: '#FF4F81' }}>:</div>

      {/* Seconds */}
      <div className="time-unit-box relative">
        <div 
          className="time-box p-4 md:p-6 rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(58, 123, 213, 0.2) 0%, rgba(255, 79, 129, 0.2) 100%)',
            border: '2px solid',
            borderImage: 'linear-gradient(135deg, #3A7BD5, #FF4F81) 1',
            boxShadow: '0 0 30px rgba(58, 123, 213, 0.4), 0 0 60px rgba(255, 79, 129, 0.2)',
            animation: 'pulse-glow 2s ease-in-out infinite 0.6s'
          }}
        >
          <div className="text-4xl md:text-6xl font-bold" style={{ 
            fontFamily: 'Space Grotesk, sans-serif',
            background: 'linear-gradient(135deg, #3A7BD5 0%, #FF4F81 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {formatTimeUnit(timeRemaining.seconds)}
          </div>
        </div>
        <div className="text-xs md:text-sm uppercase tracking-wider mt-2 font-semibold" style={{ color: '#3A7BD5' }}>
          Seconds
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 30px rgba(58, 123, 213, 0.4), 0 0 60px rgba(255, 79, 129, 0.2);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 40px rgba(58, 123, 213, 0.6), 0 0 80px rgba(255, 79, 129, 0.4);
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};

export default CountdownTimer;