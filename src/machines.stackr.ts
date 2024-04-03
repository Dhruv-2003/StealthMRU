import { StateMachine } from "@stackr/sdk/machine";
import genesisState from "../genesis-state.json";
import { transitions } from "./reducers";
import { StealthRollup } from "./state";

const STATE_MACHINES = {
  StealthRollup: "stealth",
};

const stealthStateMachine = new StateMachine({
  id: STATE_MACHINES.StealthRollup,
  stateClass: StealthRollup,
  initialState: genesisState.state,
  on: transitions,
});

export { STATE_MACHINES, stealthStateMachine };
