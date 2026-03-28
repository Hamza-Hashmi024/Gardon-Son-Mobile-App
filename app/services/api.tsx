export const DEVICE_IP = "http://192.168.4.1";

export const sendDeviceConfig = async (
  ssid: string,
  password: string,
  timezone: string,
) => {
  const url = `${DEVICE_IP}/get?ssid=${encodeURIComponent(ssid)}&password=${encodeURIComponent(password)}&timezone=${timezone}`;
  console.log(url);
  const response = await fetch(url);
  console.log(response);
  const text = await response.text();
  console.log(text);
  return text;
};

// export const getDeviceJson = async () => {
//   const url = `${DEVICE_IP}/json`;
//   const response = await fetch(url);
//   const data = await response.json();
//   return data;
// };

export const getDeviceJson = async () => {
  try {
    const url = `${DEVICE_IP}/json`;
    console.log("Fetching:", url);

    const response = await fetch(url);

    // ❗ detect wrong response type
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
    console.error("❌ getDeviceJson error:", error);
    return {};
  }
};
