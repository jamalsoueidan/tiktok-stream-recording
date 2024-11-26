import {
  Center,
  Indicator,
  Stack,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";

import { useAuthActions } from "@convex-dev/auth/react";
import { Link } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { FaSignOutAlt, FaTiktok, FaVideo } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { RiSpyFill } from "react-icons/ri";
import classes from "./LeftNavigation.module.css";

export function LeftNavigation() {
  const { signOut } = useAuthActions();
  const countMonitor = useQuery(api.video.countRecording);
  const count = useQuery(api.video.countVideos);

  return (
    <nav className={classes.navbar}>
      <Center mt="sm">
        <FaTiktok size={40} />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          <Tooltip
            label="Followers"
            position="right"
            transitionProps={{ duration: 0 }}
          >
            <UnstyledButton
              component={Link}
              to="/"
              className={classes.link}
              data-active={undefined}
            >
              <FaPeopleGroup size={28} />
            </UnstyledButton>
          </Tooltip>

          <Tooltip
            label="Videos"
            position="right"
            transitionProps={{ duration: 0 }}
          >
            <Indicator inline size={12} offset={10} label={count} color="black">
              <UnstyledButton
                component={Link}
                to="/videos"
                className={classes.link}
                data-active={undefined}
              >
                <FaVideo size={28} />
              </UnstyledButton>
            </Indicator>
          </Tooltip>
          <Tooltip
            label="Monitor"
            position="right"
            transitionProps={{ duration: 0 }}
          >
            <Indicator
              inline
              size={12}
              offset={10}
              label={countMonitor}
              disabled={countMonitor === 0}
              color="black"
            >
              <UnstyledButton
                component={Link}
                to="/monitor"
                className={classes.link}
                data-active={undefined}
              >
                <RiSpyFill size={28} />
              </UnstyledButton>
            </Indicator>
          </Tooltip>
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <Tooltip
          label="Logout"
          position="right"
          transitionProps={{ duration: 0 }}
        >
          <UnstyledButton onClick={signOut} className={classes.link}>
            <FaSignOutAlt size={28} />
          </UnstyledButton>
        </Tooltip>
      </Stack>
    </nav>
  );
}
