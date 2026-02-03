export default function Head() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <>
      <title>Wishlist | XILAR</title>
      <meta name="description" content="Your saved items on XILAR." />
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href={`${baseUrl}/wishlist`} />
    </>
  );
}
