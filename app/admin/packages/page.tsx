import { CrudPage } from "@/components/admin/CrudPage";

export default function Page() {
  return (
    <CrudPage
      title="Packages"
      table="packages"
      primaryLabel="Package"
      fields={[
        { key: "name", label: "Package Name", placeholder: "Gold Wedding Package" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "price", label: "Price", type: "number" },
        { key: "featured", label: "Featured", type: "checkbox" },
        { key: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      ]}
      emptyMessage="No packages available."
      allowDelete={true}
    />
  );
}
