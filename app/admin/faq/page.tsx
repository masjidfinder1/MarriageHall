import { CrudPage } from "@/components/admin/CrudPage";

export default function Page() {
  return (
    <CrudPage
      title="FAQ"
      table="faqs"
      primaryLabel="FAQ"
      fields={[
        { key: "question", label: "Question", placeholder: "Do you offer catering?", type: "text" },
        { key: "answer", label: "Answer", type: "textarea", placeholder: "Yes, we offer complete catering services." },
        { key: "category", label: "Category", placeholder: "General", type: "text" },
        { key: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
        { key: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      ]}
      emptyMessage="No FAQ entries added yet."
      allowDelete={true}
    />
  );
}
