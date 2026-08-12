"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronsUpDown } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
  selectTriggerIconClassName,
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
import { ParticleCube } from "@/components/particle-cube";

const workTypeOptions = [
  "Technology",
  "Financial services",
  "Healthcare",
  "Education",
  "Retail and ecommerce",
  "Manufacturing",
  "Professional services",
  "Media and entertainment",
  "Nonprofit and government",
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
  { flag: "🇩🇿", name: "Algeria" },
  { flag: "🇧🇭", name: "Bahrain" },
  { flag: "🇰🇲", name: "Comoros" },
  { flag: "🇩🇯", name: "Djibouti" },
  { flag: "🇪🇬", name: "Egypt" },
  { flag: "🇮🇶", name: "Iraq" },
  { flag: "🇰🇼", name: "Kuwait" },
  { flag: "🇱🇧", name: "Lebanon" },
  { flag: "🇱🇾", name: "Libya" },
  { flag: "🇲🇷", name: "Mauritania" },
  { flag: "🇲🇦", name: "Morocco" },
  { flag: "🇴🇲", name: "Oman" },
  { flag: "🇵🇸", name: "Palestinian Territories" },
  { flag: "🇶🇦", name: "Qatar" },
  { flag: "🇸🇦", name: "Saudi Arabia" },
  { flag: "🇸🇴", name: "Somalia" },
  { flag: "🇸🇩", name: "Sudan" },
  { flag: "🇸🇾", name: "Syria" },
  { flag: "🇹🇳", name: "Tunisia" },
  { flag: "🇦🇪", name: "United Arab Emirates" },
  { flag: "🇾🇪", name: "Yemen" },
  { flag: "🇦🇫", name: "Afghanistan" },
  { flag: "🇦🇽", name: "Åland Islands" },
  { flag: "🇦🇱", name: "Albania" },
  { flag: "🇦🇸", name: "American Samoa" },
  { flag: "🇦🇩", name: "Andorra" },
  { flag: "🇦🇴", name: "Angola" },
  { flag: "🇦🇮", name: "Anguilla" },
  { flag: "🇦🇶", name: "Antarctica" },
  { flag: "🇦🇬", name: "Antigua & Barbuda" },
  { flag: "🇦🇷", name: "Argentina" },
  { flag: "🇦🇲", name: "Armenia" },
  { flag: "🇦🇼", name: "Aruba" },
  { flag: "🇦🇺", name: "Australia" },
  { flag: "🇦🇹", name: "Austria" },
  { flag: "🇦🇿", name: "Azerbaijan" },
  { flag: "🇧🇸", name: "Bahamas" },
  { flag: "🇧🇩", name: "Bangladesh" },
  { flag: "🇧🇧", name: "Barbados" },
  { flag: "🇧🇾", name: "Belarus" },
  { flag: "🇧🇪", name: "Belgium" },
  { flag: "🇧🇿", name: "Belize" },
  { flag: "🇧🇯", name: "Benin" },
  { flag: "🇧🇲", name: "Bermuda" },
  { flag: "🇧🇹", name: "Bhutan" },
  { flag: "🇧🇴", name: "Bolivia" },
  { flag: "🇧🇦", name: "Bosnia & Herzegovina" },
  { flag: "🇧🇼", name: "Botswana" },
  { flag: "🇧🇻", name: "Bouvet Island" },
  { flag: "🇧🇷", name: "Brazil" },
  { flag: "🇮🇴", name: "British Indian Ocean Territory" },
  { flag: "🇻🇬", name: "British Virgin Islands" },
  { flag: "🇧🇳", name: "Brunei" },
  { flag: "🇧🇬", name: "Bulgaria" },
  { flag: "🇧🇫", name: "Burkina Faso" },
  { flag: "🇧🇮", name: "Burundi" },
  { flag: "🇰🇭", name: "Cambodia" },
  { flag: "🇨🇲", name: "Cameroon" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇨🇻", name: "Cape Verde" },
  { flag: "🇧🇶", name: "Caribbean Netherlands" },
  { flag: "🇰🇾", name: "Cayman Islands" },
  { flag: "🇨🇫", name: "Central African Republic" },
  { flag: "🇹🇩", name: "Chad" },
  { flag: "🇨🇱", name: "Chile" },
  { flag: "🇨🇳", name: "China" },
  { flag: "🇨🇽", name: "Christmas Island" },
  { flag: "🇨🇨", name: "Cocos (Keeling) Islands" },
  { flag: "🇨🇴", name: "Colombia" },
  { flag: "🇨🇬", name: "Congo - Brazzaville" },
  { flag: "🇨🇩", name: "Congo - Kinshasa" },
  { flag: "🇨🇰", name: "Cook Islands" },
  { flag: "🇨🇷", name: "Costa Rica" },
  { flag: "🇨🇮", name: "Côte d'Ivoire" },
  { flag: "🇭🇷", name: "Croatia" },
  { flag: "🇨🇺", name: "Cuba" },
  { flag: "🇨🇼", name: "Curaçao" },
  { flag: "🇨🇾", name: "Cyprus" },
  { flag: "🇨🇿", name: "Czechia" },
  { flag: "🇩🇰", name: "Denmark" },
  { flag: "🇩🇲", name: "Dominica" },
  { flag: "🇩🇴", name: "Dominican Republic" },
  { flag: "🇪🇨", name: "Ecuador" },
  { flag: "🇸🇻", name: "El Salvador" },
  { flag: "🇬🇶", name: "Equatorial Guinea" },
  { flag: "🇪🇷", name: "Eritrea" },
  { flag: "🇪🇪", name: "Estonia" },
  { flag: "🇸🇿", name: "Eswatini" },
  { flag: "🇪🇹", name: "Ethiopia" },
  { flag: "🇫🇰", name: "Falkland Islands" },
  { flag: "🇫🇴", name: "Faroe Islands" },
  { flag: "🇫🇯", name: "Fiji" },
  { flag: "🇫🇮", name: "Finland" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇬🇫", name: "French Guiana" },
  { flag: "🇵🇫", name: "French Polynesia" },
  { flag: "🇹🇫", name: "French Southern Territories" },
  { flag: "🇬🇦", name: "Gabon" },
  { flag: "🇬🇲", name: "Gambia" },
  { flag: "🇬🇪", name: "Georgia" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇬🇭", name: "Ghana" },
  { flag: "🇬🇮", name: "Gibraltar" },
  { flag: "🇬🇷", name: "Greece" },
  { flag: "🇬🇱", name: "Greenland" },
  { flag: "🇬🇩", name: "Grenada" },
  { flag: "🇬🇵", name: "Guadeloupe" },
  { flag: "🇬🇺", name: "Guam" },
  { flag: "🇬🇹", name: "Guatemala" },
  { flag: "🇬🇬", name: "Guernsey" },
  { flag: "🇬🇳", name: "Guinea" },
  { flag: "🇬🇼", name: "Guinea-Bissau" },
  { flag: "🇬🇾", name: "Guyana" },
  { flag: "🇭🇹", name: "Haiti" },
  { flag: "🇭🇲", name: "Heard & McDonald Islands" },
  { flag: "🇭🇳", name: "Honduras" },
  { flag: "🇭🇰", name: "Hong Kong SAR China" },
  { flag: "🇭🇺", name: "Hungary" },
  { flag: "🇮🇸", name: "Iceland" },
  { flag: "🇮🇳", name: "India" },
  { flag: "🇮🇩", name: "Indonesia" },
  { flag: "🇮🇷", name: "Iran" },
  { flag: "🇮🇪", name: "Ireland" },
  { flag: "🇮🇲", name: "Isle of Man" },
  { flag: "🇮🇱", name: "Israel" },
  { flag: "🇮🇹", name: "Italy" },
  { flag: "🇯🇲", name: "Jamaica" },
  { flag: "🇯🇵", name: "Japan" },
  { flag: "🇯🇪", name: "Jersey" },
  { flag: "🇰🇿", name: "Kazakhstan" },
  { flag: "🇰🇪", name: "Kenya" },
  { flag: "🇰🇮", name: "Kiribati" },
  { flag: "🇰🇬", name: "Kyrgyzstan" },
  { flag: "🇱🇦", name: "Laos" },
  { flag: "🇱🇻", name: "Latvia" },
  { flag: "🇱🇸", name: "Lesotho" },
  { flag: "🇱🇷", name: "Liberia" },
  { flag: "🇱🇮", name: "Liechtenstein" },
  { flag: "🇱🇹", name: "Lithuania" },
  { flag: "🇱🇺", name: "Luxembourg" },
  { flag: "🇲🇴", name: "Macao SAR China" },
  { flag: "🇲🇬", name: "Madagascar" },
  { flag: "🇲🇼", name: "Malawi" },
  { flag: "🇲🇾", name: "Malaysia" },
  { flag: "🇲🇻", name: "Maldives" },
  { flag: "🇲🇱", name: "Mali" },
  { flag: "🇲🇹", name: "Malta" },
  { flag: "🇲🇭", name: "Marshall Islands" },
  { flag: "🇲🇶", name: "Martinique" },
  { flag: "🇲🇺", name: "Mauritius" },
  { flag: "🇾🇹", name: "Mayotte" },
  { flag: "🇲🇽", name: "Mexico" },
  { flag: "🇫🇲", name: "Micronesia" },
  { flag: "🇲🇩", name: "Moldova" },
  { flag: "🇲🇨", name: "Monaco" },
  { flag: "🇲🇳", name: "Mongolia" },
  { flag: "🇲🇪", name: "Montenegro" },
  { flag: "🇲🇸", name: "Montserrat" },
  { flag: "🇲🇿", name: "Mozambique" },
  { flag: "🇲🇲", name: "Myanmar (Burma)" },
  { flag: "🇳🇦", name: "Namibia" },
  { flag: "🇳🇷", name: "Nauru" },
  { flag: "🇳🇵", name: "Nepal" },
  { flag: "🇳🇱", name: "Netherlands" },
  { flag: "🇳🇨", name: "New Caledonia" },
  { flag: "🇳🇿", name: "New Zealand" },
  { flag: "🇳🇮", name: "Nicaragua" },
  { flag: "🇳🇪", name: "Niger" },
  { flag: "🇳🇬", name: "Nigeria" },
  { flag: "🇳🇺", name: "Niue" },
  { flag: "🇳🇫", name: "Norfolk Island" },
  { flag: "🇰🇵", name: "North Korea" },
  { flag: "🇲🇰", name: "North Macedonia" },
  { flag: "🇲🇵", name: "Northern Mariana Islands" },
  { flag: "🇳🇴", name: "Norway" },
  { flag: "🇵🇰", name: "Pakistan" },
  { flag: "🇵🇼", name: "Palau" },
  { flag: "🇵🇦", name: "Panama" },
  { flag: "🇵🇬", name: "Papua New Guinea" },
  { flag: "🇵🇾", name: "Paraguay" },
  { flag: "🇵🇪", name: "Peru" },
  { flag: "🇵🇭", name: "Philippines" },
  { flag: "🇵🇳", name: "Pitcairn Islands" },
  { flag: "🇵🇱", name: "Poland" },
  { flag: "🇵🇹", name: "Portugal" },
  { flag: "🇵🇷", name: "Puerto Rico" },
  { flag: "🇷🇪", name: "Réunion" },
  { flag: "🇷🇴", name: "Romania" },
  { flag: "🇷🇺", name: "Russia" },
  { flag: "🇷🇼", name: "Rwanda" },
  { flag: "🇼🇸", name: "Samoa" },
  { flag: "🇸🇲", name: "San Marino" },
  { flag: "🇸🇹", name: "São Tomé & Príncipe" },
  { flag: "🇸🇳", name: "Senegal" },
  { flag: "🇷🇸", name: "Serbia" },
  { flag: "🇸🇨", name: "Seychelles" },
  { flag: "🇸🇱", name: "Sierra Leone" },
  { flag: "🇸🇬", name: "Singapore" },
  { flag: "🇸🇽", name: "Sint Maarten" },
  { flag: "🇸🇰", name: "Slovakia" },
  { flag: "🇸🇮", name: "Slovenia" },
  { flag: "🇸🇧", name: "Solomon Islands" },
  { flag: "🇿🇦", name: "South Africa" },
  { flag: "🇬🇸", name: "South Georgia & South Sandwich Islands" },
  { flag: "🇰🇷", name: "South Korea" },
  { flag: "🇸🇸", name: "South Sudan" },
  { flag: "🇪🇸", name: "Spain" },
  { flag: "🇱🇰", name: "Sri Lanka" },
  { flag: "🇧🇱", name: "St. Barthélemy" },
  { flag: "🇸🇭", name: "St. Helena" },
  { flag: "🇰🇳", name: "St. Kitts & Nevis" },
  { flag: "🇱🇨", name: "St. Lucia" },
  { flag: "🇲🇫", name: "St. Martin" },
  { flag: "🇵🇲", name: "St. Pierre & Miquelon" },
  { flag: "🇻🇨", name: "St. Vincent & Grenadines" },
  { flag: "🇸🇷", name: "Suriname" },
  { flag: "🇸🇯", name: "Svalbard & Jan Mayen" },
  { flag: "🇸🇪", name: "Sweden" },
  { flag: "🇨🇭", name: "Switzerland" },
  { flag: "🇹🇼", name: "Taiwan" },
  { flag: "🇹🇯", name: "Tajikistan" },
  { flag: "🇹🇿", name: "Tanzania" },
  { flag: "🇹🇭", name: "Thailand" },
  { flag: "🇹🇱", name: "Timor-Leste" },
  { flag: "🇹🇬", name: "Togo" },
  { flag: "🇹🇰", name: "Tokelau" },
  { flag: "🇹🇴", name: "Tonga" },
  { flag: "🇹🇹", name: "Trinidad & Tobago" },
  { flag: "🇹🇷", name: "Türkiye" },
  { flag: "🇹🇲", name: "Turkmenistan" },
  { flag: "🇹🇨", name: "Turks & Caicos Islands" },
  { flag: "🇹🇻", name: "Tuvalu" },
  { flag: "🇺🇲", name: "U.S. Outlying Islands" },
  { flag: "🇻🇮", name: "U.S. Virgin Islands" },
  { flag: "🇺🇬", name: "Uganda" },
  { flag: "🇺🇦", name: "Ukraine" },
  { flag: "🇬🇧", name: "United Kingdom" },
  { flag: "🇺🇸", name: "United States" },
  { flag: "🇺🇾", name: "Uruguay" },
  { flag: "🇺🇿", name: "Uzbekistan" },
  { flag: "🇻🇺", name: "Vanuatu" },
  { flag: "🇻🇦", name: "Vatican City" },
  { flag: "🇻🇪", name: "Venezuela" },
  { flag: "🇻🇳", name: "Vietnam" },
  { flag: "🇼🇫", name: "Wallis & Futuna" },
  { flag: "🇪🇭", name: "Western Sahara" },
  { flag: "🇿🇲", name: "Zambia" },
  { flag: "🇿🇼", name: "Zimbabwe" },
];

const loginHeadlines = [
  '“Turn company knowledge into actionable workflows.”',
  '“Preserve provenance, resolve conflicts, and trust the answers.”',
  '“One canonical Brain across tools, teams, and time.”',
];

type LoginFieldErrors = Partial<Record<"email" | "password", string>>;

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
  const [loginFieldErrors, setLoginFieldErrors] = useState<LoginFieldErrors>({});
  const [loginFieldShakeKey, setLoginFieldShakeKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeHeadlineIndex, setActiveHeadlineIndex] = useState(0);
  const [isHeadlineVisible, setIsHeadlineVisible] = useState(true);
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
    const intervalId = window.setInterval(() => {
      setActiveHeadlineIndex((current) => (current + 1) % loginHeadlines.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setIsHeadlineVisible(false);
    const timeoutId = window.setTimeout(() => setIsHeadlineVisible(true), 180);

    return () => window.clearTimeout(timeoutId);
  }, [activeHeadlineIndex]);

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
      if (window.location.hash === "#waitlist") {
        setMode("waitlist");
      }
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
    function syncHashMode() {
      if (window.location.hash === "#waitlist") {
        setMode("waitlist");
        setErrorMessage("");
        setSuccessMessage("");
        setPasswordVisible(false);
        setOtpVisible(false);
        setWaitlistSubmitted(false);
      } else if (mode === "waitlist") {
        backToSignIn();
      }
    }

    window.addEventListener("hashchange", syncHashMode);

    return () => window.removeEventListener("hashchange", syncHashMode);
  }, [mode]);

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
    if (mode === "login" || mode === "waitlist") {
      void playAtmetSound("tick");
    }
    setErrorMessage("");
    setLoginFieldErrors({});
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
          const message = payload.error ?? "Could not sign in.";
          setErrorMessage(message);
          setLoginFieldErrors({ password: message });
          setLoginFieldShakeKey((current) => current + 1);
          return;
        }

        window.location.href = "/dashboard";
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (passwordVisible) {
      const message = "Enter your password.";
      setErrorMessage(message);
      setLoginFieldErrors({ password: message });
      setLoginFieldShakeKey((current) => current + 1);
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
    window.history.replaceState(null, "", "/login");
    setErrorMessage("");
    setLoginFieldErrors({});
    setSuccessMessage("");
    setPasswordVisible(false);
    setOtpVisible(false);
    setWaitlistSubmitted(false);
  }

  function backToSignIn() {
    setMode("login");
    window.history.replaceState(null, "", "/login");
    setErrorMessage("");
    setLoginFieldErrors({});
    setSuccessMessage("");
    setOtpVisible(false);
    setNewPassword("");
    setConfirmPassword("");
    setWaitlistSubmitted(false);
  }

  function startWaitlist() {
    setMode("waitlist");
    window.history.replaceState(null, "", "/login#waitlist");
    setErrorMessage("");
    setLoginFieldErrors({});
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
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative grid min-h-svh px-5">
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
                      label="Industry"
                      onValueChange={setWaitlistWorkType}
                      options={workTypeOptions}
                      placeholder="Select industry"
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
                        className="placeholder:text-muted-foreground/72"
                        disabled={waitlistSubmitted}
                        id="waitlist-notes"
                        onChange={(event) =>
                          setWaitlistNotes(event.target.value)
                        }
                        placeholder="write here"
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
                    {loginFieldErrors.email && (
                      <p
                        className="text-xs font-medium text-destructive"
                        id="email-error"
                      >
                        {loginFieldErrors.email}
                      </p>
                    )}
                    <Input
                      key={`email-${loginFieldShakeKey}`}
                      aria-describedby={
                        loginFieldErrors.email ? "email-error" : undefined
                      }
                      aria-invalid={Boolean(loginFieldErrors.email)}
                      autoComplete="email"
                      className={cn(
                        loginFieldErrors.email &&
                          "animate-[login-field-shake_280ms_cubic-bezier(0.5,1,0.89,1)] border-destructive/64 ring-destructive/16 shadow-none",
                      )}
                      id="email"
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setLoginFieldErrors((current) => ({
                          ...current,
                          email: undefined,
                        }));
                      }}
                      onInvalid={(event) => {
                        event.preventDefault();
                        setErrorMessage("Enter a valid email address.");
                        setLoginFieldErrors({
                          email: "Enter a valid email address.",
                        });
                        setLoginFieldShakeKey((current) => current + 1);
                      }}
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
                    {loginFieldErrors.password && (
                      <p
                        className="text-xs font-medium text-destructive"
                        id="password-error"
                      >
                        {loginFieldErrors.password}
                      </p>
                    )}
                    <Input
                      key={`password-${loginFieldShakeKey}`}
                      aria-describedby={
                        loginFieldErrors.password
                          ? "password-error"
                          : undefined
                      }
                      aria-invalid={Boolean(loginFieldErrors.password)}
                      autoComplete="current-password"
                      className={cn(
                        loginFieldErrors.password &&
                          "animate-[login-field-shake_280ms_cubic-bezier(0.5,1,0.89,1)] border-destructive/64 ring-destructive/16 shadow-none",
                      )}
                      disabled={!passwordVisible || isForgotMode}
                      id="password"
                      nativeInput
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setLoginFieldErrors((current) => ({
                          ...current,
                          password: undefined,
                        }));
                      }}
                      onInvalid={(event) => {
                        event.preventDefault();
                        setErrorMessage("Enter your password.");
                        setLoginFieldErrors({
                          password: "Enter your password.",
                        });
                        setLoginFieldShakeKey((current) => current + 1);
                      }}
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

              {errorMessage &&
                !loginFieldErrors.email &&
                !loginFieldErrors.password && (
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

          {!isWaitlistMode && !isResetMode && (isForgotMode || passwordVisible) && (
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

        <p className="absolute bottom-8 left-0 w-full px-5 text-center text-muted-foreground text-sm">
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
      </div>

      <aside className="hidden min-h-svh flex-col items-center justify-center gap-6 border-l bg-muted/35 px-8 py-10 text-center dark:bg-white/[0.035] lg:flex">
        <ParticleCube className="h-[min(48vw,34rem)] w-[min(48vw,34rem)]" />
        <div className="w-full max-w-sm overflow-hidden">
          <div
            className={cn(
              "transition-all duration-700 ease-out",
              isHeadlineVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0",
            )}
          >
            <p className="text-balance text-xl font-semibold tracking-normal text-foreground sm:text-2xl">
              {loginHeadlines[activeHeadlineIndex]}
            </p>
          </div>
        </div>
      </aside>
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
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCountries = normalizedQuery
    ? countryOptions.filter((country) =>
        country.name.toLowerCase().includes(normalizedQuery),
      )
    : countryOptions;

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
          className={cn(selectTriggerVariants(), "min-w-0 cursor-pointer")}
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
          <HugeiconsIcon
            className={selectTriggerIconClassName}
            icon={ChevronsUpDown}
          />
        </PopoverTrigger>
        <PopoverPopup
          align="start"
          className="w-(--anchor-width) p-0"
          sideOffset={4}
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
            <div className="max-h-64 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    className={cn(
                      "flex min-h-8 w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-sm outline-none transition-[background-color,color]",
                      "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                      country.name === value && "bg-accent text-accent-foreground",
                    )}
                    key={country.name}
                    onClick={() => selectCountry(country.name)}
                    type="button"
                  >
                    <span aria-hidden="true">{country.flag}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {country.name}
                    </span>
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
