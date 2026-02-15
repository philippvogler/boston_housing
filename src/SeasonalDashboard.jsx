import { useState, useMemo } from "react";

// =============================================================================
// SEASONAL DATA - Compiled from 20-25 year historical data (2000-2024/2025)
// Sources: Barchart, Equity Clock, BullionVault, Trade That Swing,
//          Investing.com, VisualCapitalist, academic research
// =============================================================================

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CATEGORIES = {
  "US Indices": ["DJI", "SPX", "IXIC", "RUT"],
  "European Indices": ["SX5E", "DAX", "FTSE"],
  "Asia": ["NKY"],
  "Precious Metals": ["GOLD", "SILVER", "PLATINUM"],
  "Industrial & Energy": ["COPPER", "OIL"],
};

// Monthly data: [avgReturn%, winRate%, medianReturn%, bestMonth%, worstMonth%]
// Based on ~20-25 years of data (2000-2024) from multiple cross-referenced sources
const SEASONAL_DATA = {
  DJI: {
    name: "Dow Jones Industrial Average",
    ticker: "^DJI",
    period: "2000\u20132024",
    years: 25,
    monthly: [
      { m: "Jan", avg: 0.1, win: 56, med: 0.4, best: 7.2, worst: -8.8 },
      { m: "Feb", avg: -0.1, win: 48, med: 0.2, best: 7.0, worst: -10.1 },
      { m: "Mar", avg: 0.8, win: 64, med: 1.2, best: 10.2, worst: -13.7 },
      { m: "Apr", avg: 1.4, win: 72, med: 1.5, best: 11.1, worst: -15.1 },
      { m: "May", avg: 0.2, win: 56, med: 0.5, best: 4.3, worst: -6.7 },
      { m: "Jun", avg: -0.3, win: 48, med: 0.1, best: 5.0, worst: -7.9 },
      { m: "Jul", avg: 1.2, win: 64, med: 1.3, best: 7.7, worst: -4.1 },
      { m: "Aug", avg: -0.3, win: 48, med: 0.2, best: 5.8, worst: -6.4 },
      { m: "Sep", avg: -1.0, win: 36, med: -0.8, best: 5.5, worst: -11.7 },
      { m: "Oct", avg: 0.7, win: 60, med: 1.3, best: 10.6, worst: -14.1 },
      { m: "Nov", avg: 1.6, win: 72, med: 1.8, best: 11.8, worst: -5.3 },
      { m: "Dec", avg: 1.0, win: 68, med: 1.2, best: 6.5, worst: -3.5 },
    ],
  },
  SPX: {
    name: "S&P 500",
    ticker: "^GSPC",
    period: "2000\u20132024",
    years: 25,
    monthly: [
      { m: "Jan", avg: 0.2, win: 56, med: 0.5, best: 7.9, worst: -8.6 },
      { m: "Feb", avg: -0.2, win: 48, med: 0.3, best: 7.0, worst: -10.9 },
      { m: "Mar", avg: 0.9, win: 64, med: 1.4, best: 9.4, worst: -12.5 },
      { m: "Apr", avg: 1.5, win: 72, med: 1.6, best: 12.7, worst: -13.7 },
      { m: "May", avg: 0.2, win: 52, med: 0.4, best: 5.3, worst: -8.2 },
      { m: "Jun", avg: -0.2, win: 48, med: 0.2, best: 5.4, worst: -8.4 },
      { m: "Jul", avg: 1.4, win: 68, med: 1.5, best: 7.6, worst: -5.9 },
      { m: "Aug", avg: -0.1, win: 52, med: 0.5, best: 7.0, worst: -9.0 },
      { m: "Sep", avg: -1.1, win: 36, med: -0.7, best: 8.3, worst: -11.0 },
      { m: "Oct", avg: 0.8, win: 60, med: 1.5, best: 10.8, worst: -16.9 },
      { m: "Nov", avg: 1.8, win: 76, med: 2.0, best: 10.8, worst: -7.2 },
      { m: "Dec", avg: 1.1, win: 72, med: 1.3, best: 6.5, worst: -4.2 },
    ],
  },
  IXIC: {
    name: "NASDAQ Composite",
    ticker: "^IXIC",
    period: "2000\u20132024",
    years: 25,
    monthly: [
      { m: "Jan", avg: 0.3, win: 56, med: 0.6, best: 12.0, worst: -10.3 },
      { m: "Feb", avg: 0.1, win: 48, med: 0.4, best: 8.0, worst: -11.7 },
      { m: "Mar", avg: 0.5, win: 56, med: 1.0, best: 10.9, worst: -14.7 },
      { m: "Apr", avg: 1.2, win: 64, med: 1.4, best: 15.6, worst: -15.6 },
      { m: "May", avg: 0.3, win: 52, med: 0.6, best: 6.8, worst: -8.3 },
      { m: "Jun", avg: -0.1, win: 48, med: 0.3, best: 6.5, worst: -9.1 },
      { m: "Jul", avg: 1.8, win: 64, med: 2.0, best: 12.3, worst: -7.9 },
      { m: "Aug", avg: -0.3, win: 48, med: 0.3, best: 9.6, worst: -9.7 },
      { m: "Sep", avg: -1.2, win: 36, med: -0.9, best: 12.4, worst: -12.1 },
      { m: "Oct", avg: 1.2, win: 60, med: 1.8, best: 13.8, worst: -17.7 },
      { m: "Nov", avg: 2.2, win: 72, med: 2.5, best: 11.8, worst: -10.8 },
      { m: "Dec", avg: 1.0, win: 68, med: 1.2, best: 8.8, worst: -5.5 },
    ],
  },
  RUT: {
    name: "Russell 2000",
    ticker: "^RUT",
    period: "2000\u20132024",
    years: 25,
    monthly: [
      { m: "Jan", avg: 0.1, win: 52, med: 0.3, best: 9.5, worst: -8.7 },
      { m: "Feb", avg: 0.4, win: 56, med: 0.8, best: 7.2, worst: -10.8 },
      { m: "Mar", avg: 0.6, win: 60, med: 1.0, best: 9.4, worst: -21.7 },
      { m: "Apr", avg: 1.0, win: 64, med: 1.2, best: 15.2, worst: -14.9 },
      { m: "May", avg: -0.1, win: 48, med: 0.2, best: 6.4, worst: -7.5 },
      { m: "Jun", avg: -0.2, win: 48, med: 0.3, best: 6.8, worst: -9.9 },
      { m: "Jul", avg: 1.0, win: 60, med: 1.2, best: 7.6, worst: -7.1 },
      { m: "Aug", avg: -0.4, win: 44, med: -0.2, best: 6.3, worst: -9.0 },
      { m: "Sep", avg: -1.0, win: 36, med: -0.8, best: 9.7, worst: -12.0 },
      { m: "Oct", avg: 0.9, win: 60, med: 1.4, best: 12.3, worst: -20.8 },
      { m: "Nov", avg: 2.0, win: 68, med: 2.2, best: 12.4, worst: -11.9 },
      { m: "Dec", avg: 2.0, win: 76, med: 2.1, best: 8.7, worst: -5.9 },
    ],
  },
  SX5E: {
    name: "Euro Stoxx 50",
    ticker: "^STOXX50E",
    period: "2000\u20132024",
    years: 25,
    monthly: [
      { m: "Jan", avg: -0.1, win: 52, med: 0.3, best: 7.4, worst: -10.4 },
      { m: "Feb", avg: 0.3, win: 52, med: 0.6, best: 9.1, worst: -13.4 },
      { m: "Mar", avg: 0.6, win: 60, med: 1.2, best: 10.2, worst: -14.1 },
      { m: "Apr", avg: 1.5, win: 68, med: 1.8, best: 14.2, worst: -7.8 },
      { m: "May", avg: -0.3, win: 44, med: -0.1, best: 5.8, worst: -9.3 },
      { m: "Jun", avg: -0.6, win: 44, med: -0.2, best: 7.5, worst: -11.2 },
      { m: "Jul", avg: 0.4, win: 56, med: 0.6, best: 10.2, worst: -9.3 },
      { m: "Aug", avg: -0.8, win: 40, med: -0.3, best: 7.1, worst: -12.4 },
      { m: "Sep", avg: -1.2, win: 36, med: -1.0, best: 10.7, worst: -13.2 },
      { m: "Oct", avg: 1.0, win: 60, med: 1.2, best: 12.5, worst: -14.5 },
      { m: "Nov", avg: 0.8, win: 56, med: 1.0, best: 8.9, worst: -8.4 },
      { m: "Dec", avg: 1.3, win: 72, med: 1.5, best: 7.4, worst: -5.9 },
    ],
  },
  DAX: {
    name: "DAX",
    ticker: "^GDAXI",
    period: "2000\u20132024",
    years: 25,
    monthly: [
      { m: "Jan", avg: 0.2, win: 56, med: 0.5, best: 9.1, worst: -9.8 },
      { m: "Feb", avg: 0.5, win: 56, med: 0.8, best: 9.2, worst: -12.9 },
      { m: "Mar", avg: 0.8, win: 60, med: 1.5, best: 11.6, worst: -16.4 },
      { m: "Apr", avg: 1.8, win: 72, med: 2.0, best: 16.1, worst: -6.4 },
      { m: "May", avg: -0.2, win: 48, med: 0.1, best: 7.4, worst: -9.4 },
      { m: "Jun", avg: -0.4, win: 44, med: 0.0, best: 6.3, worst: -10.8 },
      { m: "Jul", avg: 0.8, win: 56, med: 1.0, best: 9.0, worst: -7.5 },
      { m: "Aug", avg: -0.5, win: 44, med: -0.1, best: 6.2, worst: -14.3 },
      { m: "Sep", avg: -0.9, win: 40, med: -0.5, best: 11.0, worst: -14.4 },
      { m: "Oct", avg: 1.2, win: 60, med: 1.5, best: 12.8, worst: -14.5 },
      { m: "Nov", avg: 1.2, win: 64, med: 1.4, best: 10.7, worst: -9.8 },
      { m: "Dec", avg: 1.5, win: 72, med: 1.6, best: 7.9, worst: -6.1 },
    ],
  },
  FTSE: {
    name: "FTSE 100",
    ticker: "^FTSE",
    period: "2000\u20132024",
    years: 25,
    monthly: [
      { m: "Jan", avg: -0.3, win: 48, med: 0.0, best: 6.4, worst: -8.9 },
      { m: "Feb", avg: 0.1, win: 52, med: 0.3, best: 6.2, worst: -12.5 },
      { m: "Mar", avg: 0.4, win: 56, med: 0.8, best: 8.2, worst: -13.0 },
      { m: "Apr", avg: 1.3, win: 68, med: 1.5, best: 8.5, worst: -6.3 },
      { m: "May", avg: -0.1, win: 48, med: 0.2, best: 5.7, worst: -8.5 },
      { m: "Jun", avg: -0.4, win: 44, med: -0.1, best: 5.2, worst: -7.3 },
      { m: "Jul", avg: 0.6, win: 56, med: 0.8, best: 8.6, worst: -5.6 },
      { m: "Aug", avg: -0.3, win: 44, med: 0.0, best: 6.2, worst: -11.3 },
      { m: "Sep", avg: -0.6, win: 40, med: -0.3, best: 5.7, worst: -13.0 },
      { m: "Oct", avg: 0.5, win: 56, med: 0.8, best: 8.0, worst: -10.7 },
      { m: "Nov", avg: 1.0, win: 60, med: 1.2, best: 8.1, worst: -7.7 },
      { m: "Dec", avg: 1.2, win: 72, med: 1.3, best: 5.8, worst: -3.4 },
    ],
  },
  NKY: {
    name: "Nikkei 225",
    ticker: "^N225",
    period: "2000\u20132024",
    years: 25,
    monthly: [
      { m: "Jan", avg: 0.3, win: 56, med: 0.5, best: 8.3, worst: -7.6 },
      { m: "Feb", avg: 0.8, win: 56, med: 1.0, best: 10.7, worst: -9.4 },
      { m: "Mar", avg: 0.3, win: 52, med: 0.5, best: 9.0, worst: -17.5 },
      { m: "Apr", avg: 0.9, win: 60, med: 1.2, best: 11.6, worst: -12.2 },
      { m: "May", avg: -0.3, win: 44, med: -0.1, best: 7.7, worst: -11.7 },
      { m: "Jun", avg: -0.2, win: 48, med: 0.2, best: 7.4, worst: -8.2 },
      { m: "Jul", avg: 0.5, win: 56, med: 0.7, best: 7.7, worst: -7.6 },
      { m: "Aug", avg: -0.8, win: 40, med: -0.4, best: 7.7, worst: -7.5 },
      { m: "Sep", avg: -0.2, win: 44, med: 0.1, best: 7.7, worst: -12.0 },
      { m: "Oct", avg: 0.5, win: 56, med: 0.8, best: 8.3, worst: -23.8 },
      { m: "Nov", avg: 1.3, win: 64, med: 1.5, best: 11.1, worst: -9.4 },
      { m: "Dec", avg: 1.2, win: 64, med: 1.3, best: 12.1, worst: -6.5 },
    ],
  },
  GOLD: {
    name: "Gold",
    ticker: "GC=F",
    period: "2004\u20132024",
    years: 20,
    monthly: [
      { m: "Jan", avg: 2.9, win: 70, med: 2.5, best: 10.1, worst: -6.2 },
      { m: "Feb", avg: 0.2, win: 60, med: 0.5, best: 6.5, worst: -5.3 },
      { m: "Mar", avg: -0.3, win: 45, med: 0.0, best: 7.8, worst: -6.1 },
      { m: "Apr", avg: 0.8, win: 50, med: 0.3, best: 8.1, worst: -7.8 },
      { m: "May", avg: 0.3, win: 50, med: 0.2, best: 6.4, worst: -5.4 },
      { m: "Jun", avg: -0.4, win: 45, med: -0.2, best: 5.5, worst: -5.4 },
      { m: "Jul", avg: 1.2, win: 60, med: 1.0, best: 10.3, worst: -7.3 },
      { m: "Aug", avg: 1.8, win: 60, med: 1.5, best: 12.0, worst: -3.8 },
      { m: "Sep", avg: 1.5, win: 60, med: 1.2, best: 8.8, worst: -3.1 },
      { m: "Oct", avg: 0.2, win: 55, med: 0.4, best: 5.8, worst: -5.8 },
      { m: "Nov", avg: 1.6, win: 70, med: 1.5, best: 10.2, worst: -5.4 },
      { m: "Dec", avg: 1.2, win: 65, med: 1.0, best: 7.5, worst: -6.1 },
    ],
  },
  SILVER: {
    name: "Silver",
    ticker: "SI=F",
    period: "2004\u20132024",
    years: 20,
    monthly: [
      { m: "Jan", avg: 2.5, win: 65, med: 2.0, best: 16.5, worst: -8.9 },
      { m: "Feb", avg: 1.0, win: 55, med: 0.8, best: 20.5, worst: -10.2 },
      { m: "Mar", avg: -0.5, win: 45, med: -0.3, best: 9.1, worst: -9.5 },
      { m: "Apr", avg: 2.5, win: 65, med: 1.8, best: 28.1, worst: -12.6 },
      { m: "May", avg: -0.8, win: 40, med: -0.5, best: 8.4, worst: -9.3 },
      { m: "Jun", avg: -1.5, win: 35, med: -1.0, best: 5.8, worst: -11.2 },
      { m: "Jul", avg: 1.0, win: 55, med: 0.8, best: 15.2, worst: -8.5 },
      { m: "Aug", avg: 1.5, win: 60, med: 1.2, best: 16.4, worst: -10.2 },
      { m: "Sep", avg: 1.8, win: 60, med: 1.5, best: 16.9, worst: -10.5 },
      { m: "Oct", avg: -0.5, win: 45, med: 0.0, best: 7.6, worst: -14.5 },
      { m: "Nov", avg: 0.5, win: 50, med: 0.3, best: 13.8, worst: -8.2 },
      { m: "Dec", avg: 0.2, win: 50, med: 0.2, best: 12.1, worst: -11.5 },
    ],
  },
  PLATINUM: {
    name: "Platinum",
    ticker: "PL=F",
    period: "2004\u20132024",
    years: 20,
    monthly: [
      { m: "Jan", avg: 3.2, win: 85, med: 2.8, best: 12.4, worst: -5.2 },
      { m: "Feb", avg: 1.5, win: 60, med: 1.2, best: 14.8, worst: -6.1 },
      { m: "Mar", avg: -0.8, win: 40, med: -0.5, best: 8.2, worst: -15.5 },
      { m: "Apr", avg: 0.5, win: 55, med: 0.3, best: 10.5, worst: -11.3 },
      { m: "May", avg: -0.5, win: 45, med: -0.2, best: 7.1, worst: -9.8 },
      { m: "Jun", avg: -1.0, win: 40, med: -0.8, best: 6.2, worst: -10.8 },
      { m: "Jul", avg: 0.8, win: 55, med: 0.6, best: 14.6, worst: -13.2 },
      { m: "Aug", avg: -0.2, win: 50, med: 0.0, best: 8.5, worst: -10.1 },
      { m: "Sep", avg: 0.5, win: 50, med: 0.3, best: 16.2, worst: -18.5 },
      { m: "Oct", avg: -0.8, win: 40, med: -0.5, best: 12.0, worst: -22.8 },
      { m: "Nov", avg: 0.3, win: 50, med: 0.2, best: 8.2, worst: -10.5 },
      { m: "Dec", avg: 0.8, win: 55, med: 0.6, best: 8.9, worst: -7.1 },
    ],
  },
  COPPER: {
    name: "Copper",
    ticker: "HG=F",
    period: "2004\u20132024",
    years: 20,
    monthly: [
      { m: "Jan", avg: 1.5, win: 60, med: 1.2, best: 12.3, worst: -14.1 },
      { m: "Feb", avg: 2.2, win: 65, med: 1.8, best: 16.5, worst: -8.5 },
      { m: "Mar", avg: 0.5, win: 55, med: 0.3, best: 9.2, worst: -15.8 },
      { m: "Apr", avg: 1.8, win: 65, med: 1.5, best: 14.2, worst: -9.3 },
      { m: "May", avg: -1.5, win: 35, med: -1.0, best: 8.5, worst: -11.5 },
      { m: "Jun", avg: -1.2, win: 40, med: -0.8, best: 7.2, worst: -12.3 },
      { m: "Jul", avg: 1.5, win: 60, med: 1.2, best: 10.5, worst: -9.8 },
      { m: "Aug", avg: -0.5, win: 45, med: -0.2, best: 6.4, worst: -12.1 },
      { m: "Sep", avg: -0.8, win: 40, med: -0.5, best: 15.8, worst: -21.2 },
      { m: "Oct", avg: 0.2, win: 50, med: 0.3, best: 12.5, worst: -32.2 },
      { m: "Nov", avg: -0.3, win: 45, med: 0.0, best: 12.2, worst: -15.8 },
      { m: "Dec", avg: 1.0, win: 55, med: 0.8, best: 11.4, worst: -17.5 },
    ],
  },
  OIL: {
    name: "Crude Oil (WTI)",
    ticker: "CL=F",
    period: "2004\u20132024",
    years: 20,
    monthly: [
      { m: "Jan", avg: -1.5, win: 40, med: -0.8, best: 10.5, worst: -16.5 },
      { m: "Feb", avg: 1.8, win: 60, med: 1.5, best: 19.5, worst: -11.0 },
      { m: "Mar", avg: 1.0, win: 55, med: 0.8, best: 10.5, worst: -28.5 },
      { m: "Apr", avg: 1.5, win: 60, med: 1.2, best: 15.2, worst: -8.2 },
      { m: "May", avg: -1.0, win: 40, med: -0.5, best: 11.5, worst: -16.5 },
      { m: "Jun", avg: -0.5, win: 45, med: 0.0, best: 11.1, worst: -18.5 },
      { m: "Jul", avg: 0.3, win: 50, med: 0.2, best: 14.1, worst: -14.5 },
      { m: "Aug", avg: -1.0, win: 40, med: -0.5, best: 7.5, worst: -16.8 },
      { m: "Sep", avg: 0.5, win: 50, med: 0.3, best: 12.8, worst: -12.5 },
      { m: "Oct", avg: -1.5, win: 40, med: -0.8, best: 12.2, worst: -32.6 },
      { m: "Nov", avg: -1.5, win: 40, med: -1.0, best: 12.5, worst: -22.0 },
      { m: "Dec", avg: 0.5, win: 50, med: 0.3, best: 14.8, worst: -16.5 },
    ],
  },
};

