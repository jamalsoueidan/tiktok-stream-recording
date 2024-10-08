import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Image,
  rem,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { api } from "convex/_generated/api";
import { useMutation, usePaginatedQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

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

  return (
    <Stack>
      <Grid gutter="xs">
        {results?.map((follower) => (
          <Grid.Col span={{ base: 6, sm: 3, md: 2 }} key={follower._id}>
            <Card
              p={rem(6)}
              radius="md"
              withBorder={follower.log?.live}
              style={{ borderColor: "green" }}
            >
              <UnstyledButton
                component={Link}
                to={`/tiktok/${follower.uniqueId}`}
              >
                <Box pos="relative">
                  <Image
                    src={follower.avatarMedium}
                    radius="md"
                    w="100%"
                    h="auto"
                    fit="contain"
                  />
                  <Flex
                    pos="absolute"
                    top={rem(4)}
                    left={rem(4)}
                    opacity={0.8}
                    gap={rem(4)}
                  >
                    {follower.log?.live ? (
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
                    {follower.log?._creationTime
                      ? "updated " +
                        dayjs().from(dayjs(follower.log?._creationTime), true) +
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
                  size="compact-xs"
                >
                  See Tiktok
                </Button>
              </Flex>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      <Button
        onClick={() => loadMore(10)}
        disabled={status !== "CanLoadMore"}
        loading={status === "LoadingMore"}
      >
        Load More
      </Button>
    </Stack>
  );
}
