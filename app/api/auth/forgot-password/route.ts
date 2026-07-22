import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const csrfToken = cookieStore.get("csrftoken")?.value;
    const cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

    try {
        const body = await request.json();

        const response = await fetch(
            `${process.env.BACKEND_URL}/api/auth/password/reset/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": cookieHeader,
                    "X-CSRFToken": csrfToken ?? "",
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        return NextResponse.json(
            data,
            { status: response.status }
        );

    } catch (error) {
        return NextResponse.json(
            {
                detail: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}