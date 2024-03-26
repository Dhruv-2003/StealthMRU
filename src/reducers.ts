import { Reducers, STF } from "@stackr/sdk/machine";
import {
  StealthtRollup,
  StealthVariable as StateWrapper,
  Annoucement,
  Register,
} from "./state";

// --------- State Transition Handlers ---------

const announceHandler: STF<StealthtRollup> = {
  handler: ({ inputs, state, msgSender }) => {
    const newAnnouncement: Annoucement = {
      stealthAddress: inputs.stealthAddress,
      ephemeralPublicKey: inputs.ephemeralPublicKey,
      viewTag: inputs.viewTag,
    };

    state.announcementLeaves.push(newAnnouncement);
    return state;
  },
};

const registerHandler: STF<StealthtRollup> = {
  handler: ({ inputs, state, msgSender }) => {
    const newRegister: Register = {
      publicAddress: inputs.publicAddress,
      stelathMetaAddress: inputs.stelathMetaAddress,
      schemeId: inputs.schemeId,
    };
    state.registerLeaves.push(newRegister);
    return state;
  },
};

export const reducers: Reducers<StealthtRollup> = {
  announce: announceHandler,
  register: registerHandler,
};
