// import type { NextApiRequest, NextApiResponse } from 'next'
import { type NextRequest } from "next/server"

type ResponseData = {
  message: string
}

type LoginData = {
  email: string,
  password: string
}

export async function POST(
  req: NextRequest,
  // res: extApiResponse<ResponseData>
) {

  // console.log(res)
  const reqDict = await req.json()
  console.log(reqDict);
  
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
    
    // const result = await res.json();
    // console.log("Login success:", result);
    
    // Redirect or store token here
    const result = await res.json();
    console.log("Login success:", result);
    return Response.json({token: result.token,  message: result.message })

  } catch (err) {
    console.error("Login error:", err);
  }

}