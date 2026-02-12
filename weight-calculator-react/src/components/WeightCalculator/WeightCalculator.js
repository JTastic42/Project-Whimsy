import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import ResultDisplay from '../ResultDisplay';
import { formatWeight, validateWeight, lbsToKg, kgToLbs } from '../../utils/weightUtils';
import {
  BARBELL_OPTIONS,
  WEIGHT_INCREMENT_LBS,
  WEIGHT_INCREMENT_KG,
  SWIPE_THRESHOLD,
  HAPTIC_DURATION
} from '../../utils/constants';
import './WeightCalculator.css';

const WeightCalculator = ({
  unit,
  selectedBarbell,
  onUnitChange,
  onBarbellChange,
  onPreferenceChange,
  onResult,
  compact = false
}) => {
  const [targetWeight, setTargetWeight] = useState(
    selectedBarbell ? formatWeight(selectedBarbell.weight, unit) : (unit === 'lbs' ? '45' : '20')
  );
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [touchStart, setTouchStart] = useState(null);

  const incrementWeight = useCallback(() => {
    const currentWeight = parseFloat(targetWeight) || 0;
    const increment = unit === 'lbs' ? WEIGHT_INCREMENT_LBS : WEIGHT_INCREMENT_KG;
    setTargetWeight(formatWeight(currentWeight + increment, unit));
    setError('');
  }, [targetWeight, unit]);

  const decrementWeight = useCallback(() => {
    const currentWeight = parseFloat(targetWeight) || 0;
    const increment = unit === 'lbs' ? WEIGHT_INCREMENT_LBS : WEIGHT_INCREMENT_KG;
    setTargetWeight(formatWeight(Math.max(0, currentWeight - increment), unit));
    setError('');
  }, [targetWeight, unit]);

  const toggleUnit = useCallback(() => {
    const newUnit = unit === 'lbs' ? 'kg' : 'lbs';
    const newBarbell = BARBELL_OPTIONS[newUnit][0];
    onUnitChange?.(newUnit);
    onBarbellChange?.(newBarbell);
    onPreferenceChange?.({ unit: newUnit, defaultBarbell: newBarbell });

    const currentWeight = parseFloat(targetWeight);
    if (!isNaN(currentWeight)) {
      const converted = newUnit === 'kg' ? lbsToKg(currentWeight) : kgToLbs(currentWeight);
      setTargetWeight(formatWeight(converted, newUnit));
    }
    setError('');
  }, [unit, targetWeight, onUnitChange, onBarbellChange, onPreferenceChange]);

  const handleBarbellChange = (e) => {
    const w = parseFloat(e.target.value);
    const barbell = BARBELL_OPTIONS[unit].find(b => b.weight === w);
    if (barbell) {
      onBarbellChange?.(barbell);
      onPreferenceChange?.({ defaultBarbell: barbell });
      setTargetWeight(formatWeight(barbell.weight, unit));
    }
  };

  const handleSwipe = useCallback((direction) => {
    if (direction === 'left') decrementWeight();
    else if (direction === 'right') incrementWeight();
    if (navigator.vibrate) navigator.vibrate(HAPTIC_DURATION);
  }, [decrementWeight, incrementWeight]);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStart || e.changedTouches.length !== 1) {
      setTouchStart(null);
      return;
    }
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      handleSwipe(deltaX > 0 ? 'right' : 'left');
    }
    setTouchStart(null);
  }, [touchStart, handleSwipe]);

  const calculatePlates = useCallback((target) => {
    const plateWeights = unit === 'lbs' ? [45, 25, 10, 5, 2.5] : [25, 20, 15, 10, 5, 2.5, 1.25];
    const barbellWeight = selectedBarbell?.weight ?? (unit === 'lbs' ? 45 : 20);

    if (target < barbellWeight) {
      return {
        plateBreakdown: Object.fromEntries(plateWeights.map(w => [w, 0])),
        plateBreakdownPerSide: Object.fromEntries(plateWeights.map(w => [w, 0])),
        actualWeight: barbellWeight,
        targetWeight: target,
        exactMatch: false,
        totalPlates: 0,
        barbellWeight,
        plateWeight: 0,
        unit
      };
    }

    // Weight must be distributed on BOTH sides of the bar - calculate per-side loading
    const plateBreakdownPerSide = Object.fromEntries(plateWeights.map(w => [w, 0]));
    let remainingPerSide = Math.round(((target - barbellWeight) / 2) * 100) / 100;

    for (const plateWeight of plateWeights) {
      if (remainingPerSide >= plateWeight) {
        const countPerSide = Math.floor(remainingPerSide / plateWeight);
        plateBreakdownPerSide[plateWeight] = countPerSide;
        remainingPerSide -= countPerSide * plateWeight;
        remainingPerSide = Math.round(remainingPerSide * 100) / 100;
      }
    }

    // Total plates = per-side count × 2 (both sides)
    const plateBreakdown = Object.fromEntries(
      Object.entries(plateBreakdownPerSide).map(([w, perSide]) => [w, perSide * 2])
    );
    const plateWeight = Object.entries(plateBreakdown).reduce(
      (sum, [w, c]) => sum + parseFloat(w) * c,
      0
    );
    const actualWeight = barbellWeight + plateWeight;
    const totalPlates = Object.values(plateBreakdown).reduce((s, c) => s + c, 0);
    return {
      plateBreakdown,
      plateBreakdownPerSide,
      actualWeight,
      targetWeight: target,
      exactMatch: Math.abs(actualWeight - target) < 0.01,
      totalPlates,
      barbellWeight,
      plateWeight,
      unit
    };
  }, [unit, selectedBarbell]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateWeight(targetWeight, unit);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    const newResult = calculatePlates(parseFloat(targetWeight));
    setResult(newResult);
    onResult?.(newResult);
  };

  const barbell = selectedBarbell || BARBELL_OPTIONS[unit]?.[0];

  return (
    <div className={`weight-calculator-inline ${compact ? 'compact' : ''}`}>
      <form onSubmit={handleSubmit} className="calculator-form-inline">
        <div className="input-group">
          <label htmlFor="calc-barbell">Barbell:</label>
          <select
            id="calc-barbell"
            value={barbell?.weight ?? ''}
            onChange={handleBarbellChange}
            className="barbell-select"
          >
            {(BARBELL_OPTIONS[unit] || []).map(b => (
              <option key={b.weight} value={b.weight}>{b.label}</option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label htmlFor="calc-weight">Target weight ({unit}):</label>
          <div className="input-with-controls">
            <button type="button" className="increment-btn decrement" onClick={decrementWeight} aria-label="Decrease">−</button>
            <input
              id="calc-weight"
              type="text"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              placeholder={unit === 'lbs' ? '135' : '60'}
              className={error ? 'error' : ''}
            />
            <button type="button" className="increment-btn increment" onClick={incrementWeight} aria-label="Increase">+</button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="calc-actions">
          <button type="submit" className="calculate-btn">Calculate</button>
          {onUnitChange && (
            <button type="button" className="unit-toggle-btn" onClick={toggleUnit}>
              {unit.toUpperCase()}
            </button>
          )}
        </div>
      </form>
      {result && <ResultDisplay result={result} title="Plate breakdown" />}
    </div>
  );
};

WeightCalculator.propTypes = {
  unit: PropTypes.oneOf(['lbs', 'kg']),
  selectedBarbell: PropTypes.shape({
    weight: PropTypes.number,
    label: PropTypes.string
  }),
  onUnitChange: PropTypes.func,
  onBarbellChange: PropTypes.func,
  onPreferenceChange: PropTypes.func,
  onResult: PropTypes.func,
  compact: PropTypes.bool
};

export default WeightCalculator;
