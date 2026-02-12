import React from 'react';
import PropTypes from 'prop-types';
import { BARBELL_OPTIONS } from '../../utils/constants';
import './SettingsModal.css';

const SettingsModal = ({
  isOpen,
  onClose,
  unit,
  distanceUnit,
  themePreference,
  selectedBarbell,
  onUnitChange,
  onDistanceUnitChange,
  onThemeChange,
  onBarbellChange,
  onOpenDataManager
}) => {
  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h3>Settings</h3>
          <button type="button" className="settings-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="settings-modal-body">
          <div className="settings-group">
            <label>Weight unit</label>
            <div className="settings-toggle-group">
              <button
                type="button"
                className={`settings-toggle-btn ${unit === 'lbs' ? 'active' : ''}`}
                onClick={() => onUnitChange?.('lbs')}
              >
                lbs
              </button>
              <button
                type="button"
                className={`settings-toggle-btn ${unit === 'kg' ? 'active' : ''}`}
                onClick={() => onUnitChange?.('kg')}
              >
                kg
              </button>
            </div>
          </div>
          <div className="settings-group">
            <label>Distance unit</label>
            <div className="settings-toggle-group">
              <button
                type="button"
                className={`settings-toggle-btn ${distanceUnit === 'mi' ? 'active' : ''}`}
                onClick={() => onDistanceUnitChange?.('mi')}
              >
                mi
              </button>
              <button
                type="button"
                className={`settings-toggle-btn ${distanceUnit === 'km' ? 'active' : ''}`}
                onClick={() => onDistanceUnitChange?.('km')}
              >
                km
              </button>
            </div>
          </div>
          <div className="settings-group">
            <label>Theme</label>
            <div className="settings-toggle-group">
              <button
                type="button"
                className={`settings-toggle-btn ${themePreference === 'light' ? 'active' : ''}`}
                onClick={() => onThemeChange?.('light')}
              >
                Light
              </button>
              <button
                type="button"
                className={`settings-toggle-btn ${themePreference === 'dark' ? 'active' : ''}`}
                onClick={() => onThemeChange?.('dark')}
              >
                Dark
              </button>
              <button
                type="button"
                className={`settings-toggle-btn ${themePreference === 'system' ? 'active' : ''}`}
                onClick={() => onThemeChange?.('system')}
              >
                System
              </button>
            </div>
          </div>
          <div className="settings-group">
            <label>Default barbell</label>
            <select
              className="settings-select"
              value={selectedBarbell?.weight ?? ''}
              onChange={(e) => {
                const w = parseFloat(e.target.value);
                const barbell = BARBELL_OPTIONS[unit]?.find((b) => b.weight === w);
                if (barbell) onBarbellChange?.(barbell);
              }}
            >
              {(BARBELL_OPTIONS[unit] || []).map((b) => (
                <option key={b.weight} value={b.weight}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div className="settings-group">
            <button type="button" className="settings-data-btn" onClick={onOpenDataManager}>
              Data Manager (export, import, clear)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

SettingsModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  unit: PropTypes.oneOf(['lbs', 'kg']),
  distanceUnit: PropTypes.oneOf(['mi', 'km']),
  themePreference: PropTypes.oneOf(['light', 'dark', 'system']),
  selectedBarbell: PropTypes.object,
  onUnitChange: PropTypes.func,
  onDistanceUnitChange: PropTypes.func,
  onThemeChange: PropTypes.func,
  onBarbellChange: PropTypes.func,
  onOpenDataManager: PropTypes.func
};

export default SettingsModal;
