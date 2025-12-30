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
 // Buttons (use nouns or simple imperatives)
 continueButton: "Continue",
 backButton: "Back",
 loading: "Loading",

 // OAuth (noun phrases, not verb commands)
 orDivider: "or",

 // Footer/links (nouns only)
 termsOfUse: "Terms of use",
 privacyPolicy: "Privacy Policy",
 help: "Get help",
 copyright: "© 2025 UFOnic LLC. All rights reserved.",

 // Language suggestion banner
 translatePrompt: "Would you like to translate to",
 translateYes: "Yes",
 translateNo: "No",
 searchLanguages: "Search languages",

 // Placeholders (direct, simple)
 emailPlaceholder: "Your email address",
 passwordPlaceholder: "Your password",

 // Errors (short, declarative)
 enterEmail: "Email is required",
 enterPassword: "Password is required",
 connectionError: "Server error. Please try again.",
 couldNotVerify: "Email verification failed",

 // === LOGIN PAGE ===
 // Header (keep separate)
 welcomeBack0: 'Sign in',
 welcomeBack1: 'Welcome back',

 // Step explanations (short standalone sentences)
 loginStep0Explanation: 'Enter your email address to begin.',
 loginStep1Explanation: 'Enter your password to access your account.',

 // Buttons (nouns)
 loginButton: "Sign in",
 loggingIn: "Signing in",

 // Small actions (questions or nouns)
 forgotEmail: "Forgot your email?",
 forgotPassword: "Forgot your password?",

 // OAuth (noun phrase - "with Google" is modifier)
 continueWithGoogle: "Google sign in",

 // Footer
 footerLinkSignup: "Create account",

 // Errors (short, direct)
 wrongPassword: "Incorrect password",
 emailNotFound: "Email not found",

 // === SIGNUP PAGE ===
 // Header
 pageTitle: 'Create your account',

 // Step titles (nouns or short phrases)
 step0Title: "Email address",
 step1Title: "Display name",
 step2Title: "Username tag",
 step3Title: "Password",
 step4Title: "Confirm password",

 // Step subtitles (descriptive, no verbs)
 step0Subtitle: "Used for signing in",
 step1Subtitle: "How others see you (3-30 characters)",
 step2Subtitle: "Your unique @tag (3-15 characters)",
 step3Subtitle: "Minimum 8 characters, 1 uppercase, 1 number",
 step4Subtitle: "Enter your password again",

 // Step explanations (separate simple sentences, no conjunctions)
 signupStep0Explanation: "Enter your email address to create your account. You can also use Google sign in for faster access.",
 signupStep1Explanation: "Choose your display name. This is how other users will see you on uChat.",
 signupStep2Explanation: "Your username tag starts with @ symbol. This unique identifier helps others find you. No other user can have the same tag.",
 signupStep3Explanation: "Create a strong password to protect your account.",
 signupStep4Explanation: "Confirm your password and accept the terms to complete signup.",

 // Placeholders (simple nouns)
 usernamePlaceholder: "Your display name",
 handlePlaceholder: "Your username tag",
 confirmPasswordPlaceholder: "Confirm your password",

 // Buttons (nouns)
 createAccountButton: "Create account",
 creating: "Creating account",

 // OAuth (noun phrase)
 signupWithGoogle: "Google sign up",

 // Terms (keep separate)
 agreeToTerms: "I agree to the",
 and: "and",

 // Footer (nouns)
 alreadyHaveAccount: "Already have an account?",
 signIn: "Sign in",

 // Errors (short declarative)
 enterUsername: "Display name is required",
 usernameTooShort: "Display name must be at least 3 characters",
 usernameTooLong: "Display name cannot exceed 30 characters",
 enterHandle: "Username tag is required",
 handleTooShort: "Username tag must be at least 3 characters",
 handleTooLong: "Username tag cannot exceed 15 characters",
 handleInvalid: "Username tag can only contain letters, numbers, and underscores",
 handleNoAt: "Do not include @ symbol. It will be added automatically.",
 passwordTooShort: "Password must be at least 8 characters",
 passwordNoUppercase: "Password must contain at least one uppercase letter",
 passwordNoNumber: "Password must contain at least one number",
 passwordsNotMatch: "Passwords do not match",
 mustAgreeToTerms: "You must accept the terms and conditions",
 emailTaken: "This email is already registered",
 handleTaken: "This username tag is already taken",
 unableToVerify: "Verification failed",
 signupFailed: "Account creation failed",

 // Character counter (noun)
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