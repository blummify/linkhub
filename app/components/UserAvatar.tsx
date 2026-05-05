"use client";

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
      <img
        src={src!}
        alt=""
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
