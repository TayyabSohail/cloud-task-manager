// /app/api/auth.api.ts
import { POST } from "../utils/api.service";

interface LoginResponse {
  success: boolean;
  user: {
    username: string;
  };
}

export const login = async ({
  username,
  password,
  notification,
  setUsername,
}: {
  username: string;
  password: string;
  notification?: {
    error: ({ message }: { message: string }) => void;
  };
  setUsername: (username: string) => void;
}) => {
  try {
    const response = await POST<
      LoginResponse,
      { username: string; password: string }
    >("/api/signin", { username, password });

    if (response?.success) {
      const { user } = response;

      setUsername(user.username);

      if (typeof window !== "undefined") {
        localStorage.setItem("username", user.username);
      }

      window.location.href = "/dashboard";
    } else {
      notification?.error?.({
        message: "Incorrect username or password!",
      });
    }
  } catch (error) {
    notification?.error?.({
      message: "Login failed. Please try again.",
    });
  }
};
