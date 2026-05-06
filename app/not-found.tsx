"use client";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-background text-on-background">
      <div className="max-w-xl w-full text-center bg-white rounded-xl shadow p-8 border">
        {/* Visual */}
        <div className="grid grid-cols-3 gap-2 mb-6 opacity-40">
          <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center">
            📦
          </div>
          <div className="h-24 bg-green-100 rounded-lg col-span-2 flex items-center justify-center">
            ⚠️
          </div>
          <div className="h-24 bg-gray-200 rounded-lg col-span-2 flex items-center justify-center">
            🔗
          </div>
          <div className="h-24 bg-gray-50 border rounded-lg flex items-center justify-center">
            🌍
          </div>
        </div>

        {/* Content */}
        <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
          Error 404
        </span>

        <h1 className="text-3xl font-bold mt-4">404 - Page non trouvée</h1>

        <p className="text-gray-600 mt-3">
          Désolé, la page que vous recherchez n&apos;existe plus ou a été
          déplacée.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link
            href="/"
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-center"
          >
            Retour à l&apos;accueil
          </Link>

        </div>

        {/* Image */}
        <div className="mt-8 rounded-xl overflow-hidden h-32 relative">
          <Image
            loading="eager"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu2otnZkCgLn6wfqSmEcA-VyGoyk19sGHJLRSvejiiHcPa9RAt7JYIiw6Ceo2GX4uz0xswbj2f1Eaf0TS37ZUGEg26vkWvGUo8nTgN7LjE0aeKF-kJLOfucxpQksdln5kQ1Q905eJn_iwCbhNj_9B3IuTKEYkzgrV46fkaZHAYpAHXMK5xb1GfYt1SQPnSsMn4lTw9PCghvVw0uFGREX3oZemUc-wDOd1uMGsh7YZCVfno2MXJpo2quOKy-5egtO7Snq7zeO9lnalY"
            alt="Illustration erreur"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
