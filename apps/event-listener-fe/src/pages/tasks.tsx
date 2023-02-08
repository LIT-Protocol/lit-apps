import { safeFetch } from "@lit-dev/utils";
import { useEffect, useState } from "react";

export function Tasks() {
  const [data, setData] = useState<any>();

  useEffect(() => {
    if (!data) {
      (async () => {
        const res = await safeFetch("/api/get-jobs");

        console.log("res:", res.data);
        setData(res.data);
      })();
    }
  }, []);

  return (
    <div className="max-width-880">
      <h1>Tasks</h1>
      <div className="flex flex-col gap-12">
        {!data ? (
          ""
        ) : (
          <div className="flex flex-col">
            <h3 className="mb-12">Waiting jobs: {data.waitingJobs.length}</h3>
            {data.waitingJobs.map((job: any) => {
              return (
                <div className="pkp-card">
                  <div>Job ID: {job.id}</div>
                  <div>Event Type Type: {job.data.jobData.eventType}</div>
                  <div>Job Name: {job.data.name}</div>
                </div>
              );
            })}
            <h3 className="mb-12">Processing jobs: {data.processingJobs.length}</h3>
            {data.processingJobs.map((job: any) => {
              return (
                <div className="pkp-card">
                  <div>Job ID: {job.id}</div>
                  <div>Job Type: {job.type}</div>
                  <div>Job Status: {job.status}</div>
                </div>
              );
            })}

            <h3 className="mb-12">Completed jobs: {data.completedJobs.length}</h3>
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
