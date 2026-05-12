"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  className?: string;
};

export default function UserAvatar({ src, name, email, className }: Props) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;
  const letter = (name?.trim()?.[0] || email?.trim()?.[0] || "?").toUpperCase();

  if (showImg) {
    return (
      <Image
        src={src!}
        alt=""
        width={96}
        height={96}
        unoptimized
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-primary/15 text-primary font-semibold ${className ?? ""}`}
      aria-hidden
    >
      {letter}
    </div>
  );
}
