import { Buffer } from "node:buffer";
import {
  isRouteResponse,
  requireUser,
  requireWorkspacePermission,
} from "@/lib/api/auth";
import { badRequest, ok, serverError, stringValue } from "@/lib/api/http";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/admin";

const AVATAR_BUCKET = "atmet-avatars";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function extensionFromFile(file: File) {
  const fallback = file.type === "image/svg+xml" ? "svg" : "png";
  const nameExtension = file.name.split(".").pop()?.toLowerCase();

  if (nameExtension && /^[a-z0-9]+$/.test(nameExtension)) {
    return nameExtension;
  }

  return fallback;
}

async function ensureAvatarBucket(auth: Awaited<ReturnType<typeof requireUser>>) {
  if (isRouteResponse(auth)) {
    return auth;
  }

  const { error: getError } = await auth.admin.storage.getBucket(AVATAR_BUCKET);

  if (!getError) {
    return null;
  }

  const { error: createError } = await auth.admin.storage.createBucket(
    AVATAR_BUCKET,
    {
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
      fileSizeLimit: MAX_AVATAR_BYTES,
      public: true,
    },
  );

  return createError;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const target = stringValue(formData.get("target"));
    const workspaceId = stringValue(formData.get("workspaceId"));
    const file = formData.get("file");

    if (target !== "profile" && target !== "workspace") {
      return badRequest("Upload target must be profile or workspace.");
    }

    if (!(file instanceof File) || file.size === 0) {
      return badRequest("Choose an avatar image to upload.");
    }

    if (!file.type.startsWith("image/")) {
      return badRequest("Avatar must be an image file.");
    }

    if (file.size > MAX_AVATAR_BYTES) {
      return badRequest("Avatar image must be 5MB or smaller.");
    }

    const auth =
      target === "workspace"
        ? await requireWorkspacePermission(workspaceId, "workspace.update")
        : await requireUser();

    if (isRouteResponse(auth)) {
      return auth;
    }

    if (hasSupabaseServiceRoleKey()) {
      const bucketError = await ensureAvatarBucket(auth);
      if (bucketError) {
        throw bucketError;
      }
    }

    const extension = extensionFromFile(file);
    const ownerKey = target === "workspace" ? workspaceId : auth.user.id;
    const path = `${target}/${ownerKey}/${crypto.randomUUID()}.${extension}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await auth.supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      if (uploadError.message.toLowerCase().includes("bucket not found")) {
        return badRequest(
          `Storage bucket "${AVATAR_BUCKET}" was not found. Create it in Supabase Storage or set the real service_role key so the app can create it.`,
        );
      }

      throw uploadError;
    }

    const { data: publicUrlData } = auth.supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(path);
    const avatarUrl = publicUrlData.publicUrl;

    if (target === "workspace") {
      const { data: workspace, error } = await auth.supabase
        .from("workspaces")
        .update({ avatar_url: avatarUrl })
        .eq("id", workspaceId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return ok({ avatarUrl, workspace });
    }

    const { data: profile, error } = await auth.supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", auth.user.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok({ avatarUrl, profile });
  } catch (error) {
    return serverError(error);
  }
}
