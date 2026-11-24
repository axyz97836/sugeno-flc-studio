import React from 'react';
import { Icon } from './icons';

export default function Controls({
  currentStep,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
  onSpeedChange,
  stepInfo,
}) {
  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-3 px-2.5 sm:px-6 h-full w-full max-w-full min-w-0 overflow-hidden">
      {/* Transport buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onReset}
          aria-label="Reset simulation to step 1"
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[6px] flex items-center justify-center transition-colors text-muted hover:text-ink hover:bg-panel-hover border border-transparent focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Icon name="reset" className="w-4 h-4" />
        </button>

        <button
          onClick={onStepBack}
          disabled={currentStep === 0}
          aria-label="Previous step"
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[6px] flex items-center justify-center transition-colors text-muted hover:text-ink hover:bg-panel-hover disabled:opacity-25 disabled:pointer-events-none border border-transparent focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Icon name="stepBack" className="w-4 h-4" />
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
          className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-[6px] flex items-center justify-center transition-colors border focus-visible:outline-2 focus-visible:outline-accent ${
            isPlaying
              ? 'bg-accent-subtle border-accent-line text-ink'
              : 'bg-accent border-accent text-ground'
          }`}
        >
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            className="w-4 h-4"
            stroke={isPlaying ? 'currentColor' : 'var(--color-ground)'}
          />
        </button>

        <button
          onClick={onStepForward}
          disabled={currentStep === stepInfo.length - 1}
          aria-label="Next step"
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[6px] flex items-center justify-center transition-colors text-muted hover:text-ink hover:bg-panel-hover disabled:opacity-25 disabled:pointer-events-none border border-transparent focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Icon name="stepForward" className="w-4 h-4" />
        </button>
      </div>

      <div className="hidden md:block w-px h-6 bg-line flex-shrink-0" />

      {/* Plain Step Label (Step 3 of 5) */}
      <div className="text-xs font-mono font-bold text-muted tabular-nums tracking-wide">
        Step {currentStep + 1} of {stepInfo.length}
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        <label htmlFor="sim-speed" className="text-xs uppercase tracking-wider text-muted hidden sm:inline">
          Speed
        </label>
        <input
          id="sim-speed"
          type="range"
          min={500}
          max={4000}
          step={250}
          value={4500 - speed}
          onChange={(e) => onSpeedChange(4500 - parseInt(e.target.value, 10))}
          className="w-14 sm:w-24 min-h-[44px] py-4"
          aria-label="Simulation step speed in seconds"
        />
        <span className="text-xs font-mono tabular-nums text-muted w-8 text-right">
          {(speed / 1000).toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
