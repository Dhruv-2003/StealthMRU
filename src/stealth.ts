import { MicroRollup } from "@stackr/sdk";
import { stackrConfig } from "../stackr.config.ts";

import { schemas } from "./actions.ts";
import { stealthStateMachine } from "./machines.stackr.ts";

type StealthMachine = typeof stealthStateMachine;

const mru = await MicroRollup({
  config: stackrConfig,
  actions: [...Object.values(schemas)],
  isSandbox: true,
});

mru.stateMachines.add(stealthStateMachine);

await mru.init();

export { StealthMachine, mru };
