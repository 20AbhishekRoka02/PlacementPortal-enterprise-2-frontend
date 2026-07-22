import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie");
  try {
    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/api/auth/logout/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie ?? "",
        },
      }
    );

    const data = await backendResponse.json();

    // Forward backend errors unchanged
    if (!backendResponse.ok) {
      return NextResponse.json(data, {
        status: backendResponse.status,
      });
    }


    const response = NextResponse.json(data, {
      status: 200,
    });

    const setCookie = backendResponse.headers.get("set-cookie");
    if (setCookie) {
      response.headers.append("set-cookie", setCookie);
    }

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        detail: "Unable to connect to the authentication server.",
      },
      {
        status: 400,
      }
    );
  }
}