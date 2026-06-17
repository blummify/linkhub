-- Document and enforce the valid values for User.role.
-- Existing rows only hold 'USER' or 'PRO', so this applies cleanly.
ALTER TABLE "User"
  ADD CONSTRAINT "User_role_check"
  CHECK ("role" IN ('USER', 'PRO', 'SUPER_ADMIN'));
