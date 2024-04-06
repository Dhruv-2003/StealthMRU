import { Transitions, STF } from "@stackr/sdk/machine";
import { StealthRollup, StealthRegister as StateWrapper } from "./state";

export type RegisterInputType = {
  publicAddress: string;
  stelathMetaAddress: string;
  schemeId: number;
};

// --------- State Transition Handlers ---------

const registerHandler: STF<StealthRollup, RegisterInputType> = {
  handler: ({ inputs, state, msgSender }) => {
    const newRegister: RegisterInputType = {
      publicAddress: inputs.publicAddress,
      stelathMetaAddress: inputs.stelathMetaAddress,
      schemeId: inputs.schemeId,
    };
    state.registerLeaves.push(newRegister);
    return state;
  },
};
export const transitions: Transitions<StealthRollup> = {
  register: registerHandler,
};
