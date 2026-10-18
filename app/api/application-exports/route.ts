import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("access")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const jobId =
    body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    "job_id" in body
      ? body.job_id
      : null;

  if (typeof jobId !== "number" || !Number.isInteger(jobId) || jobId < 1) {
    return NextResponse.json(
      { message: "A valid job_id is required." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/job/application-exports/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ job_id: jobId }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error starting application export:", error);

    return NextResponse.json(
      { message: "Unable to start application export." },
      { status: 500 }
    );
  }
}