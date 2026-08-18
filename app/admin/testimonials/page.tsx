import { CrudPage } from "@/components/admin/CrudPage";

export default function Page() {
  return (
    <CrudPage
      title="Testimonials"
      table="testimonials"
      primaryLabel="Testimonial"
      fields={[
        { key: "name", label: "Name", placeholder: "Ayesha Khan" },
        { key: "role", label: "Role", placeholder: "Bride" },
        { key: "content", label: "Message", type: "textarea", placeholder: "Excellent venue and service" },
        { key: "rating", label: "Rating", type: "number" },
        { key: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      ]}
      emptyMessage="No testimonials added yet."
      allowDelete={true}
    />
  );
}
