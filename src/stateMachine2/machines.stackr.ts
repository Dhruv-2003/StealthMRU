import { StateMachine } from "@stackr/sdk/machine";
import genesisState from "../../genesis-state.json";
import { transitions } from "./transitions";
import { StealthRollup as StealthRegisterRollup } from "./state";

const STATE_MACHINES = {
  StealthRegister: "stealthRegister",
};

const stealthRegisterStateMachine = new StateMachine({
  id: STATE_MACHINES.StealthRegister,
  stateClass: StealthRegisterRollup,
  initialState: genesisState.state.registers,
  on: transitions,
});

export { STATE_MACHINES, stealthRegisterStateMachine };
