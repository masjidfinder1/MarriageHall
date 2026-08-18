import { CrudPage } from "@/components/admin/CrudPage";

export default function Page() {
  return (
    <CrudPage
      title="Coupons"
      table="coupons"
      primaryLabel="Coupon"
      fields={[
        { key: "code", label: "Coupon Code", placeholder: "SAVE500", type: "text" },
        {
          key: "discount_type",
          label: "Discount Type",
          type: "select",
          defaultValue: "percentage",
          options: [
            { label: "Percentage", value: "percentage" },
            { label: "Fixed Amount", value: "fixed" },
          ],
        },
        { key: "discount_value", label: "Discount Value", type: "number", defaultValue: 0 },
        { key: "min_amount", label: "Minimum Amount", type: "number", defaultValue: 0 },
        { key: "max_discount", label: "Max Discount", type: "number", defaultValue: 0 },
        { key: "usage_limit", label: "Usage Limit", type: "number" },
        { key: "usage_count", label: "Usage Count", type: "number", defaultValue: 0 },
        { key: "is_active", label: "Active", type: "checkbox", defaultValue: true },
      ]}
      emptyMessage="No coupons created yet."
      allowDelete={true}
    />
  );
}
