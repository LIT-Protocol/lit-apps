import { safeFetch } from "@lit-dev/utils";
import { useEffect, useState } from "react";
import { sha256 } from "ethers/lib/utils";
import { LitLoading } from "ui";

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

  return (
    <div className="max-width-880">
      <h1>Tasks</h1>
      <div className="flex flex-col gap-12">
        {!data ? (
          <LitLoading icon="lit-logo" text="Fetching tasks..." />
        ) : (
          <div className="flex flex-col">
            <h3 className="mb-12">Waiting jobs: {data.waitingJobs.length}</h3>
            {data.waitingJobs.map((job: any) => {
              //   // convert job.data.name to buffer
              //   const buf = Buffer.from(job.data.name, "base64");
              //   // convert buffer to hash
              //   const hash = sha256(buf);

              return (
                <div className="pkp-card">
                  <div>Job ID: {job.id}</div>
                  <div>Job Name: {job.data.name}</div>
                  <div>Event Type: {job.data.jobData.eventType}</div>
                  <div>
                    Event Params: {JSON.stringify(job.data.jobData.eventParams)}
                  </div>
                  <div>Ipfs ID: {job.data.jobData.ipfsId}</div>
                </div>
              );
            })}
            <h3 className="mb-12">
              Processing jobs: {data.processingJobs.length}
            </h3>
            {data.processingJobs.map((job: any) => {
              return (
                <div className="pkp-card">
                  <div>Job ID: {job.id}</div>
                  <div>Event Type: {job.data.jobData.eventType}</div>
                  <div>Job Name: {job.data.name}</div>
                </div>
              );
            })}

            <h3 className="mb-12">
              Completed jobs: {data.completedJobs.length}
            </h3>
            {/* {data.completedJobs.map((job: any) => {
              return (
                <div className="pkp-card">
                  <div>Job ID: {job.id}</div>
                  <div>Job Type: {job.type}</div>
                  <div>Job Status: {job.status}</div>
                </div>
              );
            })} */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;
