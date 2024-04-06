import { State } from "@stackr/sdk/machine";
import {
  BytesLike,
  ZeroHash,
  solidityPacked,
  solidityPackedKeccak256,
} from "ethers";
import { MerkleTree } from "merkletreejs";

export type Register = {
  publicAddress: string;
  stelathMetaAddress: string;
  schemeId: number;
};

export type StealthRegister = Register[];

// NOTE :  I have used the same naming as the older one but the meaning is same
class StealthTransport {
  public merkletreeRegister: MerkleTree;
  public registerLeaves: Register[];

  constructor(registers: Register[]) {
    let { merkletreeRegister } = this.createTree(registers);

    this.merkletreeRegister = merkletreeRegister;
    this.registerLeaves = registers;
  }

  createTree(registers: Register[]) {
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

    return { merkletreeRegister };
  }
}

export class StealthRollup extends State<StealthRegister, StealthTransport> {
  constructor(state: StealthRegister) {
    super(state);
  }

  transformer(): {
    wrap: () => StealthTransport;
    unwrap: (wrappedState: StealthTransport) => StealthRegister;
  } {
    return {
      wrap: () => {
        return new StealthTransport(this.state);
      },
      unwrap: (wrappedState: StealthTransport) => {
        return wrappedState.registerLeaves;
      },
    };
  }

  getRootHash(): BytesLike {
    if (this.state.length === 0) {
      return ZeroHash;
    }
    // console.log(this.transformer().wrap().merkletreeAnnouncement.getHexRoot());
    return this.transformer().wrap().merkletreeRegister.getHexRoot();
    // return finalRoot;
  }
}
