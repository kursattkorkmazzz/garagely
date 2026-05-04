import ct from "countries-and-timezones";

export type TimezoneString = string;

export const getAllTimezones = () => ct.getAllTimezones();

export const getDeviceTimezone = (): TimezoneString =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;
