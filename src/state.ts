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

// NOTE :  I have used the same naming as the older one but the meaning is same
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

export class StealthRollup extends State<StealthVariable, StealthTransport> {
  constructor(state: StealthVariable) {
    super(state);
  }

  transformer(): {
    wrap: () => StealthTransport;
    unwrap: (wrappedState: StealthTransport) => StealthVariable;
  } {
    return {
      wrap: () => {
        return new StealthTransport(
          this.state.announcements,
          this.state.registers
        );
      },
      unwrap: (wrappedState: StealthTransport) => {
        return {
          announcements: wrappedState.announcementLeaves,
          registers: wrappedState.registerLeaves,
        };
      },
    };
  }

  getRootHash(): BytesLike {
    if (
      this.state.announcements.length === 0 &&
      this.state.registers.length === 0
    ) {
      return ZeroHash;
    } else if (
      this.state.announcements.length != 0 &&
      this.state.registers.length === 0
    ) {
      return this.transformer().wrap().merkletreeAnnouncement.getHexRoot();
    } else if (
      this.state.announcements.length === 0 &&
      this.state.registers.length !== 0
    ) {
      return this.transformer().wrap().merkletreeRegister.getHexRoot();
    }

    const finalRoot = solidityPackedKeccak256(
      ["bytes", "bytes"],
      [
        this.transformer().wrap().merkletreeAnnouncement.getHexRoot(),
        this.transformer().wrap().merkletreeRegister.getHexRoot(),
      ]
    );

    return finalRoot;
  }
}
