import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(
            `${process.env.BACKEND_URL}/api/auth/password/reset/confirm/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        return NextResponse.json(
            {
                detail: "Something went wrong.",
            },
            {
                status: 500,
            }
        );
    }
}