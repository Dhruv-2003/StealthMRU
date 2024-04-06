import { ActionSchema, SolidityType } from "@stackr/sdk";

export const registerSchema = new ActionSchema("register", {
  publicAddress: SolidityType.ADDRESS,
  stelathMetaAddress: SolidityType.BYTES,
  schemeId: SolidityType.UINT,
});

export const schemas = {
  register: registerSchema,
};
