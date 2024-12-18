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
import {
  useAction,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { FaRegCircle, FaStackExchange, FaTiktok } from "react-icons/fa";
import { formatDuration } from "~/lib/formatDuration";
import { useMobile } from "~/lib/useMobile";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export default function Index() {
  const inOulet = !!useOutlet();
  const isMobile = useMobile();
  const navigate = useNavigate();
  const params = useParams();
  const follower = useQuery(api.follower.get, {
    uniqueId: params.uniqueId || "",
  });

  const unfollow = useMutation(api.follower.unfollow);
  const { results, status, loadMore } = usePaginatedQuery(
    api.video.paginateUserVideos,
    { uniqueId: params.uniqueId || "" },
    { initialNumItems: 30 }
  );
  const [loading, setLoading] = useState(false);
  const checkUser = useAction(api.tiktok.checkUser);

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
                <Avatar src={follower.avatarMedium} size="xl" />
                <div>
                  <Flex align="center" gap="sm">
                    <Title order={2}>{follower.uniqueId}</Title>
                    {follower.live === true ? (
                      <Badge color="green">Live</Badge>
                    ) : (
                      <Badge color="red">Offline</Badge>
                    )}
                  </Flex>
                  <Text>
                    {follower?.cronRunAt
                      ? dayjs().from(dayjs(follower?.cronRunAt), true) + " ago"
                      : null}
                  </Text>
                </div>
              </Group>
              <Flex justify="flex-end" gap="md">
                {follower?.live ? (
                  <Button
                    color="black"
                    component={Link}
                    to={`https://www.tiktok.com/@${follower.uniqueId}/live`}
                    target="_blank"
                    leftSection={<FaTiktok />}
                  >
                    Live
                  </Button>
                ) : null}
                <Button
                  component={Link}
                  to={`/tiktok/${follower.uniqueId}/stats`}
                  loading={loading}
                  leftSection={<FaStackExchange />}
                >
                  Stats
                </Button>
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
                  leftSection={<FaRegCircle />}
                >
                  Refresh
                </Button>
                <Button
                  color="red"
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
                >
                  Tiktok
                </Button>
              </Flex>
            </Flex>
            <Card.Section my="md">
              <Divider />
            </Card.Section>
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
                    pos="relative"
                  >
                    <Image
                      radius="md"
                      h="auto"
                      w="100%"
                      fit="contain"
                      src={video.image}
                    />

                    {video.durationSec ? (
                      <>
                        <Badge
                          pos="absolute"
                          bottom="26px"
                          right="4px"
                          color="black"
                        >
                          <Text fz="sm">
                            {formatDuration(video.durationSec)}
                          </Text>
                        </Badge>
                      </>
                    ) : null}
                    <Text c="dimmed" fz="sm">
                      {dayjs(video._creationTime).format(`LLL`)}
                    </Text>
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
      <Modal.Root
        opened={inOulet}
        onClose={() => navigate(-1)}
        size="xl"
        fullScreen={isMobile}
      >
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Body style={{ overflow: "hidden" }}>
            <Outlet />
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
