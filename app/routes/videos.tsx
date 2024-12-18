import {
  AspectRatio,
  Avatar,
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  Image,
  Loader,
  Modal,
  rem,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import { Link, Outlet, useNavigate, useOutlet } from "@remix-run/react";

import { api } from "convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useEffect } from "react";
import { CiPlay1 } from "react-icons/ci";
import { formatDuration } from "~/lib/formatDuration";
import { useMobile } from "~/lib/useMobile";
dayjs.extend(localizedFormat);

export default function Index() {
  const inOulet = !!useOutlet();
  const navigate = useNavigate();
  const isMobile = useMobile();

  const { results, status, loadMore } = usePaginatedQuery(
    api.video.paginateVideos,
    {},
    { initialNumItems: 15 }
  );

  const { ref, inViewport } = useInViewport();

  useEffect(() => {
    if (inViewport && status === "CanLoadMore") {
      loadMore(10);
    }
  }, [inViewport, loadMore, status]);

  return (
    <>
      <Stack align="center" mb="xl">
        <Title>Videos</Title>
        <Text>All Recorded Streams</Text>
      </Stack>

      <Grid>
        {results?.map((video) => (
          <Grid.Col span={{ base: 6, sm: 3 }} key={video._id}>
            <Card withBorder shadow="md" p="xs">
              <Box pos="relative" component={Link} to={`/videos/${video._id}`}>
                <AspectRatio ratio={1}>
                  <Image
                    src={video.image}
                    radius="md"
                    fit="cover"
                    alt="Video thumbnail"
                  />
                </AspectRatio>
                <ThemeIcon
                  size={rem(90)}
                  color="transparent"
                  pos="absolute"
                  top="50%"
                  left="50%"
                  style={{
                    transform: "translate(-50%, -50%)",
                    opacity: 0.5,
                  }}
                >
                  <CiPlay1 style={{ width: "80%", height: "80%" }} />
                </ThemeIcon>
                {video.durationSec ? (
                  <Badge pos="absolute" bottom="0" right="0" color="black">
                    <Text fz="sm">{formatDuration(video.durationSec)}</Text>
                  </Badge>
                ) : null}
              </Box>

              <UnstyledButton component={Link} to={`/tiktok/${video.uniqueId}`}>
                <Flex align="center" mt={rem(4)} gap="xs">
                  <Avatar src={video.follower?.url} radius="xl" size="md" />
                  <Title fz="lg">{video.uniqueId}</Title>
                </Flex>

                <Text c="dimmed" fz="sm">
                  {dayjs(video._creationTime).format(`LLL`)}
                </Text>
              </UnstyledButton>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Flex mt="md" ref={ref}>
        {status === "LoadingMore" ? <Loader size={50} /> : null}
      </Flex>

      <Modal
        opened={inOulet}
        onClose={() => navigate(-1)}
        fullScreen={isMobile}
      >
        <Outlet />
      </Modal>
    </>
  );
}
