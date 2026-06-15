type ToastProps = {
  type: "success" | "error" | "info";
  message: string;
};

const toneClasses: Record<ToastProps["type"], string> = {
  success: "border-green-500/40 bg-green-950/50 text-green-200",
  error: "border-red-500/40 bg-red-950/50 text-red-200",
  info: "border-blue-500/40 bg-blue-950/50 text-blue-200",
};

export function Toast({ type, message }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 top-20 z-[60] max-w-sm rounded-sm border px-4 py-3 text-sm shadow-2xl backdrop-blur-sm ${toneClasses[type]}`}
    >
      {message}
    </div>
  );
}
