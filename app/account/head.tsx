export default function Head() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <>
      <title>Account | XILAR</title>
      <meta name="description" content="Sign in or manage your XILAR account." />
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href={`${baseUrl}/account`} />
    </>
  );
}
