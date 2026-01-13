import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";

let handlers: ReturnType<typeof toNextJsHandler> | null = null;

async function getHandlers() {
  if (!handlers) {
    const { auth } = await import("@/lib/auth");
    handlers = toNextJsHandler(auth);
  }
  return handlers;
}

export async function GET(request: NextRequest) {
  const { GET } = await getHandlers();
  return GET(request);
}

export async function POST(request: NextRequest) {
  const { POST } = await getHandlers();
  return POST(request);
}
