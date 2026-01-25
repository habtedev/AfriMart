import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminSetNewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    const t = searchParams.get("token") || "";
    const e = searchParams.get("email") || "";
    setToken(t);
    setEmail(e);
    if (!t || !e) {
      setMessage("Invalid or expired reset link. Please request a new password reset.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (!token || !email) {
      setMessage("Invalid or expired reset link. Please request a new password reset.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password updated successfully.");
        setTimeout(() => {
          router.push("/admin/login");
        }, 1200);
      } else {
        setMessage(data.message || "Failed to update password. The reset link may be invalid or expired. Please request a new password reset.");
      }
    } catch (err) {
      setMessage("Error updating password.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen mt-16">
      <h1 className="text-2xl font-bold mb-4">Set New Admin Password</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border p-2 w-full mb-4"
          disabled={!token || !email}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          className="border p-2 w-full mb-4"
          disabled={!token || !email}
        />
        <button
          type="submit"
          disabled={loading || !token || !email}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminSetNewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    const t = searchParams.get("token") || "";
    const e = searchParams.get("email") || "";
    setToken(t);
    setEmail(e);
    if (!t || !e) {
      setMessage("Invalid or expired reset link. Please request a new password reset.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (!token || !email) {
      setMessage("Invalid or expired reset link. Please request a new password reset.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password updated successfully.");
        setTimeout(() => {
          router.push("/admin/login");
        }, 1200);
      } else {
        setMessage(data.message || "Failed to update password. The reset link may be invalid or expired. Please request a new password reset.");
      }
    } catch (err) {
      setMessage("Error updating password.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen mt-16">
      <h1 className="text-2xl font-bold mb-4">Set New Admin Password</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border p-2 w-full mb-4"
          disabled={!token || !email}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          className="border p-2 w-full mb-4"
          disabled={!token || !email}
        />
        <button
          type="submit"
          disabled={loading || !token || !email}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
}
