import {
  Avatar,
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
  UnstyledButton,
} from "@mantine/core";
import { Link, Outlet, useNavigate, useOutlet } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { FaRecordVinyl } from "react-icons/fa";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export default function Index() {
  const inOulet = !!useOutlet();
  const navigate = useNavigate();

  const { results, status, loadMore } = usePaginatedQuery(
    api.video.paginateRecording,
    {},
    { initialNumItems: 30 }
  );

  return (
    <>
      <Stack align="center" mb="xl">
        <Title>Recordings</Title>
        <Text>Your current recordings</Text>
      </Stack>

      <>
        <Grid>
          {results?.map((video) => (
            <Grid.Col span={{ base: 6, sm: 3, md: 2 }} key={video._id}>
              <Card withBorder shadow="md" p="xs">
                <UnstyledButton
                  component={Link}
                  to={`/monitor/${video.filename}`}
                >
                  <Box pos="relative">
                    <Image
                      src={video.image}
                      radius="md"
                      w="100%"
                      mah={rem(300)}
                      fit="contain"
                    />
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
                      <FaRecordVinyl style={{ width: "80%", height: "80%" }} />
                    </ThemeIcon>
                  </Box>
                  <UnstyledButton
                    component={Link}
                    to={`/tiktok/${video.uniqueId}`}
                  >
                    <Flex align="center" mt={rem(4)} gap="xs">
                      <Avatar
                        src={video.follower?.avatarMedium}
                        radius="xl"
                        size="md"
                      />
                      <Title fz="lg">{video.uniqueId}</Title>
                    </Flex>

                    <Text c="dimmed" fz="sm">
                      {dayjs(video._creationTime).format(`LLL`)}
                    </Text>
                  </UnstyledButton>
                </UnstyledButton>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
        {status === "CanLoadMore" ? (
          <Flex mt="md">
            <Button onClick={() => loadMore(10)} fullWidth>
              Load More
            </Button>
          </Flex>
        ) : null}
      </>

      <Modal opened={inOulet} onClose={() => navigate(-1)} size="xl">
        <Outlet />
      </Modal>
    </>
  );
}
