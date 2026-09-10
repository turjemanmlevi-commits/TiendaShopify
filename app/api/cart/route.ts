import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  changeCart,
  getCart,
  isCheckoutEnabled,
  ShopifyError,
} from "@/lib/shopify";
import { hasValidOrigin, parseCartAction } from "@/lib/graphql-validation";

export const dynamic = "force-dynamic";
const COOKIE = "haunted_tips_cart";
const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
function failure(error: unknown) {
  return NextResponse.json(
    {
      error:
        error instanceof ShopifyError
          ? error.message
          : "Something went wrong. Please try again.",
    },
    { status: error instanceof ShopifyError ? error.status : 500, headers },
  );
}
export async function GET() {
  if (!isCheckoutEnabled)
    return NextResponse.json({ cart: null, configured: false }, { headers });
  try {
    const jar = await cookies();
    const id = jar.get(COOKIE)?.value;
    const cart = id ? await getCart(id) : null;
    if (id && !cart) jar.delete(COOKIE);
    return NextResponse.json({ cart, configured: true }, { headers });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(req: Request) {
  if (
    !hasValidOrigin(
      req.headers.get("origin"),
      req.url,
      req.headers.get("host"),
    ) ||
    req.headers.get("sec-fetch-site") === "cross-site"
  )
    return NextResponse.json(
      { error: "Please update your bag from this website." },
      { status: 403, headers },
    );
  if (!isCheckoutEnabled)
    return NextResponse.json(
      {
        configured: false,
        error:
          "Shopping is not open yet. We are confirming product availability and delivery before accepting orders.",
      },
      { status: 503, headers },
    );
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 415, headers },
    );
  if (Number(req.headers.get("content-length") || 0) > 4096)
    return NextResponse.json(
      { error: "Request is too large." },
      { status: 413, headers },
    );
  try {
    const body = await req.text();
    if (body.length > 4096)
      return NextResponse.json(
        { error: "Request is too large." },
        { status: 413, headers },
      );
    let input: unknown;
    try {
      input = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400, headers },
      );
    }
    const action = parseCartAction(input);
    if (!action)
      return NextResponse.json(
        { error: "Check the item and quantity, then try again." },
        { status: 400, headers },
      );
    const jar = await cookies();
    const result = await changeCart(jar.get(COOKIE)?.value, action);
    jar.set(COOKIE, result.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 10,
    });
    return NextResponse.json(
      { cart: result.cart, configured: true, warnings: result.warnings },
      { headers },
    );
  } catch (error) {
    return failure(error);
  }
}
