import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/api/auth/login`,
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

    // Allow only students
    if (data.user?.role !== "student") {
      return NextResponse.json(
        {
          detail: "Only students can log in through this portal.",
        },
        {
          status: 403,
        }
      );
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
        status: 500,
      }
    );
  }
}