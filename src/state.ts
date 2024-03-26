import { State } from "@stackr/sdk/machine";
import { BytesLike, ZeroHash, solidityPackedKeccak256 } from "ethers";
import { MerkleTree } from "merkletreejs";

export type Annoucement = {
  stealthAddress: string;
  ephemeralPublicKey: string;
  viewTag: number;
};

export type Register = {
  publicAddress: string;
  stelathMetaAddress: string;
  schemeId: number;
};

export type StealthVariable = {
  announcements: Annoucement[];
  registers: Register[];
};

class StealthTransport {
  public merkletreeAnnouncement: MerkleTree;
  public announcementLeaves: Annoucement[];

  public merkletreeRegister: MerkleTree;
  public registerLeaves: Register[];

  constructor(announcements: Annoucement[], registers: Register[]) {
    let { merkletreeAnnouncement, merkletreeRegister } = this.createTree(
      announcements,
      registers
    );

    this.merkletreeAnnouncement = merkletreeAnnouncement;
    this.merkletreeRegister = merkletreeRegister;

    this.announcementLeaves = announcements;
    this.registerLeaves = registers;
  }

  createTree(announcements: Annoucement[], registers: Register[]) {
    const hashedLeavesAnnouncement = announcements.map((leaf: Annoucement) => {
      return solidityPackedKeccak256(
        ["address", "bytes", "uint"],
        [leaf.stealthAddress, leaf.ephemeralPublicKey, leaf.viewTag]
      );
    });

    let merkletreeAnnouncement = new MerkleTree(
      hashedLeavesAnnouncement,
      solidityPackedKeccak256
    );

    const hashedLeavesRegister = registers.map((leaf: Register) => {
      return solidityPackedKeccak256(
        ["address", "bytes", "uint"],
        [leaf.publicAddress, leaf.stelathMetaAddress, leaf.schemeId]
      );
    });

    let merkletreeRegister = new MerkleTree(
      hashedLeavesRegister,
      solidityPackedKeccak256
    );

    return { merkletreeAnnouncement, merkletreeRegister };
  }
}

export class StealthtRollup extends State<StealthVariable, StealthTransport> {
  constructor(state: StealthVariable) {
    super(state);
  }

  wrap(state: StealthVariable): StealthTransport {
    const newTree = new StealthTransport(state.announcements, state.registers);
    return newTree;
  }

  clone(): State<StealthVariable, StealthTransport> {
    return new StealthtRollup(this.unwrap());
  }

  unwrap(): StealthVariable {
    return {
      announcements: this.wrappedState.announcementLeaves,
      registers: this.wrappedState.registerLeaves,
    };
  }

  calculateRoot(): BytesLike {
    if (
      this.wrappedState.announcementLeaves.length === 0 &&
      this.wrappedState.registerLeaves.length === 0
    ) {
      return ZeroHash;
    } else if (
      this.wrappedState.announcementLeaves.length !== 0 &&
      this.wrappedState.registerLeaves.length === 0
    ) {
      return this.wrappedState.merkletreeAnnouncement.getHexRoot();
    } else if (
      this.wrappedState.announcementLeaves.length === 0 &&
      this.wrappedState.registerLeaves.length !== 0
    ) {
      return this.wrappedState.merkletreeRegister.getHexRoot();
    }

    const finalRoot = solidityPackedKeccak256(
      ["string", "string"],
      [
        this.wrappedState.merkletreeAnnouncement.getHexRoot(),
        this.wrappedState.merkletreeRegister.getHexRoot(),
      ]
    );

    return finalRoot;
  }
}
