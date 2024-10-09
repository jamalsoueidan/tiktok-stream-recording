import { BubbleChart } from "@mantine/charts";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Grid,
  Group,
  Image,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  Link,
  Outlet,
  useNavigate,
  useOutlet,
  useParams,
} from "@remix-run/react";

import { api } from "convex/_generated/api";
import { useAction, usePaginatedQuery, useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";

dayjs.extend(relativeTime);

export default function Index() {
  const inOulet = !!useOutlet();
  const navigate = useNavigate();
  const params = useParams();
  const follower = useQuery(api.follower.get, {
    uniqueId: params.uniqueId || "",
  });
  const stats = useQuery(api.log.stats, {
    uniqueId: params.uniqueId || "",
  });

  const { results, status, loadMore } = usePaginatedQuery(
    api.video.paginateUserVideos,
    { uniqueId: params.uniqueId || "" },
    { initialNumItems: 30 }
  );
  const [loading, setLoading] = useState(false);
  const checkUser = useAction(api.tiktok.checkUser);

  const log = follower?.log;

  return (
    <>
      <Stack>
        {follower?.requireLogin ? (
          <Flex justify="center">
            <Text>
              This user requires login to view their stream. Please login to
              view their stream.
            </Text>
          </Flex>
        ) : null}

        {follower ? (
          <Card>
            <Flex align="center" justify="space-between">
              <Group>
                <Avatar src={follower.avatarMedium} size="lg" />
                <div>
                  <Flex align="center" gap="sm">
                    <Title order={2}>{follower.uniqueId}</Title>
                    {follower.log?.live === true ? (
                      <Badge color="green">Live</Badge>
                    ) : (
                      <Badge color="red">Offline</Badge>
                    )}
                  </Flex>
                  <Text>
                    {log?._creationTime
                      ? dayjs().from(dayjs(log?._creationTime), true) + " ago"
                      : null}
                  </Text>
                </div>
              </Group>
              <Flex justify="flex-end" gap="md">
                {log?.live && log.roomId ? (
                  <Button
                    component={Link}
                    to={`/tiktok/${follower.uniqueId}/stream/${log.roomId}`}
                  >
                    Watch stream
                  </Button>
                ) : null}
                <Button
                  onClick={() => {
                    setLoading(true);
                    checkUser({
                      uniqueId: follower.uniqueId,
                    }).then(() => {
                      setLoading(false);
                    });
                  }}
                  loading={loading}
                >
                  Update
                </Button>
              </Flex>
            </Flex>
            <Card.Section my="md">
              <Divider />
            </Card.Section>

            <BubbleChart
              h={60}
              data={stats || []}
              range={[50, 100]}
              label="Online hours"
              dataKey={{ x: "hour", y: "index", z: "value" }}
              color="blue"
            />
          </Card>
        ) : null}
        {!results.length ? (
          <Flex justify="center">
            <Text>No videos available. The user has not streamed yet.</Text>
          </Flex>
        ) : (
          <>
            <Grid gutter="xs">
              {results?.map((video) => (
                <Grid.Col span={{ base: 6, sm: 3, md: 2 }} key={video._id}>
                  <Paper
                    key={video._id}
                    component={Link}
                    to={`/tiktok/${video.uniqueId}/watch/${video._id}`}
                  >
                    <Image
                      radius="md"
                      h="auto"
                      w="100%"
                      fit="contain"
                      src={video.image}
                    />
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
            {status === "CanLoadMore" ? (
              <Button onClick={() => loadMore(10)}>Load More</Button>
            ) : null}
          </>
        )}
      </Stack>
      <Modal opened={inOulet} onClose={() => navigate(-1)} size="xl">
        <Outlet />
      </Modal>
    </>
  );
}
