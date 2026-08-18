interface AlertProps {
  children: React.ReactNode;
}

export function Alert({ children }: AlertProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {children}
    </div>
  );
}
