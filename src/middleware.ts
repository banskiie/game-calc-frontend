import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

const rolePaths: Record<string, string> = {
    admin: "/admin",
    user: "/users",
}

export async function middleware(req: NextRequest){
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET})
    const requestPath = req.nextUrl.pathname

    if (!token) {
        if (requestPath !== "/") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    return NextResponse.next()
    }

    const now = Math.floor(Date.now() / 1000)
    const exp = token?.exp as number

    if( exp && now >= exp) {
        return NextResponse.redirect(new URL("/", req.url))
    }
    
    const role = (token.user as { role: string}).role
    const expectedPath = rolePaths[role] || "/"

    if (requestPath === "/") {
        return NextResponse.redirect(new URL(expectedPath, req.url))
    }

    if (!requestPath.startsWith(expectedPath)){
        return NextResponse.redirect(new URL(expectedPath, req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/", "/admin/:path*", "/users/:path*"],
}
