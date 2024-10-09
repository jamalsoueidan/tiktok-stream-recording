import { useAuthActions } from "@convex-dev/auth/react";
import { ActionIcon, Flex, Indicator, rem } from "@mantine/core";
import { Link } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { FaHome, FaRecordVinyl, FaSignOutAlt, FaVideo } from "react-icons/fa";
import { useMobile } from "~/lib/useMobile";
import { FollowerForm } from "./FollowerForm";

export const Navigation = () => {
  const { signOut } = useAuthActions();
  const countMonitor = useQuery(api.video.countRecording);
  const count = useQuery(api.video.countVideos);
  const isMobile = useMobile();

  return (
    <Flex flex="1" gap={rem(6)} w="100%" mb="md">
      <ActionIcon
        component={Link}
        to="/"
        color="blue"
        size={rem(isMobile ? 30 : 50)}
      >
        <FaHome style={{ width: "70%", height: "70%" }} />
      </ActionIcon>
      <FollowerForm />
      <Indicator inline size={24} offset={4} label={count} color="black">
        <ActionIcon
          component={Link}
          to="/videos"
          color="red"
          size={rem(isMobile ? 30 : 50)}
        >
          <FaVideo style={{ width: "70%", height: "70%" }} />
        </ActionIcon>
      </Indicator>
      <Indicator inline size={24} offset={4} label={countMonitor} color="black">
        <ActionIcon
          component={Link}
          to="/monitor"
          color="yellow"
          size={rem(isMobile ? 30 : 50)}
        >
          <FaRecordVinyl style={{ width: "70%", height: "70%" }} />
        </ActionIcon>
      </Indicator>
      <ActionIcon onClick={() => void signOut()} size={rem(isMobile ? 30 : 50)}>
        <FaSignOutAlt style={{ width: "70%", height: "70%" }} />
      </ActionIcon>
    </Flex>
  );
};
