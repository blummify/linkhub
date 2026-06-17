/**
 * One-off seed for the first super-admin account.
 *
 *   npm run seed:super-admin
 *
 * Reads SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD from the environment (the npm
 * script loads .env via Node's --env-file). The password is bcrypt-hashed before
 * storage and the row is upserted, so running it twice never creates a duplicate.
 *
 * There is intentionally no UI to create, edit, or delete super-admin accounts.
 */
import bcrypt from "bcryptjs";
// Relative import (not the @/ alias) so the script runs under tsx without path resolution.
import { db } from "../lib/db";
import { SUPER_ADMIN } from "../lib/roles";

async function main() {
  const rawEmail = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!rawEmail || !password) {
    throw new Error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must both be set (see .env.example)."
    );
  }

  // Stored lower-cased so login (which normalises the same way) never mismatches on casing.
  const email = rawEmail.toLowerCase();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: SUPER_ADMIN,
      emailVerified: new Date(),
    },
    update: {
      passwordHash,
      role: SUPER_ADMIN,
    },
  });

  console.log(`✓ Super admin ready: ${user.email} (id ${user.id})`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Failed to seed super admin:", err);
    process.exit(1);
  });
