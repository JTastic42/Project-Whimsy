import React, { useState } from 'react';
import PropTypes from 'prop-types';
import WeightCalculator from '../WeightCalculator';
import { formatWeight } from '../../utils/weightUtils';
import './WeightCalculatorModal.css';

const WeightCalculatorModal = ({
  isOpen,
  onClose,
  onUseWeight,
  unit,
  selectedBarbell,
  onUnitChange,
  onBarbellChange,
  onPreferenceChange
}) => {
  const [lastResult, setLastResult] = useState(null);

  if (!isOpen) return null;

  const handleUseWeight = () => {
    if (lastResult) {
      const weight = formatWeight(lastResult.actualWeight, lastResult.unit);
      onUseWeight?.(weight);
    }
    onClose?.();
  };

  return (
    <div className="weight-calc-modal-overlay" onClick={onClose}>
      <div className="weight-calc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="weight-calc-modal-header">
          <h3>Plate Calculator</h3>
          <button type="button" className="weight-calc-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="weight-calc-modal-body">
          <WeightCalculator
            unit={unit}
            selectedBarbell={selectedBarbell}
            onUnitChange={onUnitChange}
            onBarbellChange={onBarbellChange}
            onPreferenceChange={onPreferenceChange}
            onResult={setLastResult}
            compact
          />
          <div className="weight-calc-modal-note">
            Calculate plates, then click "Use this weight" to copy the result to your workout form.
          </div>
        </div>
        {lastResult && (
          <div className="weight-calc-modal-footer">
            <button type="button" className="use-weight-btn" onClick={handleUseWeight}>
              Use this weight ({formatWeight(lastResult.actualWeight, lastResult.unit)} {lastResult.unit})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

WeightCalculatorModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onUseWeight: PropTypes.func,
  unit: PropTypes.oneOf(['lbs', 'kg']),
  selectedBarbell: PropTypes.object,
  onUnitChange: PropTypes.func,
  onBarbellChange: PropTypes.func,
  onPreferenceChange: PropTypes.func
};

export default WeightCalculatorModal;
