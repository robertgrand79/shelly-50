import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#1a1410] group-[.toaster]:text-amber-50 group-[.toaster]:border-amber-500/30 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-amber-200/70",
          actionButton: "group-[.toast]:bg-amber-400 group-[.toast]:text-[#0d0a08]",
          cancelButton: "group-[.toast]:bg-amber-500/10 group-[.toast]:text-amber-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
