
import { Platform } from "react-native";
import Constants from "expo-constants";

const API_PORT = 3000;

function normalizeHost(rawHost?: string): string | null {
  if (!rawHost) return null;

  const cleaned = rawHost.replace(/^https?:\/\//, "").split(":")[0];
  return cleaned && cleaned !== "localhost" ? cleaned : null;
}

function resolveHost(): string {
  // Khi chạy trên trình duyệt máy tính
  if (Platform.OS === "web") {
    return "localhost";
  }

  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.hostUri,
    (Constants as any)?.manifest?.debuggerHost,
    (Constants as any)?.manifest2?.extra?.expoGo?.hostUri,
  ];

  for (const candidate of candidates) {
    const host = normalizeHost(candidate);
    if (host) return host;
  }

  // Android Emulator / Expo Go fallback
  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
}

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${resolveHost()}:${API_PORT}`;

console.log("API URL:", API_URL);
