import { useState } from "react";
import { ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/**
 * Clickable thumbnail that opens an enlarged view of the image in a dialog.
 * Used e.g. in the B2B ordering tables so partners can preview a product
 * photo bigger without leaving the page.
 */
const ImageZoom = ({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={`group relative block overflow-hidden cursor-zoom-in ${className}`}
        aria-label={`Zvětšit fotku: ${alt}`}
        title="Klikni pro zvětšení"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors">
          <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-3">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
          <p className="text-center text-sm text-muted-foreground">{alt}</p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageZoom;
