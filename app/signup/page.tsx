"use client";

import {
  EyeIcon,
  FileUploadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
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

const MAX_CLIENT_AVATAR_SIZE = 512;
const CLIENT_AVATAR_QUALITY = 0.82;

type InviteContext = {
  admin?: {
    avatarUrl?: string;
    name?: string;
  };
  workspace?: {
    avatarUrl?: string;
    name?: string;
  };
};

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupShell />}>
      <SignupContent />
    </Suspense>
  );
}

function SignupShell() {
  return <main className="min-h-svh bg-background" />;
}

function SignupContent() {
  const router = useRouter();
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
  const [errorMessage, setErrorMessage] = useState("");
  const [inviteContext, setInviteContext] = useState<InviteContext | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);

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

  const inviteParam = searchParams.get("invite") ?? "";
  const inviteToken =
    inviteParam && inviteParam !== "1" && inviteParam !== "true"
      ? inviteParam
      : "";
  const isInvitedUser = Boolean(inviteParam) || searchParams.get("type") === "invite";

  useEffect(() => {
    if (!isInvitedUser) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();
    if (inviteToken) {
      params.set("token", inviteToken);
    }

    async function loadInviteContext() {
      try {
        const response = await fetch(`/api/auth/invite-context?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        setInviteContext((await response.json()) as InviteContext);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error(error);
        }
      }
    }

    void loadInviteContext();

    return () => controller.abort();
  }, [inviteToken, isInvitedUser]);

  async function uploadProfileImage(file: File | undefined) {
    if (!file || isUploadingProfileImage) {
      return;
    }

    setErrorMessage("");
    setIsUploadingProfileImage(true);

    try {
      const uploadFile = await resizeAvatarFile(file);
      const formData = new FormData();
      formData.set("target", "profile");
      formData.set("file", uploadFile);

      const response = await fetch("/api/uploads/avatar", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        avatarUrl?: string;
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Could not upload profile image.");
        return;
      }

      setProfileAvatarUrl(payload.avatarUrl ?? "");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not upload profile image.",
      );
    } finally {
      setIsUploadingProfileImage(false);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }
    }
  }

  async function submitSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (step === 1) {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }

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

    if (step === 3) {
      const fullName = [firstName.trim(), secondName.trim()]
        .filter(Boolean)
        .join(" ");

      if (!firstName.trim()) {
        setErrorMessage("First name is required.");
        return;
      }

      setIsSubmitting(true);

      try {
        const selectedCountry =
          phoneCountries.find((country) => country.name === phoneCountry) ??
          phoneCountries[0];
        const response = await fetch("/api/auth/complete-signup", {
          body: JSON.stringify({
            inviteToken,
            invited: isInvitedUser,
            password,
            profile: {
              avatarUrl: profileAvatarUrl,
              fullName,
              phoneNumber: phoneNumber.trim()
                ? `${selectedCountry.code} ${phoneNumber.trim()}`
                : "",
              roleTitle: profileRole,
            },
            workspace: isInvitedUser
              ? {}
              : {
                  name: workspaceName,
                },
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });

        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };

        if (!response.ok) {
          setErrorMessage(payload.error ?? "Could not complete setup.");
          return;
        }

        router.replace("/");
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Could not complete setup.",
        );
      } finally {
        setIsSubmitting(false);
      }
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
          {errorMessage && (
            <div className="mb-5 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {errorMessage}
            </div>
          )}

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
              <Button className="mt-3 w-full" disabled={isSubmitting} type="submit">
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
                <SignupAvatarPreview
                  fallback={getInitials(
                    inviteContext?.workspace?.name ?? "Workspace",
                  )}
                  name={inviteContext?.workspace?.name ?? "Workspace"}
                  src={inviteContext?.workspace?.avatarUrl}
                />
                <div className="font-medium text-muted-foreground text-xl">
                  x
                </div>
                <SignupAvatarPreview
                  fallback={getInitials(
                    inviteContext?.admin?.name ?? "Workspace admin",
                  )}
                  name={inviteContext?.admin?.name ?? "Workspace admin"}
                  src={inviteContext?.admin?.avatarUrl}
                />
              </div>

              <Button className="w-full" disabled={isSubmitting} type="submit">
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

              <Button className="w-full" disabled={isSubmitting} type="submit">
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
                <SignupAvatarPreview
                  className="size-16 rounded-xl text-xl"
                  fallback={getInitials(firstName || "A")}
                  loading={isUploadingProfileImage}
                  name="Profile image"
                  src={profileAvatarUrl}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-muted-foreground">
                    Profile image
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Optional image
                  </p>
                </div>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    void uploadProfileImage(event.target.files?.[0])
                  }
                  ref={profileImageInputRef}
                  type="file"
                />
                <button
                  className="grid size-11 place-items-center rounded-lg text-foreground outline-none transition-[background-color,opacity,scale] duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isUploadingProfileImage}
                  onClick={() => profileImageInputRef.current?.click()}
                  type="button"
                  aria-label={
                    isUploadingProfileImage
                      ? "Uploading profile image"
                      : "Upload profile image"
                  }
                >
                  {isUploadingProfileImage ? (
                    <Spinner className="size-5" />
                  ) : (
                    <HugeiconsIcon className="size-5" icon={FileUploadIcon} />
                  )}
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

              <Button
                className="mt-2 w-full"
                disabled={isSubmitting || isUploadingProfileImage}
                type="submit"
              >
                {isSubmitting ? "Completing..." : "Complete setup"}
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

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length > 1
      ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
      : parts[0]?.slice(0, 2) ?? "A";

  return initials.toUpperCase();
}

async function resizeAvatarFile(file: File) {
  if (file.type === "image/svg+xml" || file.size < 640 * 1024) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not read profile image."));
      element.src = imageUrl;
    });

    const scale = Math.min(
      1,
      MAX_CLIENT_AVATAR_SIZE / Math.max(image.naturalWidth, image.naturalHeight),
    );

    if (scale >= 1) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", CLIENT_AVATAR_QUALITY);
    });

    if (!blob) {
      return file;
    }

    return new File([blob], "avatar.jpg", {
      lastModified: Date.now(),
      type: "image/jpeg",
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function SignupAvatarPreview({
  className,
  fallback,
  loading = false,
  name,
  src,
}: {
  className?: string;
  fallback: string;
  loading?: boolean;
  name: string;
  src?: string;
}) {
  return (
    <div
      className={cn(
        "grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-input bg-background text-2xl font-semibold text-foreground shadow-xs/5 dark:bg-input/32",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={name}
          className="size-full object-cover object-center"
          src={src}
        />
      ) : (
        fallback
      )}
      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-background/58 backdrop-blur-[1px]">
          <Spinner className="size-5 text-foreground" />
        </div>
      )}
    </div>
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
          tabIndex={-1}
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
