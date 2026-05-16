import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface-2 group-[.toaster]:text-strong group-[.toaster]:border-line-strong group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted",
          actionButton: "group-[.toast]:bg-cta",
          cancelButton: "group-[.toast]:bg-gold-soft group-[.toast]:text-default",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
