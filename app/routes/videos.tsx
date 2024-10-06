import {
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Image,
  Modal,
  Stack,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { Link, Outlet, useNavigate, useOutlet } from "@remix-run/react";

import { api } from "convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function Index() {
  const inOulet = !!useOutlet();
  const navigate = useNavigate();

  const { results, status, loadMore } = usePaginatedQuery(
    api.video.paginateAll,
    {},
    { initialNumItems: 30 }
  );

  return (
    <Container size="md" py="xl">
      <Stack>
        <Flex justify="center">
          <Button component={Link} to="/">
            Back
          </Button>
        </Flex>

        <Grid>
          {results?.map((video) => (
            <Grid.Col span={{ base: 12, sm: 3 }} key={video._id}>
              <Card withBorder shadow="md" p="xs">
                <UnstyledButton component={Link} to={`/videos/${video._id}`}>
                  <Image radius="md" src={video.thumbnail_url} />
                  <Title order={3}>{video.uniqueId}</Title>
                </UnstyledButton>
                <Button
                  component={Link}
                  to={`https://www.tiktok.com/@${video.uniqueId}`}
                  target="_blank"
                  color="black"
                  size="compact-xs"
                >
                  See Tiktok
                </Button>
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
    </Container>
  );
}
