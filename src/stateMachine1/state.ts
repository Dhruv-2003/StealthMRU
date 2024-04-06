import { State } from "@stackr/sdk/machine";
import {
  BytesLike,
  ZeroHash,
  solidityPacked,
  solidityPackedKeccak256,
} from "ethers";
import { MerkleTree } from "merkletreejs";

export type Annoucement = {
  stealthAddress: string;
  ephemeralPublicKey: string;
  viewTag: number;
};

export type StealthAnnoncement = Annoucement[];

// NOTE :  I have used the same naming as the older one but the meaning is same
class StealthTransport {
  public merkletreeAnnouncement: MerkleTree;
  public announcementLeaves: Annoucement[];

  constructor(announcements: Annoucement[]) {
    let { merkletreeAnnouncement } = this.createTree(announcements);

    this.merkletreeAnnouncement = merkletreeAnnouncement;

    this.announcementLeaves = announcements;
  }

  createTree(announcements: Annoucement[]) {
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

    return { merkletreeAnnouncement };
  }
}

export class StealthRollup extends State<StealthAnnoncement, StealthTransport> {
  constructor(state: StealthAnnoncement) {
    super(state);
  }

  transformer(): {
    wrap: () => StealthTransport;
    unwrap: (wrappedState: StealthTransport) => StealthAnnoncement;
  } {
    return {
      wrap: () => {
        return new StealthTransport(this.state);
      },
      unwrap: (wrappedState: StealthTransport) => {
        return wrappedState.announcementLeaves;
      },
    };
  }

  getRootHash(): BytesLike {
    if (this.state.length === 0) {
      return ZeroHash;
    }
    // console.log(this.transformer().wrap().merkletreeAnnouncement.getHexRoot());
    return this.transformer().wrap().merkletreeAnnouncement.getHexRoot();
    // return finalRoot;
  }
}
