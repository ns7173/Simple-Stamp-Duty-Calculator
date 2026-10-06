# 🚀 GitHub Actions Workflow Guide (Android APK, Windows EXE & Web App)

यह प्रोजेक्ट GitHub Actions के माध्यम से **Android APK**, **Windows Desktop EXE**, और **Web App** को ऑटोमैटिक बिल्ड करने के लिए पूरी तरह कॉन्फ़िगर हो चुका है।

---

## 📁 वर्कफ़्लो फ़ाइलें (Workflows Configured)

| प्लेटफ़ॉर्म | वर्कफ़्लो फ़ाइल | आउटपुट फ़ाइल | विवरण |
| :--- | :--- | :--- | :--- |
| **Android APK** | `.github/workflows/main.yml` | `app-debug.apk` | Capacitor + Android Gradle (Node 22 + Java 17) |
| **Windows Desktop EXE** | `.github/workflows/mainexe.yml` | `.exe` (Installer & Portable) | Electron + electron-builder |
| **Web App** | `.github/workflows/web.yml` | `dist/` (Production Web Build) | Vite Production Build (HTML, CSS, JS) |

---

## 🛠️ GitHub Actions का उपयोग कैसे करें?

### 1. स्वचालित बिल्ड (Automatic Trigger):
- जब भी आप अपने कोड को `main` या `master` ब्रांच में **Git Push** करेंगे, तो GitHub Actions अपने-आप तीनों ऐप्स का निर्माण (Build) शुरू कर देगा।

### 2. मैन्युअल बिल्ड (Manual Trigger - Run Workflow):
1. अपने GitHub रिपॉजिटरी में जाएं।
2. ऊपर **Actions** टैब पर क्लिक करें।
3. बायीं तरफ दिए गए वर्कफ़्लो में से किसी एक को चुनें:
   - **Build Android APK**
   - **Build Windows EXE**
   - **Build Web App**
4. **Run workflow** बटन पर क्लिक करें।

---

## 📥 डाउनलोड करने का तरीका (Artifacts Download)
1. जब वर्कफ़्लो का रन पूरा हो जाए (ग्रीन चेकमार्क ✅ आए), तो उस रन पर क्लिक करें।
2. नीचे **Artifacts** सेक्शन में जाएं।
3. वहां आपको तैयार फ़ाइलें डाउनलोड के लिए मिलेंगी:
   - `stamp-duty-calculator-android-apk` (Android APK)
   - `stamp-duty-calculator-windows-exe` (Windows EXE)
   - `stamp-duty-calculator-web-build` (Web App Zip)
