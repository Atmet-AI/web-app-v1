"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  OTPField,
  OTPFieldInput,
  OTPFieldSeparator,
} from "@/components/ui/otp-field";
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { bindAtmetSounds, playAtmetSound } from "@/lib/sound";
import {
  blueCtaButtonClassName,
  getInitialCtaAccentPreference,
  type CtaAccentPreference,
} from "@/lib/cta-accent";

const workTypeOptions = [
  "Founder",
  "Operations",
  "Product",
  "Engineering",
  "Agency",
  "Other",
];

const companySizeOptions = ["1-10", "11-50", "51-200", "201-500", "500+"];

const roleOptions = [
  "Owner",
  "Admin",
  "Manager",
  "Builder",
  "Analyst",
  "Other",
];

const sourceOptions = [
  "Search",
  "Social",
  "Friend",
  "Community",
  "Newsletter",
  "Other",
];

const countryOptions = [
  { flag: "🇯🇴", name: "Jordan" },
  { flag: "🇺🇸", name: "United States" },
  { flag: "🇬🇧", name: "United Kingdom" },
  { flag: "🇸🇦", name: "Saudi Arabia" },
  { flag: "🇦🇪", name: "United Arab Emirates" },
  { flag: "🌐", name: "Other" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistCompany, setWaitlistCompany] = useState("");
  const [waitlistWorkType, setWaitlistWorkType] = useState("");
  const [waitlistCompanySize, setWaitlistCompanySize] = useState("");
  const [waitlistRole, setWaitlistRole] = useState("");
  const [waitlistSource, setWaitlistSource] = useState("");
  const [waitlistCountry, setWaitlistCountry] = useState("");
  const [waitlistNotes, setWaitlistNotes] = useState("");
  const [mode, setMode] = useState<"login" | "forgot" | "reset" | "waitlist">("login");
  const [otpVisible, setOtpVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ctaAccentPreference, setCtaAccentPreference] = useState<CtaAccentPreference>(
    getInitialCtaAccentPreference,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const newPasswordInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bindAtmetSounds();

    function playErrorCue() {
      void playAtmetSound("error");
    }

    window.addEventListener("error", playErrorCue);
    window.addEventListener("unhandledrejection", playErrorCue);

    return () => {
      window.removeEventListener("error", playErrorCue);
      window.removeEventListener("unhandledrejection", playErrorCue);
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");

    function syncSystemTheme(event?: MediaQueryListEvent) {
      document.documentElement.classList.toggle(
        "dark",
        event?.matches ?? query.matches,
      );
    }

    syncSystemTheme();
    query.addEventListener("change", syncSystemTheme);

    return () => query.removeEventListener("change", syncSystemTheme);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      void playAtmetSound("error");
    }
  }, [errorMessage]);

  useEffect(() => {
    function syncCtaAccentPreference() {
      setCtaAccentPreference(getInitialCtaAccentPreference());
    }

    window.addEventListener("focus", syncCtaAccentPreference);
    window.addEventListener("pageshow", syncCtaAccentPreference);
    window.addEventListener("storage", syncCtaAccentPreference);

    return () => {
      window.removeEventListener("focus", syncCtaAccentPreference);
      window.removeEventListener("pageshow", syncCtaAccentPreference);
      window.removeEventListener("storage", syncCtaAccentPreference);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const code = params.get("code");
    const reset = params.get("reset");
    const passwordUpdated = params.get("passwordUpdated");

    if (error === "missing_supabase_env") {
      setErrorMessage(
        "Supabase environment variables are missing in this deployment.",
      );
    }

    if (error === "session_expired") {
      window.history.replaceState(null, "", "/login");
    }

    if (passwordUpdated === "1") {
      setSuccessMessage("Password updated. Sign in with your new password.");
      window.history.replaceState(null, "", "/login");
    }

    if (reset !== "1") {
      return;
    }

    setMode("reset");
    setPasswordVisible(false);
    setOtpVisible(false);

    if (!code) {
      setMode("forgot");
      return;
    }

    setIsSubmitting(true);
    fetch("/api/auth/sign-out", { method: "POST" })
      .catch(() => undefined)
      .then(() =>
        fetch("/api/auth/exchange-code", {
          body: JSON.stringify({ code }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
      )
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Reset link is invalid or expired.");
        }

        window.history.replaceState(null, "", "/login?reset=1");
        window.setTimeout(() => newPasswordInputRef.current?.focus(), 180);
      })
      .catch((exchangeError) => {
        setMode("forgot");
        setErrorMessage(
          exchangeError instanceof Error
            ? exchangeError.message
            : "Reset link is invalid or expired.",
        );
      })
      .finally(() => setIsSubmitting(false));
  }, []);

  useEffect(() => {
    if (!passwordVisible) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 180);

    return () => window.clearTimeout(focusTimer);
  }, [passwordVisible]);

  useEffect(() => {
    if (!otpVisible) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      otpInputRef.current?.focus();
    }, 180);

    return () => window.clearTimeout(focusTimer);
  }, [otpVisible]);

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setErrorMessage("");
    setSuccessMessage("");

    if (mode === "waitlist") {
      if (!email.trim() || !waitlistName.trim()) {
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch("/api/waitlist", {
          body: JSON.stringify({
            companyName: waitlistCompany,
            companySize: waitlistCompanySize,
            country: waitlistCountry,
            email,
            fullName: waitlistName,
            notes: waitlistNotes,
            roleTitle: waitlistRole,
            source: waitlistSource,
            workType: waitlistWorkType,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setErrorMessage(payload.error ?? "Could not join the waitlist.");
          return;
        }

        setWaitlistSubmitted(true);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === "reset") {
      if (!newPassword || !confirmPassword) {
        setErrorMessage("Enter and confirm your new password.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }

      setIsSubmitting(true);
      try {
          const response = await fetch("/api/auth/update-password", {
            body: JSON.stringify({ password: newPassword }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setErrorMessage(payload.error ?? "Could not update password.");
          return;
        }

        window.location.href = "/login?passwordUpdated=1";
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === "forgot") {
      if (!email.trim()) {
        return;
      }

      if (!otpVisible) {
        setIsSubmitting(true);
        try {
          const response = await fetch("/api/auth/otp", {
            body: JSON.stringify({ email }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            setErrorMessage(payload.error ?? "Could not send OTP.");
            return;
          }

          setOtp("");
          setOtpVisible(true);
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      if (otp.trim().length === 6) {
        setIsSubmitting(true);
        try {
          const response = await fetch("/api/auth/verify-otp", {
            body: JSON.stringify({ email, token: otp, type: "email" }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            setErrorMessage(payload.error ?? "Could not verify OTP.");
            return;
          }

          setMode("reset");
          setOtpVisible(false);
          setOtp("");
          window.setTimeout(() => newPasswordInputRef.current?.focus(), 180);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setErrorMessage("Enter the 6-digit OTP.");
      }
      return;
    }

    if (email.trim() && !passwordVisible) {
      setPasswordVisible(true);
      return;
    }

    if (email.trim() && password.trim()) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/auth/sign-in", {
          body: JSON.stringify({ email, password }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          setErrorMessage(payload.error ?? "Could not sign in.");
          return;
        }

        window.location.href = "/";
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (passwordVisible) {
      setErrorMessage("Enter your password.");
    }
  }

  function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (
      event.key === "Enter" &&
      event.target instanceof HTMLElement &&
      event.target.tagName !== "TEXTAREA"
    ) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function startForgotPassword() {
    setMode("forgot");
    setErrorMessage("");
    setSuccessMessage("");
    setPasswordVisible(false);
    setOtpVisible(false);
    setWaitlistSubmitted(false);
  }

  function backToSignIn() {
    setMode("login");
    setErrorMessage("");
    setSuccessMessage("");
    setOtpVisible(false);
    setNewPassword("");
    setConfirmPassword("");
    setWaitlistSubmitted(false);
  }

  function startWaitlist() {
    setMode("waitlist");
    setErrorMessage("");
    setSuccessMessage("");
    setPasswordVisible(false);
    setOtpVisible(false);
    setWaitlistSubmitted(false);
  }

  const isForgotMode = mode === "forgot";
  const isResetMode = mode === "reset";
  const isWaitlistMode = mode === "waitlist";
  const shouldHideEmail = isForgotMode && otpVisible;
  const title = isWaitlistMode
    ? waitlistSubmitted
      ? "You’re on the list"
      : "Join waitlist"
    : isResetMode
      ? "Create new password"
      : isForgotMode
      ? "Reset password"
      : "Welcome back";
  const description = isWaitlistMode
    ? waitlistSubmitted
      ? "We will email you when your Atmet workspace is ready."
      : "Tell us a little about yourself and we'll be in touch."
    : isResetMode
      ? "Choose a new password for your Atmet account."
      : isForgotMode
      ? otpVisible
        ? "Enter the code we sent to your email."
        : "Enter your email and we will send you an OTP."
      : "Sign in to continue to your Atmet workspace.";

  return (
    <main className="relative grid min-h-svh bg-background px-5 text-foreground">
      <section
        className={cn(
          "mx-auto flex w-full flex-col justify-center px-3 pb-28 pt-20 sm:px-0",
          isWaitlistMode ? "max-w-3xl" : "max-w-sm",
        )}
      >
        <div className="mb-8 text-center">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-muted-foreground text-sm">
            {description}
          </p>
        </div>

        <form
          className="grid"
          onKeyDown={handleFormKeyDown}
          onSubmit={submitLogin}
          ref={formRef}
        >
          {isWaitlistMode ? (
            <>
              <div
                className={cn(
                  "grid overflow-hidden transition-[grid-template-rows,opacity,translate,margin] duration-300 ease-out",
                  !waitlistSubmitted
                    ? "grid-rows-[1fr] translate-y-0 opacity-100"
                    : "mt-0 grid-rows-[0fr] -translate-y-1 opacity-0",
                )}
              >
                <div className="min-h-0 px-1 pb-1">
                  <div className="grid gap-5 md:grid-cols-2 md:gap-x-6">
                    <div className="grid gap-1.5">
                      <Label
                        className="text-muted-foreground"
                        htmlFor="waitlist-name"
                      >
                        Full name
                      </Label>
                      <Input
                        autoComplete="name"
                        disabled={waitlistSubmitted}
                        id="waitlist-name"
                        onChange={(event) =>
                          setWaitlistName(event.target.value)
                        }
                        placeholder="Amir Haddad"
                        required={!waitlistSubmitted}
                        type="text"
                        value={waitlistName}
                      />
                    </div>

                    <WaitlistSelectField
                      disabled={waitlistSubmitted}
                      label="Work type"
                      onValueChange={setWaitlistWorkType}
                      options={workTypeOptions}
                      placeholder="Select work type"
                      value={waitlistWorkType}
                    />

                    <div className="grid gap-1.5">
                      <Label
                        className="text-muted-foreground"
                        htmlFor="waitlist-company"
                      >
                        Company name
                      </Label>
                      <Input
                        autoComplete="organization"
                        disabled={waitlistSubmitted}
                        id="waitlist-company"
                        onChange={(event) =>
                          setWaitlistCompany(event.target.value)
                        }
                        placeholder="Atmet"
                        type="text"
                        value={waitlistCompany}
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label
                        className="text-muted-foreground"
                        htmlFor="waitlist-email"
                      >
                        Work email
                      </Label>
                      <Input
                        autoComplete="email"
                        disabled={waitlistSubmitted}
                        id="waitlist-email"
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@company.com"
                        required={!waitlistSubmitted}
                        type="email"
                        value={email}
                      />
                    </div>

                    <WaitlistSelectField
                      disabled={waitlistSubmitted}
                      label="Company size"
                      onValueChange={setWaitlistCompanySize}
                      options={companySizeOptions}
                      placeholder="Select company size"
                      value={waitlistCompanySize}
                    />

                    <WaitlistSelectField
                      disabled={waitlistSubmitted}
                      label="Your role"
                      onValueChange={setWaitlistRole}
                      options={roleOptions}
                      placeholder="Select your role"
                      value={waitlistRole}
                    />

                    <WaitlistSelectField
                      disabled={waitlistSubmitted}
                      label="How did you hear about us?"
                      onValueChange={setWaitlistSource}
                      options={sourceOptions}
                      placeholder="Select a source"
                      value={waitlistSource}
                    />

                    <CountrySelectField
                      disabled={waitlistSubmitted}
                      label="Country"
                      onValueChange={setWaitlistCountry}
                      placeholder="Select your country"
                      value={waitlistCountry}
                    />

                    <div className="grid gap-1.5 md:col-span-2">
                      <Label
                        className="text-muted-foreground"
                        htmlFor="waitlist-notes"
                      >
                        Anything else you&apos;d like to add?
                      </Label>
                      <Textarea
                        disabled={waitlistSubmitted}
                        id="waitlist-notes"
                        onChange={(event) =>
                          setWaitlistNotes(event.target.value)
                        }
                        placeholder="Tell us what you'd like to automate."
                        value={waitlistNotes}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className={cn(
                  "mt-8 w-full",
                  waitlistSubmitted && "hidden",
                  ctaAccentPreference === "blue" && blueCtaButtonClassName,
                )}
                disabled={isSubmitting}
                onClick={() => void playAtmetSound("tick")}
                size="lg"
                type="submit"
              >
                {isSubmitting && <Spinner className="size-4" />}
                Join waitlist
                <span className="grid size-5 place-items-center rounded-md bg-primary-foreground/12 text-sm leading-none">
                  ↵
                </span>
              </Button>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "grid overflow-hidden transition-[grid-template-rows,opacity,translate,margin] duration-300 ease-out",
                  shouldHideEmail || isResetMode
                    ? "mt-0 grid-rows-[0fr] -translate-y-1 opacity-0"
                    : "grid-rows-[1fr] translate-y-0 opacity-100",
                )}
              >
                <div className="min-h-0 px-1 pb-1">
                  <div className="grid gap-1.5">
                    <Label className="text-muted-foreground" htmlFor="email">
                      Email
                    </Label>
                    <Input
                      autoComplete="email"
                      id="email"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                      required={!waitlistSubmitted}
                      type="email"
                      value={email}
                    />
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "grid overflow-hidden transition-[grid-template-rows,opacity,translate,margin] duration-300 ease-out",
                  passwordVisible && !isForgotMode && !isResetMode
                    ? "mt-5 grid-rows-[1fr] translate-y-0 opacity-100"
                    : "mt-0 grid-rows-[0fr] -translate-y-1 opacity-0",
                )}
              >
                <div className="min-h-0 px-1 pb-1">
                  <div className="grid gap-1.5">
                    <Label
                      className="text-muted-foreground"
                      htmlFor="password"
                    >
                      Password
                    </Label>
                    <Input
                      autoComplete="current-password"
                      disabled={!passwordVisible || isForgotMode}
                      id="password"
                      nativeInput
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      ref={passwordInputRef}
                      required={passwordVisible && !isForgotMode}
                      type="password"
                      value={password}
                    />
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "grid overflow-hidden transition-[grid-template-rows,opacity,translate,margin] duration-300 ease-out",
                  otpVisible && isForgotMode
                    ? "mt-5 grid-rows-[1fr] translate-y-0 opacity-100"
                    : "mt-0 grid-rows-[0fr] -translate-y-1 opacity-0",
                )}
              >
                <div className="min-h-0 px-1 pb-1">
                  <div className="grid gap-2">
                    <Label
                      className="text-muted-foreground"
                      htmlFor="otp-code"
                    >
                      OTP
                    </Label>
                    <OTPField
                      className="justify-between"
                      disabled={!otpVisible || !isForgotMode}
                      id="otp-code"
                      length={6}
                      onValueChange={setOtp}
                      required={otpVisible && isForgotMode}
                      size="lg"
                      value={otp}
                    >
                      <OTPFieldInput ref={otpInputRef} />
                      <OTPFieldInput />
                      <OTPFieldInput />
                      <OTPFieldSeparator />
                      <OTPFieldInput />
                      <OTPFieldInput />
                      <OTPFieldInput />
                    </OTPField>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "grid overflow-hidden transition-[grid-template-rows,opacity,translate,margin] duration-300 ease-out",
                  isResetMode
                    ? "grid-rows-[1fr] translate-y-0 opacity-100"
                    : "mt-0 grid-rows-[0fr] -translate-y-1 opacity-0",
                )}
              >
                <div className="grid min-h-0 gap-5 px-1 pb-1">
                  <div className="grid gap-1.5">
                    <Label
                      className="text-muted-foreground"
                      htmlFor="new-password"
                    >
                      New password
                    </Label>
                    <Input
                      autoComplete="new-password"
                      disabled={!isResetMode || isSubmitting}
                      id="new-password"
                      nativeInput
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Create a new password"
                      ref={newPasswordInputRef}
                      required={isResetMode}
                      type="password"
                      value={newPassword}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label
                      className="text-muted-foreground"
                      htmlFor="confirm-new-password"
                    >
                      Confirm password
                    </Label>
                    <Input
                      autoComplete="new-password"
                      disabled={!isResetMode || isSubmitting}
                      id="confirm-new-password"
                      nativeInput
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirm your new password"
                      required={isResetMode}
                      type="password"
                      value={confirmPassword}
                    />
                  </div>
                </div>
              </div>

              {errorMessage && (
                <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-center text-destructive text-sm">
                  {errorMessage}
                </p>
              )}

              {successMessage && (
                <p className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-center text-emerald-700 text-sm dark:text-emerald-300">
                  {successMessage}
                </p>
              )}

              <Button
                className={cn(
                  "mt-5 w-full",
                  ctaAccentPreference === "blue" && blueCtaButtonClassName,
                )}
                disabled={isSubmitting}
                onClick={() => void playAtmetSound("tick")}
                type="submit"
              >
                {isSubmitting && <Spinner className="size-4" />}
                {isForgotMode
                  ? otpVisible
                    ? "Verify OTP"
                    : "Send OTP"
                  : isResetMode
                    ? "Update password"
                  : passwordVisible
                    ? "Sign in"
                    : "Continue"}
                <span className="grid size-5 place-items-center rounded-md bg-primary-foreground/12 text-sm leading-none">
                  ↵
                </span>
              </Button>
            </>
          )}

          {!isWaitlistMode && !isResetMode && (
            <button
              className="mx-auto mt-4 min-h-8 rounded-md px-2 text-muted-foreground text-sm outline-none transition-[color,scale] duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
              onClick={isForgotMode ? backToSignIn : startForgotPassword}
              type="button"
            >
              {isForgotMode ? "Back to sign in" : "Forgot password?"}
            </button>
          )}
        </form>
      </section>

      <p className="absolute bottom-8 left-1/2 w-full -translate-x-1/2 px-5 text-center text-muted-foreground text-sm">
        {isWaitlistMode ? "Already have access?" : "Don't have an account?"}{" "}
        <button
          className={cn(
            "font-medium text-foreground outline-none transition-[color,opacity,scale] duration-150 hover:opacity-75 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]",
            ctaAccentPreference === "blue" && "text-[#1e90ff]",
          )}
          onClick={() => {
            void playAtmetSound("tick");
            if (isWaitlistMode) {
              backToSignIn();
            } else {
              startWaitlist();
            }
          }}
          type="button"
        >
          {isWaitlistMode ? "Sign in" : "Join waitlist"}
        </button>
      </p>
    </main>
  );
}

function WaitlistSelectField({
  disabled,
  label,
  onValueChange,
  options,
  placeholder,
  value,
}: {
  disabled: boolean;
  label: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      <Select
        disabled={disabled}
        onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
        value={value || null}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectPopup>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  );
}

function CountrySelectField({
  disabled,
  label,
  onValueChange,
  placeholder,
  value,
}: {
  disabled: boolean;
  label: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedCountry = countryOptions.find((country) => country.name === value);
  const filteredCountries = countryOptions.filter((country) =>
    country.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function selectCountry(countryName: string) {
    onValueChange(countryName);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="grid gap-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          className={selectTriggerVariants({
            className: "min-w-0 cursor-pointer",
          })}
          disabled={disabled}
          type="button"
        >
          <span
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 truncate",
              !selectedCountry && "text-muted-foreground",
            )}
          >
            {selectedCountry ? (
              <>
                <span aria-hidden="true">{selectedCountry.flag}</span>
                <span className="truncate">{selectedCountry.name}</span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <span aria-hidden="true" className="-me-1 text-muted-foreground">
            ⌄
          </span>
        </PopoverTrigger>
        <PopoverPopup
          align="start"
          className="w-(--anchor-width) p-0"
          sideOffset={6}
        >
          <div className="grid gap-1 p-1">
            <Input
              autoComplete="off"
              className="mb-1"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country..."
              type="search"
              value={query}
            />
            <div className="max-h-56 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    className="flex min-h-8 w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-sm outline-none transition-[background-color,color] hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                    key={country.name}
                    onClick={() => selectCountry(country.name)}
                    type="button"
                  >
                    <span aria-hidden="true">{country.flag}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {country.name}
                    </span>
                    {country.name === value && (
                      <span className="text-muted-foreground">✓</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-2 py-3 text-center text-muted-foreground text-sm">
                  No countries found.
                </div>
              )}
            </div>
          </div>
        </PopoverPopup>
      </Popover>
    </div>
  );
}
