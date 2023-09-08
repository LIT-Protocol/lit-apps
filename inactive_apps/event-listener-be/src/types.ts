import { JobData } from "@lit-dev/utils";
import * as Bull from "bull";

export interface JobFilter {
  name: string;
  filter: (job: JobData, data: any) => boolean;
}

export interface ActionListener {
  // filters: Array<JobFilter>;
  start: any;
  waitingList: Bull.Queue;
  processList: Bull.Queue;
}
