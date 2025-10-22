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
        <p className="text-xl font-semibold">The Lane is Now Open!</p>
      </div>
    );
  }

  return (
    <div className="countdown-timer flex gap-4 items-center justify-center">
      <div className="time-unit text-center">
        <div className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {formatTimeUnit(timeRemaining.days)}
        </div>
        <div className="text-sm text-gray-400 mt-1">Days</div>
      </div>
      <div className="text-3xl font-bold text-gray-500">:</div>
      <div className="time-unit text-center">
        <div className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {formatTimeUnit(timeRemaining.hours)}
        </div>
        <div className="text-sm text-gray-400 mt-1">Hours</div>
      </div>
      <div className="text-3xl font-bold text-gray-500">:</div>
      <div className="time-unit text-center">
        <div className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {formatTimeUnit(timeRemaining.minutes)}
        </div>
        <div className="text-sm text-gray-400 mt-1">Minutes</div>
      </div>
      <div className="text-3xl font-bold text-gray-500">:</div>
      <div className="time-unit text-center">
        <div className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {formatTimeUnit(timeRemaining.seconds)}
        </div>
        <div className="text-sm text-gray-400 mt-1">Seconds</div>
      </div>
    </div>
  );
};

export default CountdownTimer;