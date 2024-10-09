import { Button, Indicator } from "@mantine/core";
import { Link } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { FaVideo } from "react-icons/fa";

export const VideosButton = () => {
  const count = useQuery(api.video.countVideos);

  return (
    <Indicator inline size={24} offset={4} label={count} color="black">
      <Button
        component={Link}
        to="/videos"
        color="red"
        size="lg"
        leftSection={<FaVideo />}
      >
        Videos
      </Button>
    </Indicator>
  );
};
