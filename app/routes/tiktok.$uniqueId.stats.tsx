import { BubbleChart } from "@mantine/charts";
import { useParams } from "@remix-run/react";

import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function Index() {
  const params = useParams();

  const stats = useQuery(api.log.stats, {
    uniqueId: params.uniqueId || "",
  });

  return (
    <>
      <BubbleChart
        h={60}
        data={stats || []}
        range={[50, 100]}
        label="Online hours"
        dataKey={{ x: "hour", y: "index", z: "value" }}
        color="blue"
      />
    </>
  );
}
