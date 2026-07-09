"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, type = "text", id, className, ...rest }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        <label
          htmlFor={inputId}
          className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a7070] mb-1.5"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isPassword && show ? "text" : type}
            className={[
              "w-full border rounded-xl px-4 py-3 text-[14px] text-[#1d3435] placeholder:text-[#c0b8b0] bg-white",
              "transition-all duration-200 focus:outline-none",
              error
                ? "border-red-300 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
                : "border-[#e2ddd8] focus:border-[#3d7b74] focus:shadow-[0_0_0_4px_rgba(61,123,116,0.12)]",
              isPassword ? "pr-11" : "",
              className ?? "",
            ].join(" ")}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8a0ba] hover:text-[#3d7b74] transition-colors"
              aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {show ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-[12px] text-red-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
