import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { ActionEvents } from "@stackr/sdk";
import { Playground } from "@stackr/sdk/plugins";
import { schemas } from "./actions.ts";
import { StealthMachine, mru } from "./stealth.ts";
import { transitions } from "./reducers.ts";
import cors from "cors";
console.log("Starting server...");

const stealthMachine = mru.stateMachines.get<StealthMachine>("stealth");

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

events.subscribe(ActionEvents.SUBMIT, (args) => {
  console.log("Submitted an action", args);
});

events.subscribe(ActionEvents.EXECUTION_STATUS, async (action) => {
  console.log("Submitted an action", action);
});

app.get("/", (_req: Request, res: Response) => {
  return res.send({ state: stealthMachine?.state });
});

app.get("/announcements", (_req: Request, res: Response) => {
  const currentAnnouncement = stealthMachine?.state.announcements;
  return res.send({ currentAnnouncement });
});

app.get("/registers", (_req: Request, res: Response) => {
  const currentRegistry = stealthMachine?.state.registers;
  return res.send({ currentRegistry });
});

app.get("/getRootHash", (_req: Request, res: Response) => {
  const currentRegistry = stealthMachine?.stateRootHash;
  return res.send({ currentRegistry });
});

type ActionName = keyof typeof schemas;

app.get("/getEIP712Types/:action", (_req: Request, res: Response) => {
  // @ts-ignore
  const { action }: { action: ActionName } = _req.params;

  const eip712Types = schemas[action].EIP712TypedData.types;
  return res.send({ eip712Types });
});

app.listen(5050, () => {
  console.log("listening on port 5050");
});
