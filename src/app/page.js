import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center">
        <h1 className="mb-6 text-4xl font-bold text-zinc-800 dark:text-zinc-200">
          Welcome to the E-commerce Store
        </h1>
        <Image
          src="/ecommerce-illustration.png"
          alt="E-commerce Illustration"
          width={400}
          height={300}
        />
      </div>
    </div>
  );
}
