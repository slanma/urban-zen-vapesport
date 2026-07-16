import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";

const BUCKET = "order-attachments";
const MAX_MB = 5;

interface Props {
  /** Current stored public URL (or null). */
  value: string | null;
  /** Called with the new public URL after upload, or null after removal. */
  onChange: (url: string | null) => void;
  /** Subfolder in the bucket, e.g. "produkt/na-miru" or "objednavka". */
  folder?: string;
  /** Small helper text under the field. */
  hint?: string;
  disabled?: boolean;
}

/**
 * Nahrání jednoho obrázku do Supabase Storage (bucket "order-attachments").
 * Vrací veřejnou URL přes onChange. Zobrazuje náhled + tlačítko na odebrání.
 */
const ImageUpload = ({ value, onChange, folder = "objednavka", hint, disabled }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Nahrajte prosím obrázek (JPG, PNG…).");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Obrázek je příliš velký (max ${MAX_MB} MB).`);
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Obrázek nahrán.");
    } catch (e) {
      console.error("[ImageUpload] upload failed:", e);
      toast.error("Obrázek se nepodařilo nahrát.", {
        description: e instanceof Error ? e.message : "Zkuste to prosím znovu.",
      });
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={value}
          alt="Náhled nahraného obrázku"
          className="w-20 h-20 rounded-lg object-cover border border-border"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <X className="w-4 h-4" /> Odebrat obrázek
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="inline-flex items-center gap-2 h-11 px-4 rounded-md border border-border bg-background text-sm font-semibold text-foreground hover:bg-secondary transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {uploading ? "Nahrávám…" : "Nahrát obrázek"}
      </button>
      {hint && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
          <ImageIcon className="w-3.5 h-3.5" /> {hint}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
