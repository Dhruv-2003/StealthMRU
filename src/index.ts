import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { ActionEvents } from "@stackr/sdk";
import { Playground } from "@stackr/sdk/plugins";
import { schemas } from "./actions.ts";
import {
  StealthAnnouncementMachine,
  StealthRegisterMachine,
  mru,
} from "./stealth.ts";
import { transitions } from "./reducers.ts";
import { transitions as AnnouncementTransitions } from "./stateMachine1/transitions.ts";
import { schemas as AnnouncementSchemas } from "./stateMachine1/actions.ts";

import { transitions as RegisterTranstitions } from "./stateMachine2/transitions.ts";
import { schemas as RegisterSchemas } from "./stateMachine2/actions.ts";

import cors from "cors";
console.log("Starting server...");

const stealthAnnouncementMachine =
  mru.stateMachines.get<StealthAnnouncementMachine>("stealthAnnouncement");

const stealthRegisterMachine =
  mru.stateMachines.get<StealthRegisterMachine>("stealthRegister");

const app = express();
app.use(express.json());
app.use(cors());

const playground = Playground.init(mru);

playground.addGetMethod(
  "/custom/hello",
  async (_req: Request, res: Response) => {
    res.send("Hello World");
  }
);

const { actions, chain, events } = mru;

app.get("/actions/:hash", async (req: Request, res: Response) => {
  const { hash } = req.params;
  const action = await actions.getByHash(hash);
  if (!action) {
    return res.status(404).send({ message: "Action not found" });
  }
  return res.send(action);
});

app.get("/blocks/:hash", async (req: Request, res: Response) => {
  const { hash } = req.params;
  const block = await chain.getBlockByHash(hash);
  return res.send(block);
});

app.post("/:actionName", async (req: Request, res: Response) => {
  const { actionName } = req.params;
  const actionReducer = transitions[actionName];

  if (!actionReducer) {
    res.status(400).send({ message: "no reducer for action" });
    return;
  }
  const action = actionName as keyof typeof schemas;

  const { msgSender, signature, payload } = req.body as {
    msgSender: string;
    signature: string;
    payload: any;
  };

  console.log(req.body);

  const schema = schemas[action];

  try {
    const newAction = schema.actionFrom({
      msgSender,
      signature,
      inputs: payload,
    });
    const ack = await mru.submitAction(actionName, newAction);
    res.status(201).send({ ack });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
  return;
});

app.post("/announcement/:actionName", async (req: Request, res: Response) => {
  const { actionName } = req.params;
  const actionReducer = AnnouncementTransitions[actionName];

  if (!actionReducer) {
    res.status(400).send({ message: "no reducer for action" });
    return;
  }
  const action = actionName as keyof typeof AnnouncementSchemas;

  const { msgSender, signature, payload } = req.body as {
    msgSender: string;
    signature: string;
    payload: any;
  };

  console.log(req.body);

  const schema = AnnouncementSchemas[action];

  try {
    const newAction = schema.actionFrom({
      msgSender,
      signature,
      inputs: payload,
    });
    const ack = await mru.submitAction(actionName, newAction);
    res.status(201).send({ ack });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
  return;
});

app.post("/register/:actionName", async (req: Request, res: Response) => {
  const { actionName } = req.params;
  const actionReducer = RegisterTranstitions[actionName];

  if (!actionReducer) {
    res.status(400).send({ message: "no reducer for action" });
    return;
  }
  const action = actionName as keyof typeof RegisterSchemas;

  const { msgSender, signature, payload } = req.body as {
    msgSender: string;
    signature: string;
    payload: any;
  };

  console.log(req.body);

  const schema = RegisterSchemas[action];

  try {
    const newAction = schema.actionFrom({
      msgSender,
      signature,
      inputs: payload,
    });
    const ack = await mru.submitAction(actionName, newAction);
    res.status(201).send({ ack });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
  return;
});

events.subscribe(ActionEvents.SUBMIT, (args) => {
  console.log("Submitted an action", args);
});

events.subscribe(ActionEvents.EXECUTION_STATUS, async (action) => {
  console.log("Submitted an action", action);
});

app.get("/", (_req: Request, res: Response) => {
  return res.send({
    announcements: stealthAnnouncementMachine?.state,
    registers: stealthRegisterMachine?.state,
  });
});

app.get("/announcements", (_req: Request, res: Response) => {
  const currentAnnouncement = stealthAnnouncementMachine?.state;
  return res.send({ currentAnnouncement });
});

app.get("/registers", (_req: Request, res: Response) => {
  const currentRegistry = stealthRegisterMachine?.state;
  return res.send({ currentRegistry });
});

app.get("/announcement/getRootHash", (_req: Request, res: Response) => {
  const currentRegistry = stealthAnnouncementMachine?.stateRootHash;
  return res.send({ currentRegistry });
});

app.get("/register/getRootHash", (_req: Request, res: Response) => {
  const currentRegistry = stealthRegisterMachine?.stateRootHash;
  return res.send({ currentRegistry });
});

type ActionName = keyof typeof schemas;
type AnnouncementActionName = keyof typeof AnnouncementSchemas;
type RegisterActionName = keyof typeof RegisterSchemas;

app.get("/getEIP712Types/:action", (_req: Request, res: Response) => {
  // @ts-ignore
  const { action }: { action: ActionName } = _req.params;

  const eip712Types = schemas[action].EIP712TypedData.types;
  return res.send({ eip712Types });
});

app.get(
  "/announcement/getEIP712Types/:action",
  (_req: Request, res: Response) => {
    // @ts-ignore
    const { action }: { action: AnnouncementActionName } = _req.params;

    const eip712Types = AnnouncementSchemas[action].EIP712TypedData.types;
    return res.send({ eip712Types });
  }
);

app.get("/register/getEIP712Types/:action", (_req: Request, res: Response) => {
  // @ts-ignore
  const { action }: { action: RegisterActionName } = _req.params;

  const eip712Types = RegisterSchemas[action].EIP712TypedData.types;
  return res.send({ eip712Types });
});

app.listen(5050, () => {
  console.log("listening on port 5050");
});
