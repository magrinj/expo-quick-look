import { Platform } from "react-native";

const isIOS = Platform.OS === "ios";

// Test server for authenticated file downloads
// iOS simulator uses the host machine's IP, Android emulator uses 10.0.2.2
export const TEST_SERVER = isIOS
  ? "http://localhost:3333"
  : "http://10.0.2.2:3333";

export const AUTH_TOKEN = "Bearer test-secret-token";

// Public remote file URLs for demo
export const REMOTE_PDF_URL = "https://pdfobject.com/pdf/sample-3pp.pdf";
export const REMOTE_IMAGE_URL = "https://picsum.photos/id/10/400/300.jpg";
