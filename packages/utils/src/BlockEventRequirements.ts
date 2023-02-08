import { BlockEventParams } from "./types";

export class BlockEventRequirements {
  eventParams: BlockEventParams;
  blockNumber: number;
  result: boolean;

  constructor(eventParams: BlockEventParams, blockNumber: number) {
    this.eventParams = eventParams;
    this.blockNumber = blockNumber;
    this.result = true;
  }

  is(filterType: string) {
    switch (filterType) {
      case "CURRENT_BLOCK_GREATER_THAN_START_BLOCK":
        this.result =
          this.result && this.blockNumber > this.eventParams.startBlock;
        break;
      case "CURRENT_BLOCK_LESS_THAN_END_BLOCK":
        this.result =
          this.result && this.blockNumber < this.eventParams.endBlock;
        break;
      default:
        throw new Error(`Unknown filter type: ${filterType}`);
    }

    return this;
  }
}
