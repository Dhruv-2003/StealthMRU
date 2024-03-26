import { ActionSchema, SolidityType } from "@stackr/sdk";

export const registerSchema = new ActionSchema("register", {
  publicAddress: SolidityType.ADDRESS,
  stelathMetaAddress: SolidityType.BYTES,
  schemeId: SolidityType.UINT,
});

export const announceSchema = new ActionSchema("annuounce", {
  stealthAddress: SolidityType.ADDRESS,
  ephemeralPublicKey: SolidityType.BYTES,
  viewTag: SolidityType.UINT,
});

export const schemas = {
  announce: announceSchema,
  register: registerSchema,
};
