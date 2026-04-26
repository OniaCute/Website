'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [inputVal, setInputVal] = useState(value);
  const [alpha, setAlpha] = useState(1);
  const [hex, setHex] = useState('#60a5fa');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputVal(value);
    const parsed = parseColor(value);
    setHex(parsed.hex);
    setAlpha(parsed.alpha);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) onChange(val);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextHex = e.target.value;
    setHex(nextHex);
    const nextColor = alpha < 1 ? hexToRgba(nextHex, alpha) : nextHex;
    setInputVal(nextColor);
    onChange(nextColor);
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextAlpha = Number(e.target.value);
    setAlpha(nextAlpha);
    const nextColor = nextAlpha < 1 ? hexToRgba(hex, nextAlpha) : hex;
    setInputVal(nextColor);
    onChange(nextColor);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-9 h-9 rounded-lg border-2 border-[var(--color-border)] transition-transform hover:scale-110 flex-shrink-0"
          style={{ backgroundColor: value }}
          title={value}
        />
        <input
          ref={inputRef}
          type="color"
          value={hex}
          onChange={handleColorChange}
          className="sr-only"
        />
        <input
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          className="input text-xs py-2 flex-1 min-w-0"
          placeholder="#60a5fa"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={alpha}
          onChange={handleAlphaChange}
          className="range-light w-full"
        />
        <span className="text-xs w-12 text-right" style={{ color: 'var(--color-text-muted)' }}>
          {Math.round(alpha * 100)}%
        </span>
      </div>
    </div>
  );
}

function parseColor(color: string): { hex: string; alpha: number } {
  const normalized = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return { hex: normalized, alpha: 1 };
  }

  const rgba = normalized.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(0|1|0?\.\d+))?\)$/i);
  if (rgba) {
    const r = clamp(Number(rgba[1]), 0, 255);
    const g = clamp(Number(rgba[2]), 0, 255);
    const b = clamp(Number(rgba[3]), 0, 255);
    const a = rgba[4] === undefined ? 1 : clamp(Number(rgba[4]), 0, 1);
    return { hex: rgbToHex(r, g, b), alpha: a };
  }

  return { hex: '#60a5fa', alpha: 1 };
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(2))})`;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
