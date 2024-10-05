import { BubbleChart } from "@mantine/charts";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Image,
  Modal,
  rem,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  Link,
  Outlet,
  useNavigate,
  useOutlet,
  useParams,
} from "@remix-run/react";
import { IconReload, IconVideo } from "@tabler/icons-react";
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
    api.video.paginate,
    { uniqueId: params.uniqueId || "" },
    { initialNumItems: 30 }
  );
  const [loading, setLoading] = useState(false);
  const checkUser = useAction(api.tiktok.checkUser);

  const log = follower?.log;

  return (
    <Container size="md" py="xl">
      <Stack>
        <Flex justify="center">
          <Button component={Link} to="/">
            Back
          </Button>
          {follower?.requireLogin ? (
            <Text>
              This user requires login to view their stream. Please login to
              view their stream.
            </Text>
          ) : null}
        </Flex>
        {follower ? (
          <Card>
            <Flex align="center" justify="space-between">
              <Flex align="center" gap="sm">
                <Avatar src={follower.avatarMedium} size="lg" />
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
            <Card.Section my="md">
              <Divider />
            </Card.Section>
            <Flex justify="flex-end" gap="md">
              {log?.stream?.flv_pull_url?.FULL_HD1 ? (
                <Button
                  component={Link}
                  to={`/tiktok/${follower.uniqueId}/stream`}
                  leftSection={<IconVideo />}
                >
                  Watch stream
                </Button>
              ) : null}
              <Button
                leftSection={<IconReload />}
                onClick={() => {
                  setLoading(true);
                  checkUser({
                    id: follower._id,
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
          </Card>
        ) : null}
        <Flex>
          {results?.map((video) => (
            <Card
              key={video._id}
              component={Link}
              to={`/tiktok/${video.uniqueId}/watch/${video._id}`}
            >
              <Box
                pos="absolute"
                top="50%"
                left="50%"
                style={{ transform: "translate(-50%, -50%)" }}
              >
                <ThemeIcon size={rem(80)} radius="xl" opacity={0.7}>
                  <IconVideo
                    style={{ width: rem(80), height: rem(80) }}
                    stroke={1.5}
                    color="white"
                  />
                </ThemeIcon>
              </Box>
              <Image
                radius="md"
                mah={200}
                w="auto"
                fit="contain"
                src={video.thumbnail_url}
              />
            </Card>
          ))}
        </Flex>
        {status === "CanLoadMore" ? (
          <Button onClick={() => loadMore(10)}>Load More</Button>
        ) : null}
      </Stack>
      <Modal.Root opened={inOulet} onClose={() => navigate(-1)}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Body>
            <Outlet />
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </Container>
  );
}
