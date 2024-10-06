import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { api } from "convex/_generated/api";
import { useAction, useMutation, usePaginatedQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";

dayjs.extend(relativeTime);

export const meta: MetaFunction = () => {
  return [
    { title: "Mantine Remix App" },
    { name: "description", content: "Welcome to Mantine!" },
  ];
};

export default function Index() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.follower.paginate,
    {},
    { initialNumItems: 9 }
  );
  const unfollow = useMutation(api.follower.unfollow);
  const [uniqueId, setUniqueId] = useState("");
  const addFollower = useAction(api.follower.follow);
  return (
    <Container size="md" py="xl">
      <Stack>
        <Flex flex="1" gap="xs" w="100%">
          <TextInput
            placeholder="Add follower"
            value={uniqueId}
            size="xl"
            onChange={(event) => setUniqueId(event.currentTarget.value)}
            flex="1"
          />
          <Button
            size="xl"
            onClick={() => {
              addFollower({ uniqueId }).then(() => {
                setUniqueId("");
              });
            }}
          >
            Add follower
          </Button>
          <Button component={Link} to="/videos" color="green" size="xl">
            Videos
          </Button>
          <Button component={Link} to="/monitor" color="yellow" size="xl">
            Monitor
          </Button>
        </Flex>
        <Grid>
          {results?.map((follower) => (
            <Grid.Col span={{ base: 12, sm: 4 }} key={follower._id}>
              <Card withBorder shadow="xs" p="xs">
                <UnstyledButton
                  component={Link}
                  to={`/tiktok/${follower.uniqueId}`}
                >
                  <Stack gap="xs">
                    <Image
                      src={follower.avatarMedium}
                      radius="md"
                      w="100%"
                      h="auto"
                      fit="contain"
                    />
                    <Box>
                      <Group>
                        <Title order={3}>{follower.uniqueId}</Title>
                        {follower.log?.live === true ? (
                          <Badge color="green" size="lg">
                            Live {follower.recording ? "(recording)" : null}
                          </Badge>
                        ) : null}
                      </Group>
                      <Text fz="lg" c="dimmed">
                        {follower.log?._creationTime
                          ? "updated " +
                            dayjs().from(
                              dayjs(follower.log?._creationTime),
                              true
                            ) +
                            " ago"
                          : null}
                      </Text>
                    </Box>
                  </Stack>
                </UnstyledButton>
                <Flex mt="xs" justify="flex-end" gap="xs">
                  <Button
                    color="red"
                    size="compact-xs"
                    onClick={() =>
                      unfollow({
                        id: follower._id,
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
    </Container>
  );
}
