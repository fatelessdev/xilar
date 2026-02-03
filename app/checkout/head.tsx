export default function Head() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <>
      <title>Checkout | XILAR</title>
      <meta name="description" content="Secure checkout for your XILAR order." />
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href={`${baseUrl}/checkout`} />
    </>
  );
}
