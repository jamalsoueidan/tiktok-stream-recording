import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useAction, usePaginatedQuery } from "convex/react";
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
    { initialNumItems: 10 }
  );
  const [uniqueId, setUniqueId] = useState("");
  const addFollower = useAction(api.follower.addFollower);
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
        </Flex>
        {results?.map((follower) => (
          <Card
            key={follower._id}
            component={Link}
            to={`/tiktok/${follower.uniqueId}`}
          >
            <Flex align="center" justify="space-between">
              <Flex align="center" gap="sm">
                <Avatar src={follower.avatarMedium} size="lg" />
                <Title order={2}>{follower.uniqueId}</Title>
                {follower.log?.live === true ? (
                  <Badge color="green">Live</Badge>
                ) : null}
              </Flex>
              <Text>
                {follower.log?._creationTime
                  ? dayjs().from(dayjs(follower.log?._creationTime), true) +
                    " ago"
                  : null}
              </Text>
            </Flex>
          </Card>
        ))}
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
