import { useState } from "react";
import { TurtleShellBackground } from "../layout";

const PASSWORD_HASH =
  "04ecf02145e8cd1d8734d63ac3611710428f18fb20091c7fb93dee5059ce3c29";

const SESSION_KEY = "ts_auth";

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface Props {
  children: React.ReactNode;
}

export function PasswordGate({ children }: Props) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1"
  );
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  if (authenticated) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;
    setChecking(true);
    setError(false);
    const hash = await sha256(value);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthenticated(true);
    } else {
      setError(true);
    }
    setValue("");
    setChecking(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <TurtleShellBackground />
      <div className="relative z-10 bg-card border border-border rounded-xl p-8 w-full max-w-sm shadow-xl">
        <h2 className="text-foreground text-xl font-semibold mb-1">
          Access required
        </h2>
        <p className="text-foreground/50 text-sm mb-6">
          Enter the password to continue.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            className="bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Password"
            autoFocus
            disabled={checking}
          />
          {error && (
            <p className="text-destructive text-xs -mt-1">
              Incorrect password.
            </p>
          )}
          <button
            type="submit"
            disabled={checking || !value}
            className="bg-primary text-primary-foreground rounded-full py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          >
            {checking ? "Checking…" : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}