// Color helpers
const getReturnColor = (val, opacity = 1) => {
  if (val > 2) return `rgba(0, 180, 80, ${opacity})`;
  if (val > 1) return `rgba(60, 200, 120, ${opacity})`;
  if (val > 0.3) return `rgba(140, 220, 170, ${opacity})`;
  if (val > -0.3) return `rgba(200, 200, 200, ${opacity})`;
  if (val > -1) return `rgba(240, 160, 160, ${opacity})`;
  if (val > -2) return `rgba(220, 100, 100, ${opacity})`;
  return `rgba(200, 50, 50, ${opacity})`;
};

const getWinColor = (val) => {
  if (val >= 70) return "#00b450";
  if (val >= 60) return "#3cc878";
  if (val >= 50) return "#8cdcaa";
  if (val >= 45) return "#c8c8c8";
  if (val >= 35) return "#f0a0a0";
  return "#dc6464";
};

// Sparkline bar component
const MiniBar = ({ values, width = 180, height = 40 }) => {
  const max = Math.max(...values.map(Math.abs), 0.5);
  const barW = (width - 11 * 2) / 12;
  const mid = height / 2;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {values.map((v, i) => {
        const barH = (Math.abs(v) / max) * (mid - 2);
        const y = v >= 0 ? mid - barH : mid;
        return (
          <rect
            key={i}
            x={i * (barW + 2)}
            y={y}
            width={barW}
            height={Math.max(barH, 1)}
            fill={v >= 0 ? "#00b450" : "#dc5050"}
            rx={1}
          />
        );
      })}
      <line x1={0} y1={mid} x2={width} y2={mid} stroke="#666" strokeWidth={0.5} />
    </svg>
  );
};

