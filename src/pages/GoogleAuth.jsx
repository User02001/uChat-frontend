import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as stylex from "@stylexjs/stylex";
import { GoogleAuthStyles } from "../styles/google_auth";
import { API_BASE_URL } from "../config";
import Icon from "../components/Icon";
import useStars from "../hooks/useStars";

const GoogleAuth = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const canvasRef = useStars();

 const [currentStep, setCurrentStep] = useState(0);
 const [formData, setFormData] = useState({
  username: "",
  handle: "",
 });
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 const [userInfo, setUserInfo] = useState(null);
 const [direction, setDirection] = useState("forward");
 const [isTransitioning, setIsTransitioning] = useState(false);
 const [prevStep, setPrevStep] = useState(0);
 const [validationError, setValidationError] = useState("");

 const ids = useMemo(() => {
  return {
   pageTitle: "google-auth-page-title",
   form: "google-auth-form",
   progress: "google-auth-progress",
   stepTitle: (i) => `google-auth-step-${i}-title`,
   stepSubtitle: (i) => `google-auth-step-${i}-subtitle`,
   stepExplain: (i) => `google-auth-step-${i}-explain`,
   stepError: (i) => `google-auth-step-${i}-error`,
   field: {
    username: "google-auth-username",
    handle: "google-auth-handle",
   },
   counter: {
    username: "google-auth-username-counter",
    handle: "google-auth-handle-counter",
   },
  };
 }, []);

 useEffect(() => {
  document.title = "uChat - Complete Google Setup";

  const favicon =
   document.querySelector("link[rel*='icon']") || document.createElement("link");
  favicon.type = "image/png";
  favicon.rel = "icon";
  favicon.href = "/resources/favicons/sign_up.png";
  document.getElementsByTagName("head")[0].appendChild(favicon);

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleThemeChange = (e) => {
   document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
  };

  mediaQuery.addEventListener("change", handleThemeChange);
  return () => mediaQuery.removeEventListener("change", handleThemeChange);
 }, []);

 useEffect(() => {
  const timeoutId = setTimeout(() => {
   if (isTransitioning) return;
   setValidationError("");
  }, 300);

  return () => clearTimeout(timeoutId);
 }, [currentStep, formData, isTransitioning]);

 useEffect(() => {
  const checkSession = async () => {
   try {
    const response = await fetch(`${API_BASE_URL}/api/check-google-setup`, {
     credentials: 'include'
    });

    const data = await response.json();

    if (!data.needs_setup) {
     navigate('/login');
     return;
    }

    const urlParams = new URLSearchParams(location.search);
    const urlEmail = urlParams.get("email");
    const urlName = urlParams.get("name");

    if (data.email !== urlEmail || data.name !== urlName) {
     console.warn('URL params mismatch - redirecting to correct URL');
     navigate(`/google_setup?email=${data.email}&name=${data.name}&setup=true`, { replace: true });
     return;
    }

    setUserInfo({ email: data.email, name: data.name });
    setFormData(prev => ({ ...prev, username: data.name }));

   } catch (error) {
    console.error('Session check failed:', error);
    navigate('/login');
   }
  };

  checkSession();
 }, [location, navigate]);

 const handleInputChange = (e) => {
  const { name, value } = e.target;

  if (name === "handle" && value.includes("@")) {
   setValidationError('Don\'t include "@" because it will be added automatically.');
   return;
  }

  let finalValue = value;
  if (name === "username" && value.length > 30) {
   finalValue = value.slice(0, 30);
  }
  if (name === "handle" && value.length > 15) {
   finalValue = value.slice(0, 15);
  }

  setFormData((prev) => ({
   ...prev,
   [name]: finalValue,
  }));

  if (error) setError("");
 };

 const validateCurrentStepClientSide = () => {
  switch (currentStep) {
   case 0:
    if (!formData.username.trim()) {
     setValidationError("Username is required");
     return false;
    }
    if (formData.username.length < 3) {
     setValidationError("Username must be at least 3 characters");
     return false;
    }
    if (formData.username.length > 30) {
     setValidationError("Username cannot exceed 30 characters");
     return false;
    }
    break;
   case 1:
    if (!formData.handle.trim()) {
     setValidationError("Handle is required");
     return false;
    }
    {
     const handle = formData.handle.startsWith("@")
      ? formData.handle.slice(1)
      : formData.handle;
     if (handle.length < 3) {
      setValidationError("Handle must be at least 3 characters");
      return false;
     }
     if (handle.length > 15) {
      setValidationError("Handle cannot exceed 15 characters");
      return false;
     }
     if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      setValidationError("Handle can only contain letters, numbers, and underscores");
      return false;
     }
    }
    break;
   default:
    break;
  }
  return true;
 };

 const checkStepWithBackend = async () => {
  if (currentStep === 1) {
   setLoading(true);
   try {
    const handle = formData.handle.startsWith("@")
     ? formData.handle.slice(1)
     : formData.handle;
    const response = await fetch(`${API_BASE_URL}/api/check-handle-availability`, {
     method: "POST",
     headers: {
      "Content-Type": "application/json",
     },
     credentials: "include",
     body: JSON.stringify({
      handle: handle,
     }),
    });

    const data = await response.json();

    if (!response.ok) {
     setError("Could not verify handle!");
     setLoading(false);
     return false;
    }

    if (!data.available) {
     setError("This handle is already taken. Try again!");
     setLoading(false);
     return false;
    }

    setLoading(false);
    return true;
   } catch (err) {
    console.error("Handle check error:", err);
    setError("Connection error");
    setLoading(false);
    return false;
   }
  }

  return true;
 };

 const handleContinue = async () => {
  if (!validateCurrentStepClientSide()) return;

  setError("");
  setValidationError("");

  if (currentStep === 1) {
   const backendValid = await checkStepWithBackend();
   if (!backendValid) return;
  }

  if (currentStep < 1) {
   setIsTransitioning(true);
   setDirection("forward");
   setPrevStep(currentStep);
   setTimeout(() => {
    setCurrentStep(currentStep + 1);
    setTimeout(() => setIsTransitioning(false), 50);
   }, 300);
  } else {
   handleSubmit();
  }
 };

 const handleBack = () => {
  setError("");
  setValidationError("");
  setIsTransitioning(true);
  setDirection("backward");
  setPrevStep(currentStep);
  setTimeout(() => {
   setCurrentStep(currentStep - 1);
   setTimeout(() => setIsTransitioning(false), 50);
  }, 300);
 };

 const handleSubmit = async () => {
  setLoading(true);
  setError("");
  setValidationError("");

  const handle = formData.handle.startsWith("@")
   ? formData.handle.slice(1)
   : formData.handle;

  try {
   const response = await fetch(`${API_BASE_URL}/api/complete-google-setup`, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
     username: formData.username.trim(),
     handle: handle,
    }),
   });

   const data = await response.json();

   if (response.ok) {
    navigate("/chat");
   } else {
    setError(data.error || "Setup failed");
   }
  } catch (error) {
   console.error("Setup error:", error);
   setError("Network error. Please try again.");
  } finally {
   setLoading(false);
  }
 };

 const handleFormSubmit = (e) => {
  e.preventDefault();
  handleContinue();
 };

 const getStepStyleList = (stepIndex) => {
  if (stepIndex === currentStep && !isTransitioning) {
   return [GoogleAuthStyles.stepContainer, GoogleAuthStyles.stepContainerActive];
  }

  if (stepIndex === prevStep && isTransitioning) {
   return [
    GoogleAuthStyles.stepContainer,
    GoogleAuthStyles.stepContainerActive,
    direction === "forward"
     ? GoogleAuthStyles.slidingOutLeft
     : GoogleAuthStyles.slidingOutRight,
   ];
  }

  if (stepIndex === currentStep && isTransitioning) {
   return [
    GoogleAuthStyles.stepContainer,
    direction === "forward"
     ? GoogleAuthStyles.comingFromRight
     : GoogleAuthStyles.comingFromLeft,
   ];
  }

  return [GoogleAuthStyles.stepContainer];
 };

 const stepHeaderSpacingStyle = (stepIndex) => {
  return stepIndex === 0
   ? GoogleAuthStyles.step0_stepHeader
   : GoogleAuthStyles.step1_stepHeader;
 };

 const inputGroupSpacingStyle = (stepIndex) => {
  return stepIndex === 0
   ? GoogleAuthStyles.step0_inputGroup
   : GoogleAuthStyles.step1_inputGroup;
 };

 const progressSpacingStyle = (stepIndex) => {
  return stepIndex === 0
   ? GoogleAuthStyles.step0_progress
   : GoogleAuthStyles.step1_progress;
 };

 const steps = [
  {
   title: "What's your username?",
   subtitle: "This is how others will see you (3-30 characters)",
   field: "username",
   type: "text",
   placeholder: "Enter your username",
   icon: "fas fa-user",
  },
  {
   title: "Choose a handle",
   subtitle: "Your unique identifier (3-15 characters, letters, numbers, underscore)",
   field: "handle",
   type: "text",
   placeholder: "Enter your handle",
   icon: "fas fa-hashtag",
  },
 ];

 const getActiveErrorText = () => error || validationError;

 const activeErrorId = ids.stepError(currentStep);
 const activeSubtitleId = ids.stepSubtitle(currentStep);
 const activeExplainId = ids.stepExplain(currentStep);

 const buildDescribedBy = (parts) => parts.filter(Boolean).join(" ") || undefined;

 if (!userInfo) {
  return (
   <div {...stylex.props(GoogleAuthStyles.loginContainer)}>
    <canvas ref={canvasRef} {...stylex.props(GoogleAuthStyles.starCanvas)} aria-hidden="true" />
    <div {...stylex.props(GoogleAuthStyles.loginCard)} role="main">
     <div {...stylex.props(GoogleAuthStyles.loginHeader)}>
      <div {...stylex.props(GoogleAuthStyles.logoContainer)}>
       <Icon
        name="main-logo"
        alt="uChat Logo"
        {...stylex.props(GoogleAuthStyles.mainLogo)}
        draggable="false"
       />
      </div>
      <h1 {...stylex.props(GoogleAuthStyles.headerTitle)}>
       <i
        className="fas fa-spinner fa-spin"
        aria-hidden="true"
        style={{ marginRight: "12px", color: "var(--border-focus)" }}
       />
       Loading...
      </h1>
     </div>
    </div>
   </div>
  );
 }

 return (
  <div {...stylex.props(GoogleAuthStyles.loginContainer)}>
   <canvas
    ref={canvasRef}
    {...stylex.props(GoogleAuthStyles.starCanvas)}
    aria-hidden="true"
    role="presentation"
   />

   <div
    {...stylex.props(GoogleAuthStyles.loginCard)}
    role="main"
    aria-labelledby={ids.pageTitle}
   >
    <div {...stylex.props(GoogleAuthStyles.loginHeader)}>
     <div {...stylex.props(GoogleAuthStyles.logoContainer)}>
      <Icon
       name="main-logo"
       alt="uChat Logo"
       {...stylex.props(GoogleAuthStyles.mainLogo)}
       style={{ width: "60px", height: "60px" }}
       draggable="false"
      />
     </div>

     <h1 id={ids.pageTitle} {...stylex.props(GoogleAuthStyles.headerTitle)}>
      <i
       className="fas fa-cogs"
       aria-hidden="true"
       style={{ marginRight: "12px", color: "var(--border-focus)" }}
      />
      Complete Your Setup
     </h1>

     {currentStep === 0 && (
      <div {...stylex.props(GoogleAuthStyles.stepExplanation)}>
       <p id={ids.stepExplain(0)} {...stylex.props(GoogleAuthStyles.stepExplanationP)}>
        Welcome {userInfo.name}! Your Google account ({userInfo.email}) is now connected. Let's choose how you want to be known on uChat. This is your username that others will see in chats and your profile. Think of it like a nickname.
       </p>
      </div>
     )}

     {currentStep === 1 && (
      <div {...stylex.props(GoogleAuthStyles.stepExplanation)}>
       <p id={ids.stepExplain(1)} {...stylex.props(GoogleAuthStyles.stepExplanationP)}>
        Your handle is a unique identifier that ensures your account isn't duplicated or impersonated. It will appear as "@handle" to other users. For example, if multiple people share the same name, handles help distinguish who is who.
       </p>
      </div>
     )}
    </div>

    <form
     id={ids.form}
     {...stylex.props(GoogleAuthStyles.loginForm)}
     onSubmit={handleFormSubmit}
     noValidate
     aria-busy={loading ? "true" : "false"}
     aria-describedby={buildDescribedBy([
      activeSubtitleId,
      activeExplainId,
      getActiveErrorText() ? activeErrorId : null,
     ])}
    >
     <div>
      <div
       {...stylex.props(
        GoogleAuthStyles.progressIndicator,
        progressSpacingStyle(currentStep)
       )}
       aria-label="Setup progress"
       role="list"
       id={ids.progress}
       style={{ marginBottom: "55px" }}
      >
       {[0, 1].map((step) => (
        <div
         key={step}
         role="listitem"
         aria-label={`Step ${step + 1} of 2${step === currentStep ? ", current step" : ""
          }`}
         aria-current={step === currentStep ? "step" : undefined}
         {...stylex.props(
          GoogleAuthStyles.progressDot,
          step === currentStep && GoogleAuthStyles.progressDotActive,
          step < currentStep && GoogleAuthStyles.progressDotCompleted
         )}
        />
       ))}
      </div>
     </div>

     <div {...stylex.props(GoogleAuthStyles.stepsWrapper)}>
      {/* STEP 0 - Username */}
      <div {...stylex.props(...getStepStyleList(0))}>
       <div
        {...stylex.props(GoogleAuthStyles.stepHeader, stepHeaderSpacingStyle(0))}
       >
        <h2
         id={ids.stepTitle(0)}
         {...stylex.props(GoogleAuthStyles.stepHeaderH2)}
        >
         {steps[0].title}
        </h2>
        <p
         id={ids.stepSubtitle(0)}
         {...stylex.props(GoogleAuthStyles.stepHeaderP)}
        >
         {steps[0].subtitle}
        </p>
       </div>

       <div
        {...stylex.props(GoogleAuthStyles.inputGroup, inputGroupSpacingStyle(0))}
       >
        <div style={{ position: "relative" }}>
         <label
          htmlFor={ids.field.username}
          style={{
           position: "absolute",
           left: "-9999px",
           width: "1px",
           height: "1px",
           overflow: "hidden",
          }}
         >
          Username
         </label>

         <input
          {...stylex.props(GoogleAuthStyles.inputGroupInput)}
          id={ids.field.username}
          type={steps[0].type}
          name={steps[0].field}
          value={formData[steps[0].field]}
          onChange={handleInputChange}
          placeholder={steps[0].placeholder}
          title="Enter the username you will use on uChat"
          autoFocus={currentStep === 0 && !isTransitioning}
          autoComplete="username"
          minLength={3}
          maxLength={30}
          required
          spellCheck="false"
          aria-required="true"
          aria-invalid={
           Boolean((error || validationError) && currentStep === 0)
            ? "true"
            : "false"
          }
          aria-describedby={buildDescribedBy([
           ids.stepSubtitle(0),
           ids.stepExplain(0),
           ids.counter.username,
           error || validationError ? ids.stepError(0) : null,
          ])}
         />

         <div
          id={ids.counter.username}
          aria-live="polite"
          style={{
           fontSize: "12px",
           color:
            formData.username.length > 30
             ? "var(--error-text, #c53030)"
             : "var(--text-secondary, #666)",
           marginTop: "4px",
           textAlign: "right",
          }}
         >
          {formData.username.length}/30 characters
         </div>
        </div>

        {(error || validationError) && (
         <div
          id={ids.stepError(0)}
          role="alert"
          aria-live="assertive"
          style={{
           fontSize: "12px",
           color: "var(--error-text, #c53030)",
           marginTop: "-12.5px",
           display: "flex",
           alignItems: "center",
           gap: "4px",
          }}
         >
          <i
           className="fas fa-exclamation-circle"
           aria-hidden="true"
           style={{ fontSize: "11px" }}
          />
          {error || validationError}
         </div>
        )}
       </div>

       <div {...stylex.props(GoogleAuthStyles.buttonContainer)}>
        <button
         type="submit"
         {...stylex.props(
          GoogleAuthStyles.loginBtn,
          GoogleAuthStyles.loginBtnPrimary
         )}
         disabled={loading || !!validationError}
         aria-disabled={loading || !!validationError ? "true" : "false"}
         title="Continue to the next step"
        >
         <i
          className={loading ? "fas fa-spinner fa-spin" : "fas fa-arrow-right"}
          aria-hidden="true"
          style={{ marginRight: "8px" }}
         />
         {loading ? "Loading..." : "Continue"}
        </button>
       </div>
      </div>

      {/* STEP 1 - Handle */}
      <div {...stylex.props(...getStepStyleList(1))}>
       <div
        {...stylex.props(GoogleAuthStyles.stepHeader, stepHeaderSpacingStyle(1))}
       >
        <h2
         id={ids.stepTitle(1)}
         {...stylex.props(GoogleAuthStyles.stepHeaderH2)}
        >
         {steps[1].title}
        </h2>
        <p
         id={ids.stepSubtitle(1)}
         {...stylex.props(GoogleAuthStyles.stepHeaderP)}
        >
         {steps[1].subtitle}
        </p>
       </div>

       <div
        {...stylex.props(GoogleAuthStyles.inputGroup, inputGroupSpacingStyle(1))}
       >
        <div style={{ position: "relative" }}>
         <label
          htmlFor={ids.field.handle}
          style={{
           position: "absolute",
           left: "-9999px",
           width: "1px",
           height: "1px",
           overflow: "hidden",
          }}
         >
          Handle
         </label>

         <input
          {...stylex.props(GoogleAuthStyles.inputGroupInput)}
          id={ids.field.handle}
          type={steps[1].type}
          name={steps[1].field}
          value={formData[steps[1].field]}
          onChange={handleInputChange}
          placeholder={steps[1].placeholder}
          title={steps[1].subtitle}
          autoFocus={currentStep === 1 && !isTransitioning}
          autoComplete="nickname"
          minLength={3}
          maxLength={15}
          required
          spellCheck="false"
          pattern="^[a-zA-Z0-9_]+$"
          aria-required="true"
          aria-invalid={
           Boolean((error || validationError) && currentStep === 1)
            ? "true"
            : "false"
          }
          aria-describedby={buildDescribedBy([
           ids.stepSubtitle(1),
           ids.stepExplain(1),
           ids.counter.handle,
           error || validationError ? ids.stepError(1) : null,
          ])}
         />

         <div
          id={ids.counter.handle}
          aria-live="polite"
          style={{
           fontSize: "12px",
           color:
            formData.handle.length > 15
             ? "var(--error-text, #c53030)"
             : "var(--text-secondary, #666)",
           marginTop: "4px",
           textAlign: "right",
          }}
         >
          {formData.handle.length}/15 characters
         </div>
        </div>

        {(error || validationError) && (
         <div
          id={ids.stepError(1)}
          role="alert"
          aria-live="assertive"
          style={{
           fontSize: "12px",
           color: "var(--error-text, #c53030)",
           marginTop: "-12.5px",
           display: "flex",
           alignItems: "center",
           gap: "4px",
          }}
         >
          <i
           className="fas fa-exclamation-circle"
           aria-hidden="true"
           style={{ fontSize: "11px" }}
          />
          {error || validationError}
         </div>
        )}
       </div>

       <div {...stylex.props(GoogleAuthStyles.buttonContainer)}>
        <button
         type="button"
         onClick={handleBack}
         {...stylex.props(GoogleAuthStyles.backBtn)}
         disabled={loading}
         aria-disabled={loading ? "true" : "false"}
         title="Go back to the previous step"
        >
         <Icon
          name="return"
          alt="Back"
          {...stylex.props(GoogleAuthStyles.backBtnImg)}
         />
         Back
        </button>

        <button
         type="submit"
         {...stylex.props(
          GoogleAuthStyles.loginBtn,
          GoogleAuthStyles.loginBtnPrimary
         )}
         disabled={loading || !!validationError}
         aria-disabled={loading || !!validationError ? "true" : "false"}
         title="Complete your setup"
        >
         <i
          className={loading ? "fas fa-spinner fa-spin" : "fas fa-check"}
          aria-hidden="true"
          style={{ marginRight: "8px" }}
         />
         {loading ? "Completing..." : "Complete Setup"}
        </button>
       </div>
      </div>
     </div>
    </form>

    <div {...stylex.props(GoogleAuthStyles.loginFooter)}>
     <div {...stylex.props(GoogleAuthStyles.footerP)}>
      <Icon
       name="google_logo"
       alt=""
       style={{
        width: "20px",
        height: "20px",
        marginRight: "10px",
        opacity: 0.8,
        display: "inline-block",
        verticalAlign: "middle",
       }}
      />
      <span>
       Connected: {userInfo.email}
      </span>
     </div>
    </div>
   </div>
  </div>
 );
};

export default GoogleAuth;