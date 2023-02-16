import { JobData, MergedJob, safeFetch } from "@lit-dev/utils";
import { useEffect, useState } from "react";
import { sha256 } from "ethers/lib/utils";
import { LitLoading } from "ui";
import Bull from "bull";
import { AuthProviderContext } from "../utils/useAuth";

export function Tasks() {
  const [data, setData] = useState<any>();

  const fetchData = async () => {
    const res = await safeFetch("/api/get-jobs");

    console.log("res:", res.data);
    setData(res.data);
  };

  useEffect(() => {
    var interval: any;

    interval = setInterval(async () => {
      fetchData();
    }, 10000);
    if (!data) {
      fetchData();
    }
    return () => clearInterval(interval);
  }, [data]);

  const renderItem = (job: Bull.Job) => {
    // convert job.data.name to buffer
    const buf = Buffer.from(job.data.name, "base64");
    // convert buffer to hash
    const hash = sha256(buf);

    const jobData: JobData = job.data.jobData;

    return (
      <div className="pkp-card">
        <div>Job ID: {job.id}</div>
        <div>Job #: {hash}</div>
        <div>Event Type: {jobData.eventType}</div>
        <div>Event Params: {JSON.stringify(jobData.eventParams)}</div>
        <div>Ipfs ID: {jobData.ipfsId}</div>
      </div>
    );
  };

  const renderCompleted = (jobs: Array<Bull.Job>) => {
    // for any job in data.completedJobs that has the same hash, merge them into one object
    // and display the job id's
    const mergedJobs: Array<MergedJob> = jobs.reduce((acc: any, job: any) => {
      const buf = Buffer.from(job.data.name, "base64");
      const hash = sha256(buf);
      const jobData: JobData = job.data.jobData;

      if (!acc[hash]) {
        acc[hash] = {
          ...jobData,
          name: job.data.name,
          jobIds: [job.id],
        };
      } else {
        acc[hash].jobIds.push(job.id);
      }

      return acc;
    }, {});

    return Object.values(mergedJobs).map((job: MergedJob) => {
      // get the first and last job ids
      const firstJobId = job.jobIds[0];
      const lastJobId = job.jobIds[job.jobIds.length - 1];
      const count = job.jobIds.length;
      const buf = Buffer.from(job.name, "base64");
      const hash = sha256(buf);

      return (
        <div className="pkp-card">
          <div>Executed: {count} times</div>
          <div>Job #: {hash}</div>
          {/* <div>Job ID's: {job.jobIds.join(", ")}</div> */}
          <div>Event Type: {job.eventType}</div>
          <div>Event Params: {JSON.stringify(job.eventParams)}</div>
          <div>Ipfs ID: {job.ipfsId}</div>
        </div>
      );
    });
  };

  return (
    <AuthProviderContext>
      <div className="max-width-880">
        <h1>Tasks</h1>
        <div className="flex flex-col gap-12">
          {!data ? (
            <LitLoading icon="lit-logo" text="Fetching tasks..." />
          ) : (
            <div className="flex flex-col">
              <h3 className="mb-12">Waiting jobs: {data.waitingJobs.length}</h3>
              {data.waitingJobs.map((job: Bull.Job) => {
                return renderItem(job);
              })}
              <h3 className="mb-12">
                Processing jobs: {data.processingJobs.length}
              </h3>
              {data.processingJobs.map((job: any) => {
                return renderItem(job);
              })}

              <h3 className="mb-12">
                Completed jobs: {data.completedJobs.length}
              </h3>
              {renderCompleted(data.completedJobs)}
            </div>
          )}
        </div>
      </div>
    </AuthProviderContext>
  );
}

export default Tasks;
