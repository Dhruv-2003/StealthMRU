import { StateMachine } from "@stackr/sdk/machine";
import genesisState from "../genesis-state.json";
import { reducers } from "./reducers";
import { StealthtRollup } from "./state";

const STATE_MACHINES = {
  StealthtRollup: "stealth",
};

const stealthStateMachine = new StateMachine({
  id: STATE_MACHINES.StealthtRollup,
  state: new StealthtRollup(genesisState.state),
  on: reducers,
});

export { STATE_MACHINES, stealthStateMachine };
