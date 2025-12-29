/**
 * Translation Generator Script
 * Run this with: node generate-translations.js
 *
 * This will create a /public/translations/ folder with JSON files for each language.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Notes:
 * - `code` must be a language code supported by Google Translate "tl=".
 * - You can add/remove languages freely; the generator will create one JSON per code.
 */
const LANGUAGES = [
 // Core (already had)
 { code: 'en', name: 'English' },
 { code: 'en-US', name: 'English (United States)' },
 { code: 'en-GB', name: 'English (United Kingdom)' },
 { code: 'en-AU', name: 'English (Australia)' },
 { code: 'en-CA', name: 'English (Canada)' },
 { code: 'es', name: 'Español (Spanish)' },
 { code: 'fr', name: 'Français (French)' },
 { code: 'de', name: 'Deutsch (German)' },
 { code: 'it', name: 'Italiano (Italian)' },
 { code: 'pt', name: 'Português (Portuguese)' },
 { code: 'pt-BR', name: 'Português (Brasil)' },
 { code: 'ru', name: 'Русский (Russian)' },
 { code: 'uk', name: 'Українська (Ukrainian)' },
 { code: 'pl', name: 'Polski (Polish)' },
 { code: 'nl', name: 'Nederlands (Dutch)' },
 { code: 'sv', name: 'Svenska (Swedish)' },
 { code: 'da', name: 'Dansk (Danish)' },
 { code: 'fi', name: 'Suomi (Finnish)' },
 { code: 'no', name: 'Norsk (Norwegian)' },

 // Major Asian languages
 { code: 'zh-CN', name: '中文（简体）(Chinese Simplified)' },
 { code: 'zh-TW', name: '中文（繁體）(Chinese Traditional)' },
 { code: 'ja', name: '日本語 (Japanese)' },
 { code: 'ko', name: '한국어 (Korean)' },
 { code: 'vi', name: 'Tiếng Việt (Vietnamese)' },
 { code: 'th', name: 'ไทย (Thai)' },
 { code: 'id', name: 'Bahasa Indonesia' },
 { code: 'ms', name: 'Bahasa Melayu (Malay)' },
 { code: 'tl', name: 'Filipino / Tagalog' },

 // South Asia (very high speaker counts)
 { code: 'hi', name: 'हिन्दी (Hindi)' },
 { code: 'bn', name: 'বাংলা (Bengali)' },
 { code: 'ur', name: 'اردو (Urdu)' },
 { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
 { code: 'mr', name: 'मराठी (Marathi)' },
 { code: 'ta', name: 'தமிழ் (Tamil)' },
 { code: 'te', name: 'తెలుగు (Telugu)' },
 { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
 { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
 { code: 'ml', name: 'മലയാളം (Malayalam)' },
 { code: 'ne', name: 'नेपाली (Nepali)' },
 { code: 'si', name: 'සිංහල (Sinhala)' },

 // Middle East / North Africa
 { code: 'ar', name: 'العربية (Arabic)' },
 { code: 'fa', name: 'فارسی (Persian)' },
 { code: 'he', name: 'עברית (Hebrew)' },
 { code: 'tr', name: 'Türkçe (Turkish)' },

 // Africa (widely used)
 { code: 'sw', name: 'Kiswahili (Swahili)' },
 { code: 'am', name: 'አማርኛ (Amharic)' },
 { code: 'ha', name: 'Hausa' },
 { code: 'yo', name: 'Yorùbá (Yoruba)' },
 { code: 'ig', name: 'Igbo' },
 { code: 'zu', name: 'isiZulu (Zulu)' },
 { code: 'xh', name: 'isiXhosa (Xhosa)' },
 { code: 'so', name: 'Soomaali (Somali)' },
 { code: 'af', name: 'Afrikaans' },

 // Europe (additional)
 { code: 'cs', name: 'Čeština (Czech)' },
 { code: 'sk', name: 'Slovenčina (Slovak)' },
 { code: 'hu', name: 'Magyar (Hungarian)' },
 { code: 'ro', name: 'Română (Romanian)' },
 { code: 'bg', name: 'Български (Bulgarian)' },
 { code: 'el', name: 'Ελληνικά (Greek)' },
 { code: 'sr', name: 'Српски (Serbian)' },
 { code: 'hr', name: 'Hrvatski (Croatian)' },
 { code: 'sl', name: 'Slovenščina (Slovenian)' },
 { code: 'lt', name: 'Lietuvių (Lithuanian)' },
 { code: 'lv', name: 'Latviešu (Latvian)' },
 { code: 'et', name: 'Eesti (Estonian)' },
 { code: 'ca', name: 'Català (Catalan)' },
 { code: 'eu', name: 'Euskara (Basque)' },
 { code: 'gl', name: 'Galego (Galician)' },
 { code: 'cy', name: 'Cymraeg (Welsh)' },
 { code: 'ga', name: 'Gaeilge (Irish)' },
 { code: 'is', name: 'Íslenska (Icelandic)' },

 // Caucasus / Central Asia (includes Mongolian)
 { code: 'ka', name: 'ქართული (Georgian)' },
 { code: 'hy', name: 'Հայերեն (Armenian)' },
 { code: 'az', name: 'Azərbaycan (Azerbaijani)' },
 { code: 'kk', name: 'Қазақша (Kazakh)' },
 { code: 'uz', name: 'Oʻzbek (Uzbek)' },
 { code: 'ky', name: 'Кыргызча (Kyrgyz)' },
 { code: 'tg', name: 'Тоҷикӣ (Tajik)' },
 { code: 'mn', name: 'Монгол (Mongolian)' },

 // Southeast Asia (additional)
 { code: 'my', name: 'မြန်မာ (Burmese)' },
 { code: 'km', name: 'ខ្មែរ (Khmer)' },
 { code: 'lo', name: 'ລາວ (Lao)' },
];

const ORIGINAL_CONTENT = {
 // === COMMON ===
 // Buttons
 continueButton: "Continue",
 backButton: "Back",
 loading: "Loading...",

 // OAuth
 orDivider: "or",

 // Footer/links
 termsOfUse: "Terms of use",
 privacyPolicy: "Privacy Policy",
 help: "Get help",
 copyright: "© 2025 UFOnic LLC. All rights reserved.",

 // Language suggestion banner
 translatePrompt: "Would you like to translate to",
 translateYes: "Yes",
 translateNo: "No",
 searchLanguages: "Search languages...",

 // Placeholders (shared)
 emailPlaceholder: "Enter your email",
 passwordPlaceholder: "Enter your password",

 // Errors (shared)
 enterEmail: "Enter your email!",
 enterPassword: "Enter your password!",
 connectionError: "Having server errors, try again!",
 couldNotVerify: "Could not verify email.",

 // === LOGIN PAGE ===
 // Header
 welcomeBack0: 'Sign in',
 welcomeBack1: 'Welcome back!',

 // Step explanations
 loginStep0Explanation: 'by entering your email first right there in that little box!',
 loginStep1Explanation: 'Now enter your password to continue chatting on uChat.',

 // Buttons
 loginButton: "Login",
 loggingIn: "Logging in...",

 // Small actions
 forgotEmail: "Forgot your email?",
 forgotPassword: "Forgot your password?",

 // OAuth
 continueWithGoogle: "Continue with Google",

 // Footer
 footerLinkSignup: "Create account",

 // Errors (login-specific)
 wrongPassword: "Wrong password. Please try again!",
 emailNotFound: "We could not find an account with this email, try again!",

 // === SIGNUP PAGE ===
 // Header
 pageTitle: 'Create your account',

 // Step titles
 step0Title: "Signing up!",
 step1Title: "Username...",
 step2Title: "Handle time!",
 step3Title: "Password eh?",
 step4Title: "Confirm that!",

 // Step subtitles
 step0Subtitle: "You'll use this to sign in",
 step1Subtitle: "This is how others will see you (3-30 characters)",
 step2Subtitle: "Your unique identifier (3-15 characters)",
 step3Subtitle: "Min 8 characters, 1 uppercase, 1 number",
 step4Subtitle: "Just to make sure",

 // Step explanations
 signupStep0Explanation: "Welcome! Let's get started by entering your email address OR you can sign up with Google for instant access.",
 signupStep1Explanation: "Choose how you want to be known on uChat. This is your display name that others will see. It is like a nickname!",
 signupStep2Explanation: "Your handle is like your identifier - it's completely unique to you and helps others find you. No one can copy your handle!",
 signupStep3Explanation: "Create a strong password to keep your account secure, please make it secure like seriously! 🥺",
 signupStep4Explanation: "Almost there! Confirm your password and agree to our terms to finish creating your account.",

 // Placeholders
 usernamePlaceholder: "Enter your username",
 handlePlaceholder: "Enter your handle",
 confirmPasswordPlaceholder: "Enter your password again",

 // Buttons
 createAccountButton: "Create Account",
 creating: "Creating...",

 // OAuth
 signupWithGoogle: "Sign up with Google",

 // Terms
 agreeToTerms: "I agree to the",
 and: "and",

 // Footer
 alreadyHaveAccount: "Already have an account?",
 signIn: "Sign in!",

 // Errors (signup-specific)
 enterUsername: "Username is required",
 usernameTooShort: "Username must be at least 3 characters",
 usernameTooLong: "Username cannot exceed 30 characters",
 enterHandle: "Handle is required",
 handleTooShort: "Handle must be at least 3 characters",
 handleTooLong: "Handle cannot exceed 15 characters",
 handleInvalid: "Handle can only contain letters, numbers, and underscores",
 handleNoAt: "Don't include \"@\" because it will be added automatically",
 passwordTooShort: "Password must be at least 8 characters",
 passwordNoUppercase: "Password must contain at least one uppercase letter",
 passwordNoNumber: "Password must contain at least one number",
 passwordsNotMatch: "Passwords do not match",
 mustAgreeToTerms: "Please agree to the terms and conditions",
 emailTaken: "This email is already taken. Try again!",
 handleTaken: "This handle is already taken. Try again!",
 unableToVerify: "Unable to verify",
 signupFailed: "Signup failed",

 // Character counter
 charactersCount: "characters",
};

// Utility to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Parse Google Translate response
const parseGoogleTranslate = (data) => {
 if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
 return data[0]
  .map((chunk) => (Array.isArray(chunk) ? (chunk[0] ?? '') : ''))
  .join('');
};

// Translate text using Google Translate API
const translateText = (text, targetLang) => {
 return new Promise((resolve) => {
  if (targetLang === 'en') {
   resolve(text);
   return;
  }

  const url =
   `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  https.get(url, (res) => {
   let data = '';
   res.on('data', (chunk) => (data += chunk));
   res.on('end', () => {
    try {
     const parsed = JSON.parse(data);
     const translated = parseGoogleTranslate(parsed);
     resolve(translated && typeof translated === 'string' ? translated : text);
    } catch (e) {
     console.error(`Error parsing translation for "${text}":`, e.message);
     resolve(text);
    }
   });
  }).on('error', (err) => {
   console.error(`Error translating "${text}":`, err.message);
   resolve(text);
  });
 });
};

// Translate all content for a language
const translateContent = async (langCode) => {
 console.log(`\nTranslating to ${langCode}...`);
 const entries = Object.entries(ORIGINAL_CONTENT);
 const translatedContent = {};

 for (let i = 0; i < entries.length; i++) {
  const [key, value] = entries[i];
  process.stdout.write(`  ${i + 1}/${entries.length} ${key}... `);

  const translated = await translateText(value, langCode);
  translatedContent[key] = translated;

  console.log('✓');

  // Rate limiting: small delay between requests
  await sleep(100);
 }

 return translatedContent;
};

// Main function
const generateTranslations = async () => {
 const outputDir = path.join(__dirname, 'public', 'translations');

 // Create directory if it doesn't exist
 if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
 }

 console.log('Starting translation generation...');
 console.log(`Output directory: ${outputDir}`);
 console.log(`Languages: ${LANGUAGES.length}`);
 console.log(`Total keys: ${Object.keys(ORIGINAL_CONTENT).length}`);

 for (const lang of LANGUAGES) {
  try {
   const content = lang.code === 'en'
    ? ORIGINAL_CONTENT
    : await translateContent(lang.code);

   const outputPath = path.join(outputDir, `${lang.code}.json`);
   fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf8');

   console.log(`✅ Generated: ${lang.code}.json (${lang.name})`);
  } catch (error) {
   console.error(`❌ Failed to generate ${lang.code}:`, error.message);
  }

  // Delay between languages to avoid rate limiting
  await sleep(500);
 }

 console.log('\n✨ Translation generation complete!');
};

// Run the generator
generateTranslations().catch(console.error);