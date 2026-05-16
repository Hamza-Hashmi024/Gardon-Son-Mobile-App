export const DEVICE_IP = "http://192.168.4.1";

const HOSTINGER_BASE_URL = "https://umerdesigns.com/dli/data";
const HOSTINGER_HISTORY_BASE_URL = "https://umerdesigns.com/dli/history";

type StoredDeviceConfig = {
  ssid: string | null;
  timezone: string | null;
};

const extractMacAddress = (html: string) => {
  const match = html.match(/AP MAC Address:<\/strong>\s*([^<]+)/i);
  return match?.[1]?.replace(/:/g, "").trim().toUpperCase() || null;
};
const looksLikeSetupFailure = (responseText: string) => {
  const normalized = responseText.toLowerCase();

  return [
    "error",
    "failed",
    "invalid",
    "wrong",
    "unable",
    "not connected",
    "connection failed",
    "wifi failed",
  ].some((keyword) => normalized.includes(keyword));
};

const looksLikeSetupSuccess = (responseText: string) => {
  const normalized = responseText.toLowerCase();

  return (
    normalized.includes("ap mac address") &&
    normalized.includes("wifi ssid") &&
    normalized.includes("timezone") &&
    (normalized.includes("json file") || normalized.includes("/restart"))
  );
};

const fetchWithTimeout = async (
  input: string,
  init?: RequestInit,
  timeoutMs = 5000,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const extractStoredConfig = (responseText: string): StoredDeviceConfig => {
  const cleanHtml = responseText.replace(/\n/g, "").replace(/\s+/g, " ");

  const getValue = (label: string) => {
    const regex = new RegExp(`${label}:<\\/strong>\\s*([^<]+)`, "i");
    return cleanHtml.match(regex)?.[1]?.trim() || null;
  };

  return {
    ssid: getValue("WiFi SSID"),
    timezone: getValue("Timezone"),
  };
};

export const checkDeviceConnection = async () => {
  try {
    await fetchWithTimeout(`${DEVICE_IP}/`, undefined, 3000);
    return true;
  } catch {
    return false;
  }
};

export const sendDeviceConfig = async (
  ssid: string,
  password: string,
  timezone: string,
) => {
  const cleanSsid = ssid;
  const cleanPassword = password;
  const cleanTimezone = timezone;

  if (!cleanSsid || !cleanPassword || !cleanTimezone) {
    throw new Error("SSID, password, and timezone are required.");
  }

  const encodeForDevice = (value: string) =>
    encodeURIComponent(value).replace(/%20/g, "+");

  const url = `${DEVICE_IP}/get?ssid=${encodeForDevice(cleanSsid)}&password=${encodeForDevice(cleanPassword)}&timezone=${encodeForDevice(cleanTimezone)}`;
  const response = await fetchWithTimeout(url);
  const text = await response.text();

  if (!response.ok) {
    throw new Error("Device rejected the configuration request.");
  }

  if (looksLikeSetupFailure(text) || !looksLikeSetupSuccess(text)) {
    throw new Error(
      "Device setup failed. Please check the Wi-Fi name and password, then try again.",
    );
  }

  const storedConfig = extractStoredConfig(text);

  if (
    storedConfig.ssid?.trim() !== cleanSsid.trim() ||
    storedConfig.timezone?.trim() !== cleanTimezone.trim()
  ) {
    throw new Error(
      "The Garden Sun device did not confirm the saved SSID and timezone.",
    );
  }

  const mac = extractMacAddress(text);

  if (!mac) {
    throw new Error("MAC address not found in device response");
  }
  return {
    responseText: text,
    storedConfig,
    mac,
  };
};

export const getDeviceJson = async () => {
  try {
    const url = `${DEVICE_IP}/json`;

    const response = await fetchWithTimeout(url);

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      throw new Error("Invalid JSON response");
    }

    const data = await response.json();

    return data;
  } catch {
    return {};
  }
};

export const getHostingerDeviceData = async (mac: string) => {
  if (!mac) {
    throw new Error("MAC is required");
  }

  const url = `${HOSTINGER_BASE_URL}/${mac}.json`;

  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetchWithTimeout(url);

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch {}

    await new Promise((r) => setTimeout(r, 2000)); // wait 2s
  }

  throw new Error("Hostinger file not ready after retries");
};

export const getHostingerDeviceHistory = async (mac: string) => {
  if (!mac) {
    throw new Error("MAC is required");
  }

  const url = `${HOSTINGER_HISTORY_BASE_URL}/${mac}.json`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error("Hostinger history file not ready");
  }

  return response.json();
};
