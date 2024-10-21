import { BarChart } from "@mantine/charts";
import { useParams } from "@remix-run/react";

import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

export default function Index() {
  const params = useParams();

  const stats = useQuery(api.video.stats, {
    uniqueId: params.uniqueId || "",
  });

  return (
    <>
      {stats ? (
        <BarChart
          h={300}
          data={stats as never}
          dataKey="text"
          series={[{ name: "value", color: "teal.6" }]}
        />
      ) : null}
    </>
  );
}
