CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('tshirt', 'cargo', 'jogger', 'shirt', 'jeans', 'hoodie', 'jacket', 'shorts', 'accessory');--> statement-breakpoint
CREATE TYPE "public"."product_gender" AS ENUM('men', 'women', 'unisex');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bargain_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"coupon_code" text NOT NULL,
	"cart_value" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"discount_type" text DEFAULT 'fixed' NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"max_discount" numeric(10, 2),
	"min_order_value" numeric(10, 2),
	"valid_from" timestamp DEFAULT now() NOT NULL,
	"valid_until" timestamp,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"for_new_users_only" boolean DEFAULT false NOT NULL,
	"user_id" text,
	"is_bargain_generated" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"product_name" text NOT NULL,
	"product_image" text,
	"size" text NOT NULL,
	"color" text,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"shipping" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"coupon_code" text,
	"coupon_discount" numeric(10, 2),
	"bargain_discount" numeric(10, 2),
	"bargain_score" integer,
	"shipping_address" json,
	"payment_method" text,
	"payment_status" text DEFAULT 'pending',
	"cod_fee" numeric(10, 2),
	"cod_advance_paid" numeric(10, 2),
	"cod_remaining_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"mrp" numeric(10, 2) NOT NULL,
	"selling_price" numeric(10, 2) NOT NULL,
	"max_bargain_discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"category" "product_category" NOT NULL,
	"gender" "product_gender" NOT NULL,
	"tags" json DEFAULT '[]'::json,
	"stock" integer DEFAULT 0 NOT NULL,
	"images" json DEFAULT '[]'::json,
	"fabric" text,
	"gsm" integer,
	"care_instructions" json DEFAULT '[]'::json,
	"features" json DEFAULT '[]'::json,
	"sizes" json DEFAULT '["S","M","L","XL"]'::json,
	"colors" json DEFAULT '[]'::json,
	"is_new" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"phone" text,
	"orders_count" integer DEFAULT 0 NOT NULL,
	"total_spent" numeric(10, 2) DEFAULT '0' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bargain_sessions" ADD CONSTRAINT "bargain_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;