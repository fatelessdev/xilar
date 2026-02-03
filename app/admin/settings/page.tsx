import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure store settings and bargain limits
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bargain AI Settings</CardTitle>
            <CardDescription>
              Configure default bargain limits and AI behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Max Bargain Discount (%)</label>
                <input
                  type="number"
                  defaultValue={15}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum discount AI can offer by default
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">First Offer Percentage (%)</label>
                <input
                  type="number"
                  defaultValue={5}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Initial discount AI offers in bargain
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Coupon Validity (minutes)</label>
              <input
                type="number"
                defaultValue={30}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
              <p className="text-xs text-muted-foreground">
                How long bargain-generated coupons are valid
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>First-Time User Offer</CardTitle>
            <CardDescription>
              Configure welcome discount for new customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount (%)</label>
                <input
                  type="number"
                  defaultValue={10}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Order Value (₹)</label>
                <input
                  type="number"
                  defaultValue={2500}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>
              Basic store details shown to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Store Name</label>
              <input
                type="text"
                defaultValue="XILAR"
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <input
                type="email"
                placeholder="support@xilar.com"
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Phone</label>
              <input
                type="tel"
                placeholder="+91 8090644991"
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground">
          Note: Settings persistence will be implemented with database integration.
          Currently these are placeholder values.
        </div>
      </div>
    </div>
  );
}
