import { NextResponse, type NextRequest } from "next/server"

export async function POST(
  req: NextRequest,
) {
  const reqDict = await req.json()

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: reqDict.email,
        password: reqDict.password,
      }),
    });

    if (!res.ok) throw new Error("Login failed");

    // Redirect or store token here
    const result = await res.json();

    const response = NextResponse.json(result, {
      status: res.status,
    })
    // Forward every Set-Cookie header from Django
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.append("set-cookie", setCookie);
    }
    return response;

  } catch (err) {
    console.error("Login error:", err);
  }

}