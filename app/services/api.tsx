export const DEVICE_IP = "http://192.168.4.1";

export const sendDeviceConfig = async ({ ssid, password, timezone }) => {
  const url = `${DEVICE_IP}/get?ssid=${encodeURIComponent(ssid)}&password=${encodeURIComponent(password)}&timezone=${timezone}`;
  console.log(url);
  const response = await fetch(url);
  console.log(response);
  const text = await response.text();
  console.log(text);
  return text;
};

export const getDeviceJson = async () => {
  const url = `${DEVICE_IP}/json`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};
