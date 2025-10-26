import { NextResponse } from "next/server";
import { getUserFromHeaders } from "@/lib/auth/server-verify";

export async function GET(request: Request) {
  try {
    const decoded = await getUserFromHeaders(request.headers);

    if (!decoded) {
      return NextResponse.json(
        { authenticated: false },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify authentication.",
      },
      {
        status: 500,
      },
    );
  }
}
