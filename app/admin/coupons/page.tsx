import { getCoupons } from "@/lib/actions/admin";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DeleteCouponButton } from "./delete-button";

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">
            Manage discount codes and promotions
          </p>
        </div>
        <Link href="/admin/coupons/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </Link>
      </div>

      {/* Coupons Table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-medium">Code</th>
              <th className="text-left p-4 font-medium">Discount</th>
              <th className="text-left p-4 font-medium">Min Order</th>
              <th className="text-left p-4 font-medium">Usage</th>
              <th className="text-left p-4 font-medium">Valid Until</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No coupons yet. Create your first coupon to offer discounts.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b last:border-0">
                  <td className="p-4">
                    <span className="font-mono font-bold">{coupon.code}</span>
                    {coupon.isBargainGenerated && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (AI Generated)
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {coupon.discountType === "percentage" ? (
                      <>
                        {coupon.discountValue}%
                        {coupon.maxDiscount && (
                          <span className="text-muted-foreground text-sm">
                            {" "}(max ₹{coupon.maxDiscount})
                          </span>
                        )}
                      </>
                    ) : (
                      <>₹{coupon.discountValue}</>
                    )}
                  </td>
                  <td className="p-4">
                    {coupon.minOrderValue ? `₹${coupon.minOrderValue}` : "-"}
                  </td>
                  <td className="p-4">
                    {coupon.usedCount}
                    {coupon.maxUses && ` / ${coupon.maxUses}`}
                  </td>
                  <td className="p-4">
                    {coupon.validUntil
                      ? new Date(coupon.validUntil).toLocaleDateString()
                      : "No expiry"}
                  </td>
                  <td className="p-4">
                    {coupon.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                        Inactive
                      </span>
                    )}
                    {coupon.forNewUsersOnly && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        New Users
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <DeleteCouponButton couponId={coupon.id} couponCode={coupon.code} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
