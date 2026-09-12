import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/api/auth/login/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json();

    // Forward backend errors unchanged
    if (!backendResponse.ok) {
      return NextResponse.json(data, {
        status: backendResponse.status,
      });
    }

    let is_staff = false;
    if (["admin", "placement_officer", "university"].includes(data.user?.role)) {
      is_staff = true;
    }

    const response = NextResponse.json({
      ...data,
      is_staff: is_staff
    }, {
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
        status: 500,
      }
    );
  }
}