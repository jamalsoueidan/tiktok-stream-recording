import { Text } from "@mantine/core";
import { useParams } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import dayjs from "dayjs";

export default function Stream() {
  const params = useParams();
  const logs = useQuery(api.containerLog.get, {
    filename: params.filename as string,
  });

  console.log(logs);

  return (
    <>
      {logs?.map((log) => (
        <Text key={log._id}>
          <strong>{dayjs(log._creationTime).format("HH:mm")}:</strong>{" "}
          {log.message}
        </Text>
      ))}
    </>
  );
}
