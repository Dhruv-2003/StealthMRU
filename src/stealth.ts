import { MicroRollup } from "@stackr/sdk";
import { stackrConfig } from "../stackr.config.ts";

import { schemas } from "./actions.ts";
import { stealthAnnouncementStateMachine } from "./stateMachine1/machines.stackr.ts";
import { stealthRegisterStateMachine } from "./stateMachine2/machines.stackr.ts";
// import { stealthStateMachine } from "./machines.stackr.ts";

type StealthAnnouncementMachine = typeof stealthAnnouncementStateMachine;
type StealthRegisterMachine = typeof stealthRegisterStateMachine;

const mru = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [...Object.values(schemas)],
  stateMachines: [stealthAnnouncementStateMachine, stealthRegisterStateMachine],
  isSandbox: true,
});

await mru.init();

export { StealthAnnouncementMachine, StealthRegisterMachine, mru };
