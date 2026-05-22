import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, EyeOff, PackageX, Check, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { products as allProducts, type Product } from "@/data/products";
import { isServiceCategory } from "@/lib/serviceCategories";
import { useProductOverrides } from "@/hooks/useProductOverrides";
import { toast } from "@/hooks/use-toast";

interface Props {
  filter: "products" | "services";
  title: string;
}

export const AdminProductTable = ({ filter, title }: Props) => {
  const list = useMemo(
    () =>
      allProducts.filter((p) =>
        filter === "services"
          ? isServiceCategory(p.categoryLabel)
          : !isServiceCategory(p.categoryLabel),
      ),
    [filter],
  );

  const { get, upsert, loading } = useProductOverrides();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState("");
  const priceRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q),
    );
  }, [list, query]);

  useEffect(() => {
    if (editingPrice && priceRef.current) {
      priceRef.current.focus();
      priceRef.current.select();
    }
  }, [editingPrice]);

  const toggleSelected = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const handleToggle = async (
    p: Product,
    field: "visible" | "in_stock",
    value: boolean,
  ) => {
    try {
      await upsert(p.id, { [field]: value });
    } catch {
      toast({ title: "Uložení selhalo", variant: "destructive" });
    }
  };

  const startEditPrice = (p: Product) => {
    const o = get(p.id);
    setEditingPrice(p.id);
    setPriceDraft(String(o.price_override ?? p.price));
  };

  const commitPrice = async (p: Product) => {
    const parsed = parseInt(priceDraft, 10);
    if (Number.isFinite(parsed) && parsed > 0 && parsed !== p.price) {
      try {
        await upsert(p.id, { price_override: parsed });
        toast({ title: "Cena uložena" });
      } catch {
        toast({ title: "Uložení selhalo", variant: "destructive" });
      }
    } else if (parsed === p.price) {
      await upsert(p.id, { price_override: null });
    }
    setEditingPrice(null);
  };

  const bulkHide = async () => {
    await Promise.all(Array.from(selected).map((id) => upsert(id, { visible: false })));
    toast({ title: `Skryto ${selected.size} produktů` });
    setSelected(new Set());
  };
  const bulkOutOfStock = async () => {
    await Promise.all(Array.from(selected).map((id) => upsert(id, { in_stock: false })));
    toast({ title: `Označeno jako vyprodáno: ${selected.size}` });
    setSelected(new Set());
  };
  const bulkDelete = async () => {
    const count = selected.size;
    if (!window.confirm(`Opravdu smazat ${count} ${count === 1 ? "položku" : "položek"}? Položky budou skryty z e-shopu i z XML feedů.`)) return;
    await Promise.all(
      Array.from(selected).map((id) => upsert(id, { visible: false, in_stock: false })),
    );
    toast({ title: `Smazáno ${count} ${count === 1 ? "položka" : "položek"}` });
    setSelected(new Set());
  };

  return (
    <section className="p-8 max-w-[1400px]">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-1">{title}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {filtered.length} z {list.length} položek
        {loading && " · načítám stav…"}
      </p>

      {/* Sticky search */}
      <div className="sticky top-0 z-10 bg-[hsl(0_0%_98%)] -mx-8 px-8 pb-4 pt-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledat podle názvu nebo kódu…"
            className="w-full pl-10 pr-9 py-2.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              aria-label="Vymazat hledání"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-3 py-3 w-10">
                <Checkbox
                  checked={selected.size > 0 && selected.size === filtered.length}
                  onCheckedChange={toggleAll}
                  aria-label="Vybrat vše"
                />
              </th>
              <th className="px-3 py-3 w-14">Foto</th>
              <th className="px-3 py-3 font-semibold">Název</th>
              <th className="px-3 py-3 font-semibold w-32">Cena</th>
              <th className="px-3 py-3 font-semibold w-28 text-center">Viditelné</th>
              <th className="px-3 py-3 font-semibold w-28 text-center">Skladem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const o = get(p.id);
              const isSel = selected.has(p.id);
              const isEditing = editingPrice === p.id;
              const effectivePrice = o.price_override ?? p.price;
              return (
                <tr
                  key={p.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                    isSel ? "bg-primary/5" : ""
                  } ${!o.visible ? "opacity-60" : ""}`}
                >
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={isSel}
                      onCheckedChange={() => toggleSelected(p.id)}
                      aria-label={`Vybrat ${p.name}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      to={`/admin/produkty/${p.id}`}
                      className="font-medium text-foreground hover:text-primary line-clamp-1"
                    >
                      {p.name}
                    </Link>
                    <div className="text-xs text-muted-foreground font-mono">{p.id}</div>
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          ref={priceRef}
                          type="number"
                          value={priceDraft}
                          onChange={(e) => setPriceDraft(e.target.value)}
                          onBlur={() => commitPrice(p)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitPrice(p);
                            if (e.key === "Escape") setEditingPrice(null);
                          }}
                          className="w-20 px-2 py-1 border border-primary rounded text-sm focus:outline-none"
                        />
                        <span className="text-xs text-muted-foreground">Kč</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditPrice(p)}
                        className="text-left font-semibold text-foreground hover:text-primary"
                        title="Klikněte pro úpravu"
                      >
                        {effectivePrice.toLocaleString("cs-CZ")} Kč
                        {o.price_override != null && (
                          <span className="ml-1 text-[10px] text-primary font-medium">●</span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Switch
                      checked={o.visible}
                      onCheckedChange={(v) => handleToggle(p, "visible", v)}
                      aria-label="Viditelnost v e-shopu"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Switch
                      checked={o.in_stock}
                      onCheckedChange={(v) => handleToggle(p, "in_stock", v)}
                      aria-label="Skladová dostupnost"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Žádné položky neodpovídají hledání.
          </div>
        )}
      </div>

      {/* Floating bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-foreground text-background rounded-full shadow-2xl px-4 py-2.5 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-sm font-medium flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Vybráno {selected.size}
          </span>
          <div className="w-px h-5 bg-background/20" />
          <Button
            size="sm"
            variant="ghost"
            onClick={bulkHide}
            className="text-background hover:bg-background/10 hover:text-background gap-1.5"
          >
            <EyeOff className="w-4 h-4" /> Skrýt vybrané
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={bulkOutOfStock}
            className="text-background hover:bg-background/10 hover:text-background gap-1.5"
          >
            <PackageX className="w-4 h-4" /> Označit jako vyprodané
          </Button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-background/60 hover:text-background ml-1"
            aria-label="Zrušit výběr"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};

export const AdminProducts = () => (
  <AdminProductTable filter="products" title="Produkty" />
);

export const AdminServices = () => (
  <AdminProductTable filter="services" title="Služby (AI & Golf)" />
);
