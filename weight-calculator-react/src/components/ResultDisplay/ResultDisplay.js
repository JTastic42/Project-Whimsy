import React from 'react';
import PropTypes from 'prop-types';
import { formatWeight } from '../../utils/weightUtils';
import './ResultDisplay.css';

const ResultDisplay = React.memo(({ result, title }) => {
  const unitLabel = result.unit;
  
  return (
    <div className="result-container">
      <h3>{title}</h3>
      <div className="result-header">
        <p><strong>Target Weight:</strong> {formatWeight(result.targetWeight, unitLabel)} {unitLabel}</p>
        <p><strong>Actual Weight:</strong> {formatWeight(result.actualWeight, unitLabel)} {unitLabel}</p>
        {result.exactMatch ? (
          <p className="exact-match">✓ Exact match achieved!</p>
        ) : (
          <p className="difference">
            ✗ Difference: {formatWeight(Math.abs(result.actualWeight - result.targetWeight), unitLabel)} {unitLabel}
          </p>
        )}
      </div>
      
      <div className="weight-breakdown">
        <p><strong>Barbell Weight:</strong> {formatWeight(result.barbellWeight, unitLabel)} {unitLabel}</p>
        <p><strong>Plate Weight:</strong> {formatWeight(result.plateWeight, unitLabel)} {unitLabel}</p>
        <p><strong>Total Plates (both sides):</strong> {result.totalPlates}</p>
      </div>

      {result.totalPlates > 0 ? (
        <div className="plate-breakdown">
          <h4>Plate Breakdown (each side of bar):</h4>
          <ul>
            {Object.entries(result.plateBreakdownPerSide || result.plateBreakdown)
              .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
              .map(([weight, count]) => {
              const perSide = result.plateBreakdownPerSide ? count : Math.floor((result.plateBreakdown?.[weight] ?? 0) / 2);
              if (perSide > 0) {
                const weightNum = parseFloat(weight);
                const totalPerSide = weightNum * perSide;
                const total = (result.plateBreakdown?.[weight] ?? perSide * 2);
                return (
                  <li key={weight}>
                    {formatWeight(weightNum, unitLabel)} {unitLabel}: <strong>{perSide} per side</strong> ({total} total) = {formatWeight(totalPerSide, unitLabel)} {unitLabel} per side
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      ) : (
        <p className="no-plates">No additional plates needed - barbell weight only!</p>
      )}
    </div>
  );
});

ResultDisplay.displayName = 'ResultDisplay';

ResultDisplay.propTypes = {
  result: PropTypes.shape({
    unit: PropTypes.string.isRequired,
    targetWeight: PropTypes.number.isRequired,
    actualWeight: PropTypes.number.isRequired,
    exactMatch: PropTypes.bool.isRequired,
    totalPlates: PropTypes.number.isRequired,
    plateBreakdown: PropTypes.object.isRequired,
    barbellWeight: PropTypes.number.isRequired,
    plateWeight: PropTypes.number.isRequired
  }).isRequired,
  title: PropTypes.string.isRequired
};

export default ResultDisplay;