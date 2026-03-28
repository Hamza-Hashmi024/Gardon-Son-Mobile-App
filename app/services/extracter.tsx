export const extractSetupInfo = (html: string) => {
  const mac = html.match(/AP MAC Address:<\/strong>\s*([^<]+)/)?.[1];
  const ssid = html.match(/WiFi SSID:<\/strong>\s*([^<]+)/)?.[1];
  const timezone = html.match(/Timezone:<\/strong>\s*([^<]+)/)?.[1];

  return { mac, ssid, timezone };
};
