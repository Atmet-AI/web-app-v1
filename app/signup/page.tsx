"use client";

import {
  EyeIcon,
  FileUploadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const profileRoles = [
  "Founder",
  "Product builder",
  "Operations",
  "Engineering",
  "Research",
  "Other",
];

const phoneCountries = [
  { code: "+962", flag: "🇯🇴", name: "Jordan" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
];

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [profileRole, setProfileRole] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(phoneCountries[0].name);
  const [phoneNumber, setPhoneNumber] = useState("");

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

  const isInvitedUser =
    searchParams.get("invite") === "1" ||
    searchParams.get("type") === "invite";

  function submitSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === 1) {
      if (password && confirmPassword) {
        setStep(2);
      }
      return;
    }

    if (step === 2) {
      if (isInvitedUser) {
        setStep(3);
        return;
      }

      if (workspaceName.trim()) {
        setStep(3);
      }
      return;
    }
  }

  return (
    <main className="grid min-h-svh bg-background px-5 text-foreground">
      <section
        className={cn(
          "mx-auto flex w-full flex-col justify-center py-20",
          step === 1 ? "max-w-sm" : "max-w-3xl",
        )}
      >
        {step > 1 && <SignupProgress currentStep={step === 2 ? 2 : 3} />}

        <div className="mb-8 text-center">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">
            {step === 1 && "Create your password"}
            {step === 2 &&
              (isInvitedUser
                ? "Accept workspace invite"
                : "Create your workspace")}
            {step === 3 && "Complete your profile"}
          </h1>
          <p className="mt-3 text-muted-foreground text-sm">
            {step === 1 && "Choose a password for future sign-ins."}
            {step === 2 &&
              (isInvitedUser
                ? "Join the workspace you were invited to."
                : "Give your workspace a name to get started.")}
            {step === 3 && "Tell us a bit about yourself."}
          </p>
        </div>

        <form className="grid" onSubmit={submitSignup}>
          {step === 1 && (
            <div className="grid gap-5">
              <PasswordField
                id="signup-password"
                label="Password"
                onToggle={() => setShowPassword((current) => !current)}
                onValueChange={setPassword}
                placeholder="Create a password"
                showPassword={showPassword}
                value={password}
              />
              <PasswordField
                id="signup-confirm-password"
                label="Confirm password"
                onToggle={() => setShowConfirmPassword((current) => !current)}
                onValueChange={setConfirmPassword}
                placeholder="Confirm your password"
                showPassword={showConfirmPassword}
                value={confirmPassword}
              />
              <Button className="mt-3 w-full" type="submit">
                Create password
                <span className="grid size-5 place-items-center rounded-md bg-primary-foreground/12 text-sm leading-none">
                  ↵
                </span>
              </Button>
            </div>
          )}

          {step === 2 && isInvitedUser && (
            <div className="grid gap-8">
              <div className="flex items-center justify-center gap-5 py-7">
                <div className="grid size-20 shrink-0 place-items-center rounded-2xl border border-input bg-background p-4 shadow-xs/5 dark:bg-input/32">
                  <Image
                    alt="Atmet Workspace"
                    className="size-full object-contain dark:invert"
                    height={48}
                    src="/Atmet Logos/Atmet Dark mode.svg"
                    width={48}
                  />
                </div>
                <div className="font-medium text-muted-foreground text-xl">
                  x
                </div>
                <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-primary text-2xl text-primary-foreground font-semibold">
                  AH
                </div>
              </div>

              <Button className="w-full" type="submit">
                Accept invite
                <span className="grid size-5 place-items-center rounded-md bg-primary-foreground/12 text-sm leading-none">
                  ↵
                </span>
              </Button>
            </div>
          )}

          {step === 2 && !isInvitedUser && (
            <div className="grid gap-8">
              <div className="flex items-center gap-4">
                <div className="grid size-16 shrink-0 place-items-center rounded-xl border border-input bg-background font-semibold text-muted-foreground shadow-xs/5 dark:bg-input/32">
                  W
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-muted-foreground">
                    Workspace image
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Optional image
                  </p>
                </div>
                <button
                  className="grid size-11 place-items-center rounded-lg text-foreground outline-none transition-[background-color,scale] duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
                  type="button"
                >
                  <HugeiconsIcon className="size-5" icon={FileUploadIcon} />
                </button>
              </div>

              <div className="grid gap-1.5">
                <Label
                  className="text-muted-foreground"
                  htmlFor="workspace-name"
                >
                  Workspace name
                </Label>
                <Input
                  autoComplete="organization"
                  id="workspace-name"
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                  type="text"
                  value={workspaceName}
                />
              </div>

              <Button className="w-full" type="submit">
                Continue
                <span className="grid size-5 place-items-center rounded-md bg-primary-foreground/12 text-sm leading-none">
                  ↵
                </span>
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6">
              <div className="flex items-center gap-4">
                <div className="grid size-16 shrink-0 place-items-center rounded-xl border border-input bg-background font-semibold text-muted-foreground shadow-xs/5 dark:bg-input/32">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-muted-foreground">
                    Profile image
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Optional image
                  </p>
                </div>
                <button
                  className="grid size-11 place-items-center rounded-lg text-foreground outline-none transition-[background-color,scale] duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
                  type="button"
                >
                  <HugeiconsIcon className="size-5" icon={FileUploadIcon} />
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2 md:gap-x-4">
                <div className="grid gap-1.5">
                  <Label
                    className="text-muted-foreground"
                    htmlFor="first-name"
                  >
                    First name
                  </Label>
                  <Input
                    autoComplete="given-name"
                    id="first-name"
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Anas"
                    required
                    type="text"
                    value={firstName}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label
                    className="text-muted-foreground"
                    htmlFor="second-name"
                  >
                    Second name
                  </Label>
                  <Input
                    autoComplete="family-name"
                    id="second-name"
                    onChange={(event) => setSecondName(event.target.value)}
                    placeholder="Second name"
                    type="text"
                    value={secondName}
                  />
                </div>

                <div className="grid gap-1.5 md:col-span-2">
                  <Label className="text-muted-foreground">
                    Your role{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <SimpleSelect
                    onValueChange={setProfileRole}
                    options={profileRoles}
                    placeholder="Select your role..."
                    value={profileRole}
                  />
                </div>

                <div className="grid gap-1.5 md:col-span-2">
                  <Label className="text-muted-foreground">
                    Phone number{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <div className="grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <PhoneCountrySelect
                      onValueChange={setPhoneCountry}
                      value={phoneCountry}
                    />
                    <Input
                      autoComplete="tel-national"
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      placeholder="79 000 0000"
                      type="tel"
                      value={phoneNumber}
                    />
                  </div>
                </div>
              </div>

              <Button className="mt-2 w-full" type="submit">
                Complete setup
                <span className="grid size-5 place-items-center rounded-md bg-primary-foreground/12 text-sm leading-none">
                  ↵
                </span>
              </Button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}

function SignupProgress({ currentStep }: { currentStep: 2 | 3 }) {
  return (
    <div className="mb-14 grid grid-cols-2 gap-3">
      {[2, 3].map((stepNumber) => (
        <div
          className={cn(
            "h-1 rounded-full transition-[background-color,opacity] duration-300",
            stepNumber <= currentStep
              ? "bg-foreground"
              : "bg-muted-foreground/24",
          )}
          key={stepNumber}
        />
      ))}
    </div>
  );
}

function PasswordField({
  id,
  label,
  onToggle,
  onValueChange,
  placeholder,
  showPassword,
  value,
}: {
  id: string;
  label: string;
  onToggle: () => void;
  onValueChange: (value: string) => void;
  placeholder: string;
  showPassword: boolean;
  value: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-muted-foreground" htmlFor={id}>
        {label}
      </Label>
      <div className="relative">
        <Input
          className="[&_input]:pe-10"
          id={id}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          required
          type={showPassword ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 end-0 grid w-10 place-items-center text-muted-foreground outline-none transition-[color,scale] duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
          onClick={onToggle}
          type="button"
        >
          <HugeiconsIcon className="size-4.5" icon={EyeIcon} />
        </button>
      </div>
    </div>
  );
}

function SimpleSelect({
  onValueChange,
  options,
  placeholder,
  value,
}: {
  onValueChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  return (
    <Select
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
  );
}

function PhoneCountrySelect({
  onValueChange,
  value,
}: {
  onValueChange: (value: string) => void;
  value: string;
}) {
  const selectedCountry =
    phoneCountries.find((country) => country.name === value) ??
    phoneCountries[0];

  return (
    <Select
      onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
      value={value || phoneCountries[0].name}
    >
      <SelectTrigger>
        <SelectValue>
          <span className="inline-flex min-w-0 items-center gap-2">
            <span aria-hidden="true">{selectedCountry.flag}</span>
            <span className="truncate">
              {selectedCountry.name} {selectedCountry.code}
            </span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectPopup>
        {phoneCountries.map((country) => (
          <SelectItem key={country.name} value={country.name}>
            <span className="inline-flex min-w-0 items-center gap-2">
              <span aria-hidden="true">{country.flag}</span>
              <span className="truncate">
                {country.name} {country.code}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}
