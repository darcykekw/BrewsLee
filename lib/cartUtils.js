// Helpers for interacting with the cart cookie on the server or client side without context

export const readCart = () => {
  if (typeof document === "undefined") return [];
  const match = document.cookie.match(new RegExp('(^| )cart=([^;]+)'));
  if (match) {
    try {
      const data = JSON.parse(decodeURIComponent(match[2]));
      return data.items ? data.items : data;
    } catch (e) {
      console.error("Error parsing cart cookie", e);
      return [];
    }
  }
  return [];
};

export const writeCart = (cartData) => {
  if (typeof document === "undefined") return;
  const json = encodeURIComponent(JSON.stringify(cartData));
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  document.cookie = `cart=${json}; max-age=${maxAge}; path=/; samesite=lax`;
};

export const getCartCookie = (cookies) => {
  const cartStr = cookies.get("cart")?.value;
  if (!cartStr) return { items: [] };

  try {
    return JSON.parse(decodeURIComponent(cartStr));
  } catch (error) {
    console.error("Error parsing cart cookie:", error);
    return { items: [] };
  }
};

export const clearCartCookie = (cookies) => {
  cookies.set("cart", JSON.stringify({ items: [] }), { maxAge: -1, path: "/" });
};
