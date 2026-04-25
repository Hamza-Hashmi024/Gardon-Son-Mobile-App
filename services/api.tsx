export const DEVICE_IP = "http://192.168.4.1";

type StoredDeviceConfig = {
  ssid: string | null;
  timezone: string | null;
};

const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === "AbortError";

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
  } catch (error) {
    if (!isAbortError(error)) {
      console.error("checkDeviceConnection error:", error);
    }
    return false;
  }
};

export const sendDeviceConfig = async (
  ssid: string,
  password: string,
  timezone: string,
) => {
  const cleanSsid = ssid.trim();
  const cleanPassword = password.trim();
  const cleanTimezone = timezone.trim();

  if (!cleanSsid || !cleanPassword || !cleanTimezone) {
    throw new Error("SSID, password, and timezone are required.");
  }

  const params = new URLSearchParams({
    ssid: cleanSsid,
    password: cleanPassword,
    timezone: cleanTimezone,
  });
  const url = `${DEVICE_IP}/get?${params.toString()}`;
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
    storedConfig.ssid !== cleanSsid ||
    storedConfig.timezone !== cleanTimezone
  ) {
    throw new Error(
      "The Garden Sun device did not confirm the saved SSID and timezone.",
    );
  }

  return {
    responseText: text,
    storedConfig,
  };
};

export const getDeviceJson = async () => {
  try {
    const url = `${DEVICE_IP}/json`;
    console.log("Fetching:", url);

    const response = await fetchWithTimeout(url);

    const contentType = response.headers.get("content-type");
    console.log("Content-Type:", contentType);

    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.log("⚠️ Not JSON response:", text);
      throw new Error("Invalid JSON response");
    }

    const data = await response.json();
    console.log("✅ Parsed JSON:", data);

    return data;
  } catch (error) {
    if (!isAbortError(error)) {
      console.error("getDeviceJson error:", error);
    }
    return {};
  }
};
