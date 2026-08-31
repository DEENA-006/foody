"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setServerMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setServerMessage(data.error || "Something went wrong.");
      } else {
        setStatus("success");
        setServerMessage(data.message);
        setForm({ firstName: "", lastName: "", email: "", message: "" });
      }
    } catch {
      setStatus("error");
      setServerMessage("Network error. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card p-8 rounded-3xl shadow-sm border border-border"
      noValidate
    >
      {/* Status Banner */}
      {status === "success" && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-6">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{serverMessage}</p>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{serverMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="contact-firstName" className="block text-sm font-medium mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-firstName"
            type="text"
            name="firstName"
            required
            value={form.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-brand outline-none transition-shadow"
            placeholder="John"
          />
        </div>
        <div>
          <label htmlFor="contact-lastName" className="block text-sm font-medium mb-2">
            Last Name
          </label>
          <input
            id="contact-lastName"
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-brand outline-none transition-shadow"
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="contact-email" className="block text-sm font-medium mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-brand outline-none transition-shadow"
          placeholder="john@example.com"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="contact-message" className="block text-sm font-medium mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          value={form.message}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-brand outline-none resize-none transition-shadow"
          placeholder="How can we help you?"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
