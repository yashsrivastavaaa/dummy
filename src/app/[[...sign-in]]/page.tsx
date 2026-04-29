"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        // Store user info in cookie for middleware
        document.cookie = `user=${JSON.stringify(result.user)}; path=/; max-age=86400`;

        // Also store in localStorage for client-side access
        localStorage.setItem("user", JSON.stringify(result.user));

        toast.success(`Welcome ${result.user.name || result.user.username}!`);
        router.push(`/${result.user.role}`);
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
      <form
        onSubmit={handleLogin}
        className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-4 w-96"
      >
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Image src="/logo.png" alt="" width={24} height={24} />
          SchooLama
        </h1>
        <h2 className="text-gray-400 text-sm">Sign in to your account</h2>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">
            Username
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="p-2 rounded-md ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="p-2 rounded-md ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-400 text-white p-2 rounded-md font-semibold hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded-md">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <div className="space-y-1">
            <p>👤 Admin: <span className="font-mono bg-white px-2 py-1 rounded">admin1</span></p>
            <p>👨‍🏫 Teacher: <span className="font-mono bg-white px-2 py-1 rounded">teacher1</span></p>
            <p>👨‍🎓 Student: <span className="font-mono bg-white px-2 py-1 rounded">student1</span></p>
            <p>👨‍👩‍👧 Parent: <span className="font-mono bg-white px-2 py-1 rounded">parentId1</span></p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
