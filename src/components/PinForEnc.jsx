import { createPortal } from "react-dom";
import { useState } from "react";
import styles from "./PinForEnc.module.css";

const PinForEnc = ({ mode, onSubmit, onClose }) => {
 const [pin, setPin] = useState("");
 const [confirmPin, setConfirmPin] = useState("");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState("");

 const isSetup = mode === "setup";

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!pin || pin.length !== 6) {
   setError("PIN must be 6 digits");
   return;
  }

  if (!/^\d+$/.test(pin)) {
   setError("PIN must contain only numbers");
   return;
  }

  if (isSetup && pin !== confirmPin) {
   setError("PINs don't match");
   return;
  }

  setLoading(true);
  try {
   await onSubmit(pin);
  } catch (err) {
   setError(err.message || "Invalid PIN");
   setLoading(false);
  }
 };

 const handleKeypadPress = (key) => {
  if (key === "backspace") {
   setPin((prev) => prev.slice(0, -1));
  } else if (key === "enter") {
   if (!loading && pin.length === 6) {
    handleSubmit(new Event("submit"));
   }
  } else if (pin.length < 6) {
   setPin((prev) => prev + key.toString());
  }
 };

 return createPortal(
  <div className={styles.pinModalOverlay} onClick={onClose}>
   <div
    className={styles.pinModalContent}
    onClick={(e) => e.stopPropagation()}
   >
    <h3>
     <i className={isSetup ? "fas fa-shield-alt" : "fas fa-lock"}></i>
     {isSetup ? "Secure Your Messages" : "Enter Your PIN"}
    </h3>

    <p>
     {isSetup
      ? "Create a 6-digit PIN to encrypt your messages. This PIN protects your private keys."
      : "Enter your 6-digit PIN to decrypt your messages."}
    </p>

    {isSetup && (
     <div className={styles.pinWarningBox}>
      <p>Important Security Information</p>
      <ul>
       <li>Your PIN encrypts your private encryption keys</li>
       <li>WITHOUT THIS PIN, YOU CANNOT ACCESS YOUR OLD MESSAGES!!</li>
       <li>WE WILL NOT BE ABLE TO RECOVER YOUR PIN IF YOU LOSE IT!!</li>
       <li>REMEMBER TO NEVER FORGET THIS PIN OR SAY GOODBYE TO YOUR OLD MESSAGES</li>
       <li>
        Learn more about it{" "}
        <a
         href="/help-center"
         target="_blank"
         rel="noopener noreferrer"
         className={styles.learnMoreThing1}
        >
         here
        </a>
       </li>
       <li>
        If this is DARIYA, PLEASE CLICK{" "}
        <a
         href="/welp"
         target="_blank"
         rel="noopener noreferrer"
         className={styles.learnMoreThing1}
        >
         HERE
        </a>
       </li>
      </ul>
     </div>
    )}

    <form onSubmit={handleSubmit} className={styles.pinForm}>
     <div className={styles.pinInputGroup}>
      <label>
       {isSetup ? "Create PIN" : "Enter PIN"}{" "}
       <span className={styles.required}>*</span>
      </label>
      <input
       type="password"
       inputMode="numeric"
       pattern="\d*"
       maxLength="6"
       value={pin}
       onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
       placeholder="••••••"
       className={styles.pinInput}
       autoFocus
       disabled={loading}
      />
     </div>

     {/* On-screen keypad */}
     <div className={styles.pinPad}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
       <button
        type="button"
        key={num}
        className={styles.pinPadKey}
        onClick={() => handleKeypadPress(num)}
        disabled={loading}
       >
        {num}
       </button>
      ))}
      <button
       type="button"
       className={`${styles.pinPadKey} ${styles.backspaceKey}`}
       onClick={() => handleKeypadPress("backspace")}
       disabled={loading}
      >
       <i className="fas fa-backspace"></i>
      </button>
      <button
       type="button"
       className={styles.pinPadKey}
       onClick={() => handleKeypadPress(0)}
       disabled={loading}
      >
       0
      </button>
      <button
       type="button"
       className={`${styles.pinPadKey} ${styles.enterKey}`}
       onClick={() => handleKeypadPress("enter")}
       disabled={loading || pin.length !== 6}
      >
       <i className="fas fa-check"></i>
      </button>
     </div>

     {isSetup && (
      <div className={styles.pinInputGroup}>
       <label>
        Confirm PIN <span className={styles.required}>*</span>
       </label>
       <input
        type="password"
        inputMode="numeric"
        pattern="\d*"
        maxLength="6"
        value={confirmPin}
        onChange={(e) =>
         setConfirmPin(e.target.value.replace(/\D/g, ""))
        }
        placeholder="••••••"
        className={styles.pinInput}
        disabled={loading}
       />
      </div>
     )}

     {error && <div className={styles.pinError}>{error}</div>}

     <p className={styles.pinInfo}>
      {isSetup
       ? "This PIN will be required every time you log in to decrypt your messages."
       : "Your messages are encrypted and require your PIN to decrypt."}
     </p>

     <div className={styles.modalActions}>
      {!isSetup && (
       <button
        type="button"
        className={styles.modalCancel}
        onClick={onClose}
        disabled={loading}
       >
        Cancel
       </button>
      )}
      <button
       type="submit"
       className={styles.modalSubmit}
       disabled={
        loading ||
        pin.length !== 6 ||
        (isSetup && confirmPin.length !== 6)
       }
      >
       {loading ? (
        <>
         <i className="fas fa-spinner fa-spin"></i> Processing...
        </>
       ) : isSetup ? (
        <>
         <i className="fas fa-check-circle"></i> Create PIN
        </>
       ) : (
        <>
         <i className="fas fa-unlock"></i> Unlock
        </>
       )}
      </button>
     </div>
    </form>
   </div>
  </div>,
  document.body
 );
};

export default PinForEnc;