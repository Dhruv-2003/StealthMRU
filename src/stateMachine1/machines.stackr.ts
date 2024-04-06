import { StateMachine } from "@stackr/sdk/machine";
import genesisState from "../../genesis-state.json";
import { transitions } from "./transitions";
import { StealthRollup as StealthAnnouncementRollup } from "./state";

const STATE_MACHINES = {
  StealthAnnouncementRollup: "stealthAnnouncement",
};

const stealthAnnouncementStateMachine = new StateMachine({
  id: STATE_MACHINES.StealthAnnouncementRollup,
  stateClass: StealthAnnouncementRollup,
  initialState: genesisState.state.announcements,
  on: transitions,
});

export { STATE_MACHINES, stealthAnnouncementStateMachine };
