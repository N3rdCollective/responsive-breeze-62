
import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function Toaster({ ...props }: React.ComponentProps<typeof SonnerToaster>) {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster
      theme={theme as any}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          title: "font-semibold text-foreground", // Add title styling
        },
      }}
      {...props}
    />
  );
}
