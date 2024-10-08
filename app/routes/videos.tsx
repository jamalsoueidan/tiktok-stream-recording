import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Image,
  Modal,
  rem,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Link, Outlet, useNavigate, useOutlet } from "@remix-run/react";

import { api } from "convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { FaVideo } from "react-icons/fa";
import { formatDuration } from "~/lib/formatDuration";

dayjs.extend(localizedFormat);

export default function Index() {
  const inOulet = !!useOutlet();
  const navigate = useNavigate();

  const { results, status, loadMore } = usePaginatedQuery(
    api.video.paginateVideos,
    {},
    { initialNumItems: 30 }
  );

  console.log(results);
  return (
    <>
      <Stack>
        <Grid>
          {results?.map((video) => (
            <Grid.Col span={{ base: 6, sm: 3, md: 2 }} key={video._id}>
              <Card
                withBorder
                shadow="md"
                p="xs"
                component={Link}
                to={`/videos/${video._id}`}
              >
                <Box pos="relative">
                  <Image
                    src={video.image}
                    radius="md"
                    w="100%"
                    mah={rem(250)}
                    fit="contain"
                  />
                  <ThemeIcon
                    size={rem(90)}
                    color="transparent"
                    pos="absolute"
                    top="50%"
                    left="50%"
                    style={{ transform: "translate(-50%, -50%)", opacity: 0.5 }}
                  >
                    <FaVideo style={{ width: "80%", height: "80%" }} />
                  </ThemeIcon>
                  {video.durationSec ? (
                    <Badge pos="absolute" bottom="0" right="0" color="black">
                      <Text fz="sm">{formatDuration(video.durationSec)}</Text>
                    </Badge>
                  ) : null}
                </Box>

                <Flex justify="space-between" align="center" mt={rem(4)}>
                  <Title fz="lg">{video.uniqueId}</Title>
                </Flex>

                <Text c="dimmed" fz="sm">
                  {dayjs(video._creationTime).format(`LLL`)}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
        {status === "CanLoadMore" ? (
          <Button onClick={() => loadMore(10)}>Load More</Button>
        ) : null}
      </Stack>

      <Modal opened={inOulet} onClose={() => navigate(-1)} size="xl">
        <Outlet />
      </Modal>
    </>
  );
}
