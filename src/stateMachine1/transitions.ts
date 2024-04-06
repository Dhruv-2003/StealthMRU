import { Transitions, STF } from "@stackr/sdk/machine";
import { StealthRollup, StealthAnnoncement as StateWrapper } from "./state";

export type AnnoucementInputType = {
  stealthAddress: string;
  ephemeralPublicKey: string;
  viewTag: number;
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

export const transitions: Transitions<StealthRollup> = {
  announce: announceHandler,
};
