import type { ReactNode } from "react";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="flex items-center justify-between px-6 py-4">
        <Logo />
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
          </div>

          {children}

          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">{footer}</p>
        </div>
      </div>
    </div>
  );
}
