import { useState, useEffect } from 'react';

/**
 * Month names in English and Hindi abbreviations
 */
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HI = ['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नव', 'दिस'];

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

const FULL_DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const FULL_DAYS_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

/**
 * Format date string: "06 Sep" or "06 Sep 2026"
 */
export const getLiveDateString = (date = new Date(), isHindi = false, includeYear = false) => {
  const d = date instanceof Date ? date : new Date(date);
  const dayNum = String(d.getDate()).padStart(2, '0');
  const monthStr = isHindi ? MONTHS_HI[d.getMonth()] : MONTHS_EN[d.getMonth()];
  const yearStr = d.getFullYear();

  if (includeYear) {
    return `${dayNum} ${monthStr} ${yearStr}`;
  }
  return `${dayNum} ${monthStr}`;
};

/**
 * Format time string: "03:14:22" or "03:14"
 */
export const getLiveTimeString = (date = new Date(), includeSeconds = true) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {})
  });
};

/**
 * Format UTC string: "06 Sep 18:00 UTC"
 */
export const getLiveUtcString = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const dayNum = String(d.getUTCDate()).padStart(2, '0');
  const monthStr = MONTHS_EN[d.getUTCMonth()];
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const mins = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dayNum} ${monthStr} ${hours}:${mins} UTC`;
};

/**
 * Generate 7 consecutive dynamic forecast dates starting from today
 */
export const getDynamicForecastDates = (count = 7, isHindi = false) => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const target = new Date(today);
    target.setDate(today.getDate() + i);

    let dayLabel;
    let dayLabelHindi;

    if (i === 0) {
      dayLabel = 'Today';
      dayLabelHindi = 'आज';
    } else if (i === 1) {
      dayLabel = 'Tomorrow';
      dayLabelHindi = 'कल';
    } else {
      dayLabel = `Day ${i + 1}`;
      dayLabelHindi = `${i + 1} दिन बाद`;
    }

    const weekdayShort = isHindi ? DAYS_HI[target.getDay()] : DAYS_EN[target.getDay()];
    const dateFormatted = getLiveDateString(target, isHindi, false);

    dates.push({
      index: i,
      day: dayLabel,
      dayHindi: dayLabelHindi,
      weekday: weekdayShort,
      date: dateFormatted,
      fullDate: target
    });
  }

  return dates;
};

/**
 * Generate dynamic lead-time timestamp for forecast steps (e.g. +6h, +12h, +24h)
 */
export const getDynamicLeadTimestamp = (leadHours = 0) => {
  const target = new Date(Date.now() + leadHours * 3600 * 1000);
  const dayNum = String(target.getUTCDate()).padStart(2, '0');
  const monthStr = MONTHS_EN[target.getUTCMonth()];
  const hour = String(target.getUTCHours()).padStart(2, '0');
  return `${dayNum} ${monthStr} ${hour}:00 UTC`;
};

/**
 * React hook for high-frequency live clock (updated every intervalMs)
 */
export const useLiveClock = (intervalMs = 1000) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const timer = setInterval(tick, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  const dateStr = getLiveDateString(now, false, true);
  const dateStrHindi = getLiveDateString(now, true, true);
  const dateShort = getLiveDateString(now, false, false);
  const dateShortHindi = getLiveDateString(now, true, false);
  const timeStr = getLiveTimeString(now, true);
  const timeStrNoSec = getLiveTimeString(now, false);
  const utcStr = getLiveUtcString(now);
  const weekday = FULL_DAYS_EN[now.getDay()];
  const weekdayHindi = FULL_DAYS_HI[now.getDay()];
  const weekdayShort = DAYS_EN[now.getDay()];
  const weekdayShortHindi = DAYS_HI[now.getDay()];

  return {
    now,
    dateStr,
    dateStrHindi,
    dateShort,
    dateShortHindi,
    timeStr,
    timeStrNoSec,
    utcStr,
    weekday,
    weekdayHindi,
    weekdayShort,
    weekdayShortHindi,
    fullLiveStr: `${dateShort} • ${timeStr} IST`,
    fullLiveStrHindi: `${dateShortHindi} • ${timeStr} IST`,
    observationStr: `${weekdayShort}, ${dateStr} • ${timeStr} IST`,
    observationStrHindi: `${weekdayShortHindi}, ${dateStrHindi} • ${timeStr} IST`
  };
};
