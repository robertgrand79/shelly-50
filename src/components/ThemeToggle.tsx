import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface Props {
  className?: string;
}

export default function ThemeToggle({ className = "" }: Props) {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-line-strong text-default hover:bg-gold-soft hover:text-strong transition-colors ${className}`}
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
