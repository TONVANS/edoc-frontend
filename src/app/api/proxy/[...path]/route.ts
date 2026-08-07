import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Prefer a non-public environment variable for the real backend URL,
// but fallback to NEXT_PUBLIC_API_URL if it's the only one available.
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    // Next.js 15+ expects `params` and `cookies()` to be awaited
    const resolvedParams = await params;
    const path = resolvedParams.path.join("/");
    
    const searchParams = request.nextUrl.searchParams.toString();
    const cleanBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    const targetUrl = `${cleanBackendUrl}/${path}${searchParams ? `?${searchParams}` : ""}`;

    const method = request.method;
    // Only read body for methods that support it
    const body = method !== "GET" && method !== "HEAD" ? await request.arrayBuffer() : undefined;

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const headers = new Headers();
    // Copy the incoming Content-Type if present
    const contentType = request.headers.get("Content-Type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    } else if (body) {
      headers.set("Content-Type", "application/json"); // Fallback
    }

    // Attach the Authorization header securely on the server
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Forward the request to the real backend
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      // Disable caching for proxy requests
      cache: "no-store",
      // Increase timeout for slow backend requests
      signal: AbortSignal.timeout(60000),
    });

    // Use arrayBuffer to safely forward any content type (JSON, images, PDFs, etc.)
    const responseData = await response.arrayBuffer();

    // Copy backend response headers to the client response
    const responseHeaders = new Headers(response.headers);
    // Remove headers that might cause issues when proxying
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new NextResponse(responseData, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json(
      { error: { message: "Internal Server Error from Proxy" } },
      { status: 500 }
    );
  }
}

// Export the supported HTTP methods
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
