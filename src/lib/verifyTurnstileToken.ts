export type TurnstileVerifyResult = {
  success: boolean
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
  "error-codes"?: string[]
}

export async function verifyTurnstileToken(
  token: string,
  remoteip?: string
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) throw new Error("TURNSTILE_SECRET_KEY is not set")

  const form = new URLSearchParams()
  form.set("secret", secret)
  form.set("response", token)
  if (remoteip) form.set("remoteip", remoteip)

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  })

  return res.json()
}
