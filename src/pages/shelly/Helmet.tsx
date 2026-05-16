import { useEffect } from "react";

interface HelmetProps {
  title: string;
  description?: string;
}

/** Tiny helmet shim — sets document.title and meta description without a library. */
export function Helmet({ title, description }: HelmetProps) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let metaEl: HTMLMetaElement | null = null;
    let prevDesc: string | null = null;
    if (description) {
      metaEl = document.querySelector('meta[name="description"]');
      if (!metaEl) {
        metaEl = document.createElement("meta");
        metaEl.name = "description";
        document.head.appendChild(metaEl);
      }
      prevDesc = metaEl.content;
      metaEl.content = description;
    }

    return () => {
      document.title = prevTitle;
      if (metaEl && prevDesc !== null) metaEl.content = prevDesc;
    };
  }, [title, description]);

  return null;
}
