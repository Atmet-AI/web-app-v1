type EmailAction = {
  href: string;
  label: string;
};

type EmailDetail = {
  label: string;
  value: string;
};

type AtmetEmailInput = {
  action: EmailAction;
  body: string[];
  details?: EmailDetail[];
  preheader: string;
  title: string;
};

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getBrandMarkUrl() {
  const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (!origin) {
    return "";
  }

  return `${origin}/Atmet%20Logos/Atmet%20Dark%20mode.svg`;
}

export function renderAtmetEmail({
  action,
  body,
  details = [],
  preheader,
  title,
}: AtmetEmailInput) {
  const escapedTitle = escapeHtml(title);
  const escapedPreheader = escapeHtml(preheader);
  const escapedActionHref = escapeHtml(action.href);
  const escapedActionLabel = escapeHtml(action.label);
  const brandMarkUrl = getBrandMarkUrl();
  const detailRows = details
    .map(
      (detail) => `
        <tr>
          <td style="padding:14px 0;border-top:1px solid #292524;color:#a8a29e;font-size:13px;line-height:20px;">${escapeHtml(detail.label)}</td>
          <td align="right" style="padding:14px 0;border-top:1px solid #292524;color:#fafaf9;font-size:13px;line-height:20px;font-weight:600;">${escapeHtml(detail.value)}</td>
        </tr>
      `,
    )
    .join("");
  const bodyHtml = body
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#d6d3d1;font-size:16px;line-height:26px;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>${escapedTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#0c0a09;color:#fafaf9;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapedPreheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0c0a09;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:48px 20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:608px;margin:0 auto;">
            <tr>
              <td style="padding:0 0 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width:36px;height:36px;border-radius:10px;background:#1c1917;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08);vertical-align:middle;text-align:center;">
                      ${
                        brandMarkUrl
                          ? `<img src="${escapeHtml(brandMarkUrl)}" width="18" height="18" alt="Atmet" style="display:block;margin:9px auto;border:0;outline:none;">`
                          : `<span style="display:block;color:#fafaf9;font-size:14px;font-weight:700;line-height:36px;">A</span>`
                      }
                    </td>
                    <td style="padding-left:12px;color:#fafaf9;font-size:15px;font-weight:700;letter-spacing:0;">Atmet</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="border-radius:28px;background:#1c1917;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08),0 24px 80px rgba(0,0,0,0.38);overflow:hidden;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:40px 40px 28px;">
                      <p style="margin:0 0 12px;color:#78716c;font-size:13px;line-height:20px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Workspace intelligence</p>
                      <h1 style="margin:0;color:#fafaf9;font-size:32px;line-height:38px;font-weight:750;letter-spacing:0;">${escapedTitle}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 40px 34px;">
                      ${bodyHtml}
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:28px;width:100%;">
                        <tr>
                          <td>
                            <a href="${escapedActionHref}" style="display:block;border-radius:14px;background:#fafaf9;color:#1c1917;font-size:16px;font-weight:700;line-height:22px;padding:15px 18px;text-align:center;text-decoration:none;box-shadow:0 1px 0 rgba(255,255,255,0.4) inset,0 10px 30px rgba(0,0,0,0.22);">${escapedActionLabel}</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ${
                    detailRows
                      ? `<tr>
                          <td style="padding:0 40px 26px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${detailRows}</table>
                          </td>
                        </tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding:24px 40px 38px;background:#171412;border-top:1px solid #292524;">
                      <p style="margin:0 0 10px;color:#a8a29e;font-size:13px;line-height:20px;">If the button does not work, paste this secure link into your browser:</p>
                      <p style="margin:0;color:#78716c;font-size:12px;line-height:19px;word-break:break-all;">${escapedActionHref}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 4px 0;color:#78716c;font-size:12px;line-height:19px;text-align:center;">
                This email was sent by Atmet. The link is private and should not be forwarded.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function waitlistApprovalEmail({
  actionLink,
  fullName,
}: {
  actionLink: string;
  fullName: string;
}) {
  return renderAtmetEmail({
    action: {
      href: actionLink,
      label: "Complete signup",
    },
    body: [
      fullName
        ? `Hi ${fullName}, your Atmet access request was approved.`
        : "Your Atmet access request was approved.",
      "Use the secure link below to create your password and finish setting up your workspace.",
    ],
    preheader: "Your Atmet access request was approved.",
    title: "Your access is approved",
  });
}

export function workspaceInviteEmail({
  actionLink,
  inviterName,
  role,
  workspaceName,
}: {
  actionLink: string;
  inviterName: string;
  role: string;
  workspaceName: string;
}) {
  return renderAtmetEmail({
    action: {
      href: actionLink,
      label: "Accept invite",
    },
    body: [
      `${inviterName || "A workspace admin"} invited you to join ${workspaceName || "an Atmet workspace"}.`,
      "Accept the invite to finish your profile and start working with the team.",
    ],
    details: [
      { label: "Workspace", value: workspaceName || "Atmet workspace" },
      { label: "Role", value: role || "member" },
    ],
    preheader: `You were invited to ${workspaceName || "an Atmet workspace"}.`,
    title: "Workspace invite",
  });
}

export function passwordResetEmail({ actionLink }: { actionLink: string }) {
  return renderAtmetEmail({
    action: {
      href: actionLink,
      label: "Reset password",
    },
    body: [
      "We received a request to reset your Atmet password.",
      "Use the secure link below to choose a new password. If you did not request this, you can ignore this email.",
    ],
    preheader: "Reset your Atmet password.",
    title: "Reset your password",
  });
}