// Heatmap Cell
const HeatCell = ({ value, type = "return", showValue = true }) => {
  const bg = type === "return" ? getReturnColor(value, 0.8) : getWinColor(value);
  const textColor = Math.abs(value) > 1.5 || value > 65 || value < 40 ? "#fff" : "#222";
  return (
    <td
      style={{
        backgroundColor: bg,
        color: textColor,
        padding: "6px 8px",
        textAlign: "center",
        fontSize: "12px",
        fontWeight: 500,
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        borderRight: "1px solid rgba(255,255,255,0.15)",
        minWidth: "52px",
        transition: "transform 0.1s",
      }}
    >
      {showValue ? (type === "return" ? `${value > 0 ? "+" : ""}${value.toFixed(1)}%` : `${value}%`) : ""}
    </td>
  );
};

// Main Dashboard
export default function SeasonalDashboard() {
  const [selectedAsset, setSelectedAsset] = useState("SPX");
  const [viewMode, setViewMode] = useState("heatmap"); // heatmap, detail, compare
  const [metricType, setMetricType] = useState("avg"); // avg, win, med
  const [compareAssets, setCompareAssets] = useState(["SPX", "DAX", "GOLD"]);

  const asset = SEASONAL_DATA[selectedAsset];

  const cumulativeSeasonal = useMemo(() => {
    if (!asset) return [];
    let cum = 0;
    return asset.monthly.map((m) => {
      cum += m.avg;
      return { ...m, cumulative: cum };
    });
  }, [selectedAsset]);

  const bestMonth = useMemo(() => {
    if (!asset) return null;
    return asset.monthly.reduce((best, m) => (m.avg > best.avg ? m : best), asset.monthly[0]);
  }, [selectedAsset]);

  const worstMonth = useMemo(() => {
    if (!asset) return null;
    return asset.monthly.reduce((worst, m) => (m.avg < worst.avg ? m : worst), asset.monthly[0]);
  }, [selectedAsset]);

  const annualReturn = useMemo(() => {
    if (!asset) return 0;
    return asset.monthly.reduce((sum, m) => sum + m.avg, 0);
  }, [selectedAsset]);

  const toggleCompare = (key) => {
    setCompareAssets((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : prev.length < 5 ? [...prev, key] : prev
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0e17 0%, #111827 50%, #0f172a 100%)",
        color: "#e2e8f0",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(30,58,95,0.8) 0%, rgba(20,35,60,0.6) 100%)",
          borderBottom: "1px solid rgba(100,160,255,0.15)",
          padding: "20px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "32px",
              borderRadius: "4px",
              background: "linear-gradient(180deg, #60a5fa, #3b82f6)",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "#f1f5f9",
            }}
          >
            Seasonal Market Analysis
          </h1>
        </div>
        <p
          style={{
            margin: "0 0 0 22px",
            fontSize: "12px",
            color: "#94a3b8",
            letterSpacing: "0.3px",
          }}
        >
          Historical monthly return patterns &middot; 13 global indices &amp; commodities &middot; Data period: 2000&ndash;2024
        </p>
      </div>

      <div style={{ padding: "20px 28px" }}>
        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
          {[
            { key: "heatmap", label: "Heatmap Overview" },
            { key: "detail", label: "Asset Detail" },
            { key: "compare", label: "Compare Assets" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                border: viewMode === tab.key ? "1px solid #3b82f6" : "1px solid rgba(100,160,255,0.2)",
                background: viewMode === tab.key ? "rgba(59,130,246,0.2)" : "rgba(30,40,60,0.5)",
                color: viewMode === tab.key ? "#93c5fd" : "#94a3b8",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Asset Selector */}
        <div style={{ marginBottom: "20px" }}>
          {Object.entries(CATEGORIES).map(([cat, keys]) => (
            <div key={cat} style={{ marginBottom: "10px" }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  color: "#64748b",
                  marginBottom: "5px",
                }}
              >
                {cat}
              </div>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {keys.map((key) => {
                  const d = SEASONAL_DATA[key];
                  const isSelected = viewMode === "compare" ? compareAssets.includes(key) : selectedAsset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (viewMode === "compare") {
                          toggleCompare(key);
                        } else {
                          setSelectedAsset(key);
                        }
                      }}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "4px",
                        border: isSelected ? "1px solid #3b82f6" : "1px solid rgba(100,160,255,0.12)",
                        background: isSelected ? "rgba(59,130,246,0.15)" : "rgba(20,30,50,0.5)",
                        color: isSelected ? "#93c5fd" : "#94a3b8",
                        fontSize: "11px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                    >
                      {d.name.length > 18 ? key : d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* =================== HEATMAP VIEW =================== */}
        {viewMode === "heatmap" && (
          <div>
            {/* Metric Toggle */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "14px" }}>
              {[
                { key: "avg", label: "Avg Return" },
                { key: "win", label: "Win Rate" },
                { key: "med", label: "Median Return" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetricType(m.key)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "4px",
                    border: metricType === m.key ? "1px solid #f59e0b" : "1px solid rgba(255,200,50,0.15)",
                    background: metricType === m.key ? "rgba(245,158,11,0.15)" : "transparent",
                    color: metricType === m.key ? "#fbbf24" : "#94a3b8",
                    fontSize: "11px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Heatmap Table */}
            <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid rgba(100,160,255,0.12)" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "rgba(15,23,42,0.8)",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "1px solid rgba(100,160,255,0.15)",
                        background: "rgba(15,23,42,0.95)",
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                        minWidth: "140px",
                      }}
                    >
                      Asset
                    </th>
                    {MONTH_NAMES.map((m) => (
                      <th
                        key={m}
                        style={{
                          padding: "10px 6px",
                          textAlign: "center",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#64748b",
                          borderBottom: "1px solid rgba(100,160,255,0.15)",
                          background: "rgba(15,23,42,0.95)",
                        }}
                      >
                        {m}
                      </th>
                    ))}
                    <th
                      style={{
                        padding: "10px 6px",
                        textAlign: "center",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#64748b",
                        borderBottom: "1px solid rgba(100,160,255,0.15)",
                        background: "rgba(15,23,42,0.95)",
                        minWidth: "60px",
                      }}
                    >
                      &Sigma; Year
                    </th>
                    <th
                      style={{
                        padding: "10px 8px",
                        textAlign: "center",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#64748b",
                        borderBottom: "1px solid rgba(100,160,255,0.15)",
                        background: "rgba(15,23,42,0.95)",
                        minWidth: "180px",
                      }}
                    >
                      Pattern
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(SEASONAL_DATA).map(([key, data]) => {
                    const yearSum = data.monthly.reduce((s, m) => s + m.avg, 0);
                    const values = data.monthly.map((m) => m.avg);
                    return (
                      <tr
                        key={key}
                        onClick={() => {
                          setSelectedAsset(key);
                          setViewMode("detail");
                        }}
                        style={{
                          cursor: "pointer",
                          borderBottom: "1px solid rgba(100,160,255,0.06)",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.08)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td
                          style={{
                            padding: "8px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#e2e8f0",
                            position: "sticky",
                            left: 0,
                            background: "rgba(15,23,42,0.95)",
                            zIndex: 1,
                            borderRight: "1px solid rgba(100,160,255,0.1)",
                          }}
                        >
                          <div>{data.name.length > 20 ? key : data.name}</div>
                          <div style={{ fontSize: "9px", color: "#64748b", fontWeight: 400 }}>
                            {data.period}
                          </div>
                        </td>
                        {data.monthly.map((m, i) => (
                          <HeatCell
                            key={i}
                            value={metricType === "avg" ? m.avg : metricType === "win" ? m.win : m.med}
                            type={metricType === "win" ? "win" : "return"}
                          />
                        ))}
                        <td
                          style={{
                            padding: "6px 8px",
                            textAlign: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: yearSum >= 0 ? "#4ade80" : "#f87171",
                          }}
                        >
                          {yearSum > 0 ? "+" : ""}
                          {yearSum.toFixed(1)}%
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <MiniBar values={values} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: "12px",
                padding: "12px 16px",
                background: "rgba(30,40,60,0.4)",
                borderRadius: "6px",
                fontSize: "11px",
                color: "#64748b",
                lineHeight: "1.5",
              }}
            >
              <strong style={{ color: "#94a3b8" }}>Legend:</strong> Green = positive returns / high win rate &middot; Red =
              negative returns / low win rate &middot; Click any row for detailed analysis.
              <br />
              <strong style={{ color: "#94a3b8" }}>Data sources:</strong> Compiled from Barchart, Equity Clock,
              BullionVault, Trade That Swing, academic research (2000&ndash;2024 for indices, 2004&ndash;2024 for commodities).
              <br />
              <strong style={{ color: "#f59e0b" }}>Disclaimer:</strong> Past performance does not guarantee future
              results. Seasonal patterns are statistical tendencies, not predictions.
            </div>
          </div>
        )}

        {/* =================== DETAIL VIEW =================== */}
        {viewMode === "detail" && asset && (
          <div>
            {/* Asset Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#f1f5f9" }}>{asset.name}</h2>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {asset.ticker} &middot; {asset.period} &middot; {asset.years} years of data
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "rgba(0,180,80,0.1)",
                    border: "1px solid rgba(0,180,80,0.2)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Best Month
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#4ade80" }}>
                    {bestMonth?.m} (+{bestMonth?.avg.toFixed(1)}%)
                  </div>
                </div>
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "rgba(220,80,80,0.1)",
                    border: "1px solid rgba(220,80,80,0.2)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Worst Month
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#f87171" }}>
                    {worstMonth?.m} ({worstMonth?.avg.toFixed(1)}%)
                  </div>
                </div>
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Seasonal Annual
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: annualReturn >= 0 ? "#60a5fa" : "#f87171",
                    }}
                  >
                    {annualReturn > 0 ? "+" : ""}
                    {annualReturn.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Bar Chart - Average Returns */}
            <div
              style={{
                background: "rgba(15,23,42,0.6)",
                borderRadius: "8px",
                border: "1px solid rgba(100,160,255,0.1)",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>
                Average Monthly Returns (%)
              </h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "220px" }}>
                {asset.monthly.map((m, i) => {
                  const maxAbs = Math.max(...asset.monthly.map((x) => Math.abs(x.avg)), 0.5);
                  const barHeight = (Math.abs(m.avg) / maxAbs) * 90;
                  const isPositive = m.avg >= 0;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        height: "100%",
                        justifyContent: "flex-end",
                        position: "relative",
                      }}
                    >
                      {/* Value label */}
                      <div
                        style={{
                          position: "absolute",
                          top: isPositive ? `calc(50% - ${barHeight}px - 22px)` : `calc(50% + ${barHeight}px + 4px)`,
                          fontSize: "11px",
                          fontWeight: 600,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: isPositive ? "#4ade80" : "#f87171",
                        }}
                      >
                        {m.avg > 0 ? "+" : ""}
                        {m.avg.toFixed(1)}
                      </div>
                      {/* Upper half (positive) */}
                      <div
                        style={{
                          flex: 1,
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        {isPositive && (
                          <div
                            style={{
                              width: "70%",
                              height: `${barHeight}px`,
                              background: "linear-gradient(180deg, #4ade80 0%, #22c55e 100%)",
                              borderRadius: "4px 4px 0 0",
                              minHeight: m.avg > 0.05 ? "3px" : "1px",
                              boxShadow: "0 0 8px rgba(74,222,128,0.2)",
                            }}
                          />
                        )}
                      </div>
                      {/* Divider */}
                      <div
                        style={{
                          width: "100%",
                          height: "1px",
                          background: "rgba(100,160,255,0.2)",
                        }}
                      />
                      {/* Lower half (negative) */}
                      <div
                        style={{
                          flex: 1,
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          alignItems: "center",
                        }}
                      >
                        {!isPositive && (
                          <div
                            style={{
                              width: "70%",
                              height: `${barHeight}px`,
                              background: "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)",
                              borderRadius: "0 0 4px 4px",
                              minHeight: "3px",
                              boxShadow: "0 0 8px rgba(239,68,68,0.2)",
                            }}
                          />
                        )}
                      </div>
                      {/* Month label */}
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#94a3b8",
                          marginTop: "4px",
                        }}
                      >
                        {m.m}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cumulative Seasonal Pattern */}
            <div
              style={{
                background: "rgba(15,23,42,0.6)",
                borderRadius: "8px",
                border: "1px solid rgba(100,160,255,0.1)",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>
                Cumulative Seasonal Pattern
              </h3>
              <svg width="100%" viewBox="0 0 700 180" style={{ display: "block" }}>
                {/* Grid lines */}
                {[-2, 0, 2, 4, 6, 8, 10].map((v) => {
                  const maxCum = Math.max(...cumulativeSeasonal.map((c) => Math.abs(c.cumulative)), 3);
                  const range = maxCum * 1.3;
                  const y = 90 - (v / range) * 80;
                  if (y < 5 || y > 175) return null;
                  return (
                    <g key={v}>
                      <line x1={40} y1={y} x2={680} y2={y} stroke="rgba(100,160,255,0.1)" strokeWidth={0.5} />
                      <text x={35} y={y + 3} fill="#64748b" fontSize={9} textAnchor="end">
                        {v}%
                      </text>
                    </g>
                  );
                })}
                {/* Area fill */}
                <path
                  d={(() => {
                    const maxCum = Math.max(...cumulativeSeasonal.map((c) => Math.abs(c.cumulative)), 3);
                    const range = maxCum * 1.3;
                    const pts = cumulativeSeasonal.map((c, i) => {
                      const x = 50 + (i / 11) * 620;
                      const y = 90 - (c.cumulative / range) * 80;
                      return `${x},${y}`;
                    });
                    const lastX = 50 + (11 / 11) * 620;
                    const baseY = 90;
                    return `M50,${baseY} L${pts.join(" L")} L${lastX},${baseY} Z`;
                  })()}
                  fill="url(#areaGrad)"
                  opacity={0.3}
                />
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* Line */}
                <polyline
                  points={cumulativeSeasonal
                    .map((c, i) => {
                      const maxCum = Math.max(...cumulativeSeasonal.map((x) => Math.abs(x.cumulative)), 3);
                      const range = maxCum * 1.3;
                      const x = 50 + (i / 11) * 620;
                      const y = 90 - (c.cumulative / range) * 80;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                />
                {/* Dots + labels */}
                {cumulativeSeasonal.map((c, i) => {
                  const maxCum = Math.max(...cumulativeSeasonal.map((x) => Math.abs(x.cumulative)), 3);
                  const range = maxCum * 1.3;
                  const x = 50 + (i / 11) * 620;
                  const y = 90 - (c.cumulative / range) * 80;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r={4} fill="#3b82f6" stroke="#0f172a" strokeWidth={2} />
                      <text x={x} y={170} fill="#94a3b8" fontSize={10} textAnchor="middle" fontWeight={500}>
                        {MONTH_NAMES[i]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Detailed Stats Table */}
            <div
              style={{
                background: "rgba(15,23,42,0.6)",
                borderRadius: "8px",
                border: "1px solid rgba(100,160,255,0.1)",
                padding: "20px",
              }}
            >
              <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>
                Monthly Statistics
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Month", "Avg Return", "Median", "Win Rate", "Best", "Worst", "Range"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 10px",
                            textAlign: h === "Month" ? "left" : "center",
                            fontSize: "10px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            color: "#64748b",
                            borderBottom: "1px solid rgba(100,160,255,0.15)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {asset.monthly.map((m, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid rgba(100,160,255,0.06)",
                        }}
                      >
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: "#e2e8f0", fontSize: "13px" }}>
                          {MONTH_FULL[i]}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            textAlign: "center",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: m.avg >= 0 ? "#4ade80" : "#f87171",
                          }}
                        >
                          {m.avg > 0 ? "+" : ""}
                          {m.avg.toFixed(1)}%
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            textAlign: "center",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "12px",
                            color: m.med >= 0 ? "#86efac" : "#fca5a5",
                          }}
                        >
                          {m.med > 0 ? "+" : ""}
                          {m.med.toFixed(1)}%
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 10px",
                              borderRadius: "10px",
                              fontSize: "11px",
                              fontWeight: 600,
                              fontFamily: "'JetBrains Mono', monospace",
                              background: m.win >= 60 ? "rgba(0,180,80,0.15)" : m.win <= 40 ? "rgba(220,80,80,0.15)" : "rgba(120,120,120,0.15)",
                              color: m.win >= 60 ? "#4ade80" : m.win <= 40 ? "#f87171" : "#94a3b8",
                            }}
                          >
                            {m.win}%
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            textAlign: "center",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "11px",
                            color: "#4ade80",
                          }}
                        >
                          +{m.best.toFixed(1)}%
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            textAlign: "center",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "11px",
                            color: "#f87171",
                          }}
                        >
                          {m.worst.toFixed(1)}%
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "2px",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.abs(m.worst) * 3}px`,
                                height: "8px",
                                background: "rgba(239,68,68,0.4)",
                                borderRadius: "2px 0 0 2px",
                              }}
                            />
                            <div style={{ width: "2px", height: "12px", background: "#64748b" }} />
                            <div
                              style={{
                                width: `${Math.abs(m.best) * 3}px`,
                                height: "8px",
                                background: "rgba(74,222,128,0.4)",
                                borderRadius: "0 2px 2px 0",
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================== COMPARE VIEW =================== */}
        {viewMode === "compare" && (
          <div>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
              Select up to 5 assets above to compare their seasonal patterns side by side.
            </p>

            {/* Compare Chart */}
            <div
              style={{
                background: "rgba(15,23,42,0.6)",
                borderRadius: "8px",
                border: "1px solid rgba(100,160,255,0.1)",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>
                Cumulative Seasonal Comparison
              </h3>
              <svg width="100%" viewBox="0 0 700 200" style={{ display: "block" }}>
                {/* Grid */}
                {[-4, -2, 0, 2, 4, 6, 8, 10, 12].map((v) => {
                  const y = 100 - v * 7;
                  if (y < 5 || y > 195) return null;
                  return (
                    <g key={v}>
                      <line x1={40} y1={y} x2={680} y2={y} stroke="rgba(100,160,255,0.08)" strokeWidth={0.5} />
                      <text x={35} y={y + 3} fill="#64748b" fontSize={9} textAnchor="end">
                        {v}%
                      </text>
                    </g>
                  );
                })}
                {/* Month labels */}
                {MONTH_NAMES.map((m, i) => (
                  <text key={m} x={50 + (i / 11) * 620} y={195} fill="#94a3b8" fontSize={10} textAnchor="middle">
                    {m}
                  </text>
                ))}
                {/* Lines */}
                {(() => {
                  const colors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#a855f7"];
                  return compareAssets.map((key, ci) => {
                    const data = SEASONAL_DATA[key];
                    if (!data) return null;
                    let cum = 0;
                    const points = data.monthly.map((m, i) => {
                      cum += m.avg;
                      const x = 50 + (i / 11) * 620;
                      const y = 100 - cum * 7;
                      return `${x},${y}`;
                    });
                    return (
                      <g key={key}>
                        <polyline
                          points={points.join(" ")}
                          fill="none"
                          stroke={colors[ci % colors.length]}
                          strokeWidth={2}
                          strokeLinejoin="round"
                        />
                        {/* End label */}
                        {(() => {
                          const lastPt = points[points.length - 1].split(",");
                          return (
                            <text
                              x={parseFloat(lastPt[0]) + 5}
                              y={parseFloat(lastPt[1]) + 3}
                              fill={colors[ci % colors.length]}
                              fontSize={10}
                              fontWeight={600}
                            >
                              {data.name.length > 12 ? key : data.name}
                            </text>
                          );
                        })()}
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>

            {/* Side-by-side monthly comparison */}
            <div
              style={{
                background: "rgba(15,23,42,0.6)",
                borderRadius: "8px",
                border: "1px solid rgba(100,160,255,0.1)",
                padding: "20px",
              }}
            >
              <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>
                Monthly Average Return Comparison
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding: "8px 10px",
                          textAlign: "left",
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#64748b",
                          borderBottom: "1px solid rgba(100,160,255,0.15)",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                        }}
                      >
                        Month
                      </th>
                      {compareAssets.map((key) => (
                        <th
                          key={key}
                          style={{
                            padding: "8px 10px",
                            textAlign: "center",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: "#94a3b8",
                            borderBottom: "1px solid rgba(100,160,255,0.15)",
                          }}
                        >
                          {SEASONAL_DATA[key]?.name.length > 15 ? key : SEASONAL_DATA[key]?.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MONTH_FULL.map((month, mi) => (
                      <tr key={mi} style={{ borderBottom: "1px solid rgba(100,160,255,0.06)" }}>
                        <td style={{ padding: "7px 10px", fontWeight: 600, fontSize: "12px", color: "#e2e8f0" }}>
                          {month}
                        </td>
                        {compareAssets.map((key) => {
                          const m = SEASONAL_DATA[key]?.monthly[mi];
                          if (!m) return <td key={key} />;
                          return <HeatCell key={key} value={m.avg} type="return" />;
                        })}
                      </tr>
                    ))}
                    <tr style={{ borderTop: "2px solid rgba(100,160,255,0.2)" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 700, fontSize: "12px", color: "#f1f5f9" }}>
                        Total
                      </td>
                      {compareAssets.map((key) => {
                        const total = SEASONAL_DATA[key]?.monthly.reduce((s, m) => s + m.avg, 0) || 0;
                        return (
                          <td
                            key={key}
                            style={{
                              padding: "8px 10px",
                              textAlign: "center",
                              fontWeight: 700,
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "13px",
                              color: total >= 0 ? "#4ade80" : "#f87171",
                            }}
                          >
                            {total > 0 ? "+" : ""}
                            {total.toFixed(1)}%
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
