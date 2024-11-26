import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Image,
  Loader,
  rem,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { api } from "convex/_generated/api";
import { useMutation, usePaginatedQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect } from "react";
import { FaTiktok } from "react-icons/fa";
import { FollowerForm } from "~/components/FollowerForm";

dayjs.extend(relativeTime);

export const meta: MetaFunction = () => {
  return [
    { title: "Tiktok Record Stream" },
    {
      name: "description",
      content: "Automate the process of recording live TikTok streams!",
    },
  ];
};

export default function Index() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.follower.paginate,
    {},
    { initialNumItems: 12 }
  );
  const unfollow = useMutation(api.follower.unfollow);
  const updateLoggedInDate = useMutation(api.user.updateLoggedInDate);

  useEffect(() => {
    updateLoggedInDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { ref, inViewport } = useInViewport();

  useEffect(() => {
    if (inViewport && status === "CanLoadMore") {
      loadMore(10);
    }
  }, [inViewport, loadMore, status]);

  return !results.length ? (
    <>
      <Stack justify="center">
        <Title>No followers added yet!</Title>
        <Text>
          To get started, add the TikTok users whose live streams you want to
          record. When they go live, we will automatically start recording for
          you.
        </Text>
      </Stack>

      <FollowerForm />
    </>
  ) : (
    <>
      <FollowerForm />
      <Stack align="center" mb="xl">
        <Title>Followers</Title>
        <Text>Your followers</Text>
      </Stack>

      <Grid gutter="xs">
        {results?.map((follower) => (
          <Grid.Col span={{ base: 6, sm: 3, md: 2 }} key={follower._id}>
            <Card
              p={rem(6)}
              radius="md"
              withBorder={follower.live}
              style={{ borderColor: "green" }}
            >
              <UnstyledButton
                component={Link}
                to={`/tiktok/${follower.uniqueId}`}
              >
                <Box pos="relative">
                  <AspectRatio ratio={1}>
                    <Image
                      src={follower.url}
                      fallbackSrc={`https://placehold.co/400x400?text=${follower.uniqueId}`}
                      radius="md"
                      fit="cover"
                      alt="Video thumbnail"
                    />
                  </AspectRatio>
                  <Flex
                    pos="absolute"
                    top={rem(4)}
                    left={rem(4)}
                    opacity={0.8}
                    gap={rem(4)}
                  >
                    {follower.live ? (
                      <Badge color="green" size="xs">
                        Live
                      </Badge>
                    ) : null}
                    {follower.recording ? (
                      <Badge color="green" size="xs">
                        Recording
                      </Badge>
                    ) : null}
                  </Flex>
                </Box>
                <Box mt={rem(4)}>
                  <Group gap="0">
                    <Title fz="md">{follower.uniqueId}</Title>
                  </Group>
                  <Text fz="xs" c="dimmed">
                    {follower.cronRunAt
                      ? "updated " +
                        dayjs().from(dayjs(follower.cronRunAt), true) +
                        " ago"
                      : null}
                  </Text>
                </Box>
              </UnstyledButton>
              <Flex mt="xs" justify="flex-end" gap="xs">
                <Button
                  color="red"
                  size="compact-xs"
                  onClick={() =>
                    unfollow({
                      uniqueId: follower.uniqueId,
                    })
                  }
                >
                  Unfollow
                </Button>
                <Button
                  component={Link}
                  to={`https://www.tiktok.com/@${follower.uniqueId}`}
                  target="_blank"
                  color="black"
                  leftSection={<FaTiktok />}
                  size="compact-xs"
                >
                  Tiktok
                </Button>
              </Flex>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      <Flex mt="md" ref={ref}>
        {status === "LoadingMore" ? <Loader /> : null}
      </Flex>
    </>
  );
}
