import { Transitions, STF } from "@stackr/sdk/machine";
import { StealthRollup, StealthVariable as StateWrapper } from "./state";

export type AnnoucementInputType = {
  stealthAddress: string;
  ephemeralPublicKey: string;
  viewTag: number;
};

export type RegisterInputType = {
  publicAddress: string;
  stelathMetaAddress: string;
  schemeId: number;
};

// --------- State Transition Handlers ---------

const announceHandler: STF<StealthRollup, AnnoucementInputType> = {
  handler: ({ inputs, state, msgSender }) => {
    const newAnnouncement: AnnoucementInputType = {
      stealthAddress: inputs.stealthAddress,
      ephemeralPublicKey: inputs.ephemeralPublicKey,
      viewTag: inputs.viewTag,
    };

    state.announcementLeaves.push(newAnnouncement);
    return state;
  },
};

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
  announce: announceHandler,
  register: registerHandler,
};
