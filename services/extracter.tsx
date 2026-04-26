export const extractSetupInfo = (html: string) => {
  if (!html) return null;

  const cleanHtml = html.replace(/\n/g, "").replace(/\s+/g, " ");

  const getValue = (label: string) => {
    const regex = new RegExp(`${label}:<\\/strong>\\s*([^<]+)`, "i");
    return cleanHtml.match(regex)?.[1]?.trim() || null;
  };

  const ssid = getValue("WiFi SSID");
  const timezone = getValue("Timezone");
  const jsonPath = getValue("JSON File");
  const restartPath = cleanHtml.includes("/restart") ? "/restart" : null;
  const mac = jsonPath?.replace("/", "").replace(".json", "").trim() || null;

  return { mac, ssid, timezone, jsonPath, restartPath };
};
