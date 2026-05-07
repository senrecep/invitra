import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

// Change this to 'en' to make English the default
const DEFAULT_LOCALE = "tr";

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get("invitra-locale")?.value || DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
