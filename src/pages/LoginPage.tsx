import { useState } from "react";
import type { FormEvent } from "react";
import { login } from "../services/authService";

type LoginPageProps = {
  onLoginSuccess: () => void | Promise<void>;
};

export default function LoginPage({
  onLoginSuccess
}: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
      await onLoginSuccess();
    } catch (error) {
      setError(
          error instanceof Error
              ? error.message
              : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="login-page">
        <div className="login-page__card">
          <div className="login-page__brand">
            <div className="login-page__brand-icon">
              STR
            </div>

            <h1>STR Mock</h1>
            <p>Administration Portal</p>
          </div>

          <div className="login-page__heading">
            <h2>Administrator Login</h2>
            <p>Sign in to manage STR applications.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-page__field">
              <label htmlFor="username">
                Username
              </label>

              <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  required
              />
            </div>

            <div className="login-page__field">
              <label htmlFor="password">
                Password
              </label>

              <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
              />
            </div>

            {error && (
                <div className="login-page__error" role="alert">
                  {error}
                </div>
            )}

            <button
                type="submit"
                className="login-page__submit"
                disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="login-page__footer">
            For Academic Demonstration Only
          </div>
        </div>
      </div>
  );
}
