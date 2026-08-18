"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export type CrudField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "color" | "select";
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: Array<{ label: string; value: string }>;
};

interface CrudPageProps {
  title: string;
  table: string;
  primaryLabel: string;
  fields: CrudField[];
  emptyMessage?: string;
  allowCreate?: boolean;
  allowDelete?: boolean;
}

const normalizeDefaults = (fields: CrudField[]) =>
  Object.fromEntries(
    fields.map((field) => [
      field.key,
      field.defaultValue ??
        (field.type === "checkbox" ? false : field.type === "number" ? 0 : ""),
    ])
  );

export function CrudPage({
  title,
  table,
  primaryLabel,
  fields,
  emptyMessage = "No records yet.",
  allowCreate = true,
  allowDelete = false,
}: CrudPageProps) {
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [form, setForm] = useState<Record<string, any>>(normalizeDefaults(fields));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(`Failed to load ${title.toLowerCase()}`);
      setItems([]);
    } else {
      setItems(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, [table]);

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = createClient();
    setSaving(true);

    const hasEmptyFields = fields.some((field) => {
      if (field.key === "id" || field.key === "created_at" || field.key === "updated_at") {
        return false;
      }

      if (field.type === "checkbox") {
        return false;
      }

      const value = form[field.key];
      return value === null || value === undefined || value === "";
    });

    if (hasEmptyFields) {
      toast.error("Please fill in all required fields");
      setSaving(false);
      return;
    }

    const payload: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.key !== "id" && field.key !== "created_at" && field.key !== "updated_at") {
        const value = form[field.key];

        if (field.type === "number") {
          payload[field.key] = value === null || value === undefined || value === "" ? 0 : Number(value);
        } else if (field.type === "checkbox") {
          payload[field.key] = Boolean(value);
        } else if (field.type === "select") {
          payload[field.key] = value ?? field.options?.[0]?.value ?? "";
        } else {
          payload[field.key] = value ?? "";
        }
      }
    });

    const { error } = await supabase.from(table).insert([payload]).select();

    if (error) {
      console.error("Insert error:", error);
      toast.error(`Failed to create ${primaryLabel.toLowerCase()}: ${error.message}`);
    } else {
      toast.success(`${primaryLabel} created successfully`);
      setForm(normalizeDefaults(fields));
      await loadItems();
    }

    setSaving(false);
  };

  const removeItem = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${primaryLabel.toLowerCase()}?`)) return;

    const supabase = createClient();
    setSaving(true);

    try {
      if (table === "packages") {
        await supabase.from("bookings").update({ package_id: null, updated_at: new Date().toISOString() }).eq("package_id", id);
      }

      if (table === "venues") {
        await supabase.from("bookings").update({ venue_id: null, updated_at: new Date().toISOString() }).eq("venue_id", id);
      }

      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) {
        console.error("Delete error:", error);
        toast.error(`Failed to delete ${primaryLabel.toLowerCase()}: ${error.message}`);
      } else {
        toast.success(`${primaryLabel} deleted`);
        await loadItems();
      }
    } finally {
      setSaving(false);
    }
  };

  const visibleFields = useMemo(() => fields.filter((field) => field.key !== "id"), [fields]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">Manage {primaryLabel.toLowerCase()} entries</p>
        </div>
      </div>

      {allowCreate && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Plus className="w-5 h-5 text-primary" />
            Add {primaryLabel}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {visibleFields.map((field) => (
              <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-foreground mb-2">{field.label}</label>

                {field.type === "textarea" ? (
                  <textarea
                    value={form[field.key] ?? ""}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none resize-none"
                  />
                ) : field.type === "checkbox" ? (
                  <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-background border border-input">
                    <input
                      type="checkbox"
                      checked={Boolean(form[field.key])}
                      onChange={(event) => updateField(field.key, event.target.checked)}
                    />
                    <span className="text-sm text-foreground">{field.label}</span>
                  </label>
                ) : field.type === "select" ? (
                  <select
                    value={form[field.key] ?? (field.options?.[0]?.value ?? "")}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "number" ? (
                  <input
                    type="number"
                    value={form[field.key] ?? 0}
                    onChange={(event) => updateField(field.key, Number(event.target.value))}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
                  />
                ) : field.type === "color" ? (
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form[field.key] ?? "#D4AF37"}
                      onChange={(event) => updateField(field.key, event.target.value)}
                      className="w-12 h-11 rounded-lg border border-input bg-transparent"
                    />
                    <input
                      type="text"
                      value={form[field.key] ?? ""}
                      onChange={(event) => updateField(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1 px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form[field.key] ?? ""}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-input focus:border-primary outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-border p-4 bg-background">
                <div className="space-y-1">
                  {visibleFields.slice(0, 3).map((field) => (
                    <p key={field.key} className="text-sm text-foreground">
                      <span className="font-medium text-muted-foreground">{field.label}:</span>{" "}
                      {Array.isArray(item[field.key])
                        ? item[field.key].join(", ")
                        : typeof item[field.key] === "boolean"
                          ? item[field.key] ? "Yes" : "No"
                          : item[field.key] ?? "-"}
                    </p>
                  ))}
                </div>
                {allowDelete && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
