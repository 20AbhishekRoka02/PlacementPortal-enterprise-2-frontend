// import type { NextApiRequest, NextApiResponse } from 'next'
import { type NextRequest } from "next/server"


export async function GET(
  req: NextRequest,
  // res: extApiResponse<ResponseData>
) {
  const cookie = req.headers.get("cookie");
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/auth/user/`, {
      method: "GET",
      credentials:"include",
      headers: { 
        "Content-Type": "application/json",
        Cookie: cookie ?? "",
      },
    });
    console.log("res: ", res)
    if (!res.ok) {
      console.log("res status: ", res.status);

      throw new Error("Profile fetch failed");
    } 
    
    // const result = await res.json();
    // console.log("Login success:", result);
    
    // Redirect or store token here
    const result = await res.json();
    result["status"] = 200;
    console.log("Result is: ", result);
    return Response.json(result);

  } catch (err) {
    console.error("Profile fetch error:", err);
    
    return Response.json({"message":err, "status": 400})
  }

}