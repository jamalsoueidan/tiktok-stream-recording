import {
  AspectRatio,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link, useParams } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import ReactPlayer from "react-player";
import { VideoPlayer } from "~/components/VideoPlayer";

dayjs.extend(relativeTime);

export default function Index() {
  const params = useParams();
  const follower = useQuery(api.follower.get, {
    uniqueId: params.uniqueId || "",
  });

  const [loading, setLoading] = useState(false);
  const checkUser = useAction(api.tiktok.checkUser);

  const log = follower?.log;

  return (
    <Container size="md" py="xl">
      <Stack>
        <Button component={Link} to="/">
          Back
        </Button>
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

            {follower.requireLogin ? (
              <Text>
                This user requires login to view their stream. Please login to
                view their stream.
              </Text>
            ) : null}
            {log?.stream?.hls_pull_url ? (
              <>
                <VideoPlayer
                  options={{
                    autoplay: true,
                    controls: true,
                    disablePictureInPicture: true,
                    poster: follower.avatarLarger,
                    responsive: true,
                    fluid: true,
                    aspectRatio: "16:9",
                    sources: [
                      {
                        src: log?.stream?.hls_pull_url,
                        type: "application/x-mpegURL",
                      },
                    ],
                  }}
                />
              </>
            ) : log?.stream?.flv_pull_url?.FULL_HD1 ? (
              <AspectRatio ratio={2 / 1}>
                <ReactPlayer
                  url={log?.stream?.flv_pull_url?.FULL_HD1}
                  playing
                  controls
                  width="100%"
                  height="100%"
                  config={{
                    file: {
                      forceFLV: true,
                      attributes: {
                        controls: true,
                      },
                    },
                  }}
                />
              </AspectRatio>
            ) : null}
            <Flex justify="flex-end" mt={log?.stream ? "md" : "0"}>
              <Button
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
      </Stack>
    </Container>
  );
}
