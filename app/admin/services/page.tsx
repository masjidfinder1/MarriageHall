import { CrudPage } from "@/components/admin/CrudPage";

export default function Page() {
  return (
    <CrudPage
      title="Services"
      table="services"
      primaryLabel="Service"
      fields={[
        { key: "name", label: "Service Name", placeholder: "Catering" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "price", label: "Price", type: "number" },
        { key: "category", label: "Category", placeholder: "Food" },
        { key: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      ]}
      emptyMessage="No services added yet."
      allowDelete={true}
    />
  );
}
