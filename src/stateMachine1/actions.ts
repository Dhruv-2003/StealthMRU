import { ActionSchema, SolidityType } from "@stackr/sdk";

export const announceSchema = new ActionSchema("announce", {
  stealthAddress: SolidityType.ADDRESS,
  ephemeralPublicKey: SolidityType.BYTES,
  viewTag: SolidityType.UINT,
});

export const schemas = {
  announce: announceSchema,
};
