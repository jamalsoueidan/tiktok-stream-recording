import { Button, Indicator } from "@mantine/core";
import { Link } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { FaRecordVinyl } from "react-icons/fa";

export const MonitorButton = () => {
  const countMonitor = useQuery(api.video.countRecording);

  return (
    <Indicator inline size={24} offset={4} label={countMonitor} color="black">
      <Button
        component={Link}
        to="/monitor"
        color="yellow"
        size="xl"
        leftSection={<FaRecordVinyl />}
      >
        Monitor
      </Button>
    </Indicator>
  );
};
