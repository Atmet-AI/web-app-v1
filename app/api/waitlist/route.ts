import { isRouteResponse, requireSuperAdmin } from "@/lib/api/auth";
import { badRequest, created, ok, readJson, serverError, stringValue } from "@/lib/api/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const context = await requireSuperAdmin();

    if (isRouteResponse(context)) {
      return context;
    }

    const { data, error } = await context.admin
      .from("waitlist_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ok({ requests: data });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const email = stringValue(body.email).toLowerCase();
    const fullName = stringValue(body.fullName);

    if (!email || !fullName) {
      return badRequest("Full name and email are required");
    }

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("waitlist_requests")
      .upsert(
        {
          email,
          full_name: fullName,
          company_name: stringValue(body.companyName) || null,
          company_size: stringValue(body.companySize) || null,
          work_type: stringValue(body.workType) || null,
          role_title: stringValue(body.roleTitle) || null,
          country: stringValue(body.country) || null,
          source: stringValue(body.source) || null,
          notes: stringValue(body.notes) || null,
          status: "pending",
        },
        { onConflict: "email" },
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return created({ request: data });
  } catch (error) {
    return serverError(error);
  }
}
