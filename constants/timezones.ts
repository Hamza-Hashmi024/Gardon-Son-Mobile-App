export type TimezoneOption = {
  value: string;
  label: string;
};

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  {
    value: "-12",
    label: "(UTC-12:00) International Date Line West",
  },
  { value: "-11", label: "(UTC-11:00) Midway Island, Samoa" },
  { value: "-10", label: "(UTC-10:00) Hawaii" },
  { value: "-9", label: "(UTC-09:00) Alaska" },
  { value: "-8", label: "(UTC-08:00) Pacific Time (US & Canada)" },
  { value: "-7", label: "(UTC-07:00) Mountain Time (US & Canada)" },
  { value: "-6", label: "(UTC-06:00) Central Time (US & Canada)" },
  { value: "-5", label: "(UTC-05:00) Eastern Time (US & Canada)" },
  { value: "-4", label: "(UTC-04:00) Atlantic Time (Canada)" },
  { value: "-3.5", label: "(UTC-03:30) Newfoundland" },
  { value: "-3", label: "(UTC-03:00) Brasilia, Buenos Aires" },
  { value: "-2", label: "(UTC-02:00) Mid-Atlantic" },
  { value: "-1", label: "(UTC-01:00) Azores, Cape Verde Islands" },
  { value: "0", label: "(UTC) Greenwich Mean Time, London" },
  { value: "1", label: "(UTC+01:00) Berlin, Rome, Paris" },
  { value: "2", label: "(UTC+02:00) Athens, Istanbul, Cairo" },
  { value: "3", label: "(UTC+03:00) Moscow, Kuwait, Nairobi" },
  { value: "3.5", label: "(UTC+03:30) Tehran" },
  { value: "4", label: "(UTC+04:00) Abu Dhabi, Dubai, Baku" },
  { value: "4.5", label: "(UTC+04:30) Kabul" },
  { value: "5", label: "(UTC+05:00) Islamabad, Karachi, Tashkent" },
  { value: "5.5", label: "(UTC+05:30) Mumbai, Kolkata, New Delhi" },
  { value: "5.75", label: "(UTC+05:45) Kathmandu" },
  { value: "6", label: "(UTC+06:00) Astana, Dhaka" },
  { value: "6.5", label: "(UTC+06:30) Yangon (Rangoon)" },
  { value: "7", label: "(UTC+07:00) Bangkok, Hanoi, Jakarta" },
  { value: "8", label: "(UTC+08:00) Beijing, Singapore, Hong Kong" },
  { value: "9", label: "(UTC+09:00) Tokyo, Seoul" },
  { value: "9.5", label: "(UTC+09:30) Adelaide, Darwin" },
  { value: "10", label: "(UTC+10:00) Sydney, Melbourne, Guam" },
  { value: "11", label: "(UTC+11:00) Magadan, Solomon Islands" },
  { value: "12", label: "(UTC+12:00) Fiji, Marshall Islands" },
  { value: "13", label: "(UTC+13:00) Nuku'alofa, Samoa" },
];

export const getTimezoneLabel = (value?: string | null) => {
  const normalizedValue = value?.trim();
  if (!normalizedValue) return "-";

  return (
    TIMEZONE_OPTIONS.find((option) => option.value === normalizedValue)?.label ??
    normalizedValue
  );
};
