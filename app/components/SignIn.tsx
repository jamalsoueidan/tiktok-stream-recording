import { useAuthActions } from "@convex-dev/auth/react";
import {
  Button,
  Flex,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Form } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import { useMobile } from "~/lib/useMobile";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [step] = useState<"signUp" | "signIn">("signIn");
  const isMobile = useMobile();
  const videos = useQuery(api.video.lastVideos);

  return (
    <Group h="100vh" gap="0">
      <Flex
        direction="column"
        miw="35%"
        p="xl"
        w={isMobile ? "100%" : "unset"}
        h={isMobile ? "50%" : "100%"}
        justify="center"
      >
        <Title ta="center" fz="h2" fw="500" mb="lg">
          {step === "signIn" ? "Sign in" : "Register"}
        </Title>

        <Form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            void signIn("password", formData);
          }}
        >
          <Stack>
            <TextInput name="email" placeholder="Email" type="text" />
            <PasswordInput
              name="password"
              placeholder="Password"
              type="password"
            />
            <input name="flow" type="hidden" value={step} />
            <Group justify="center">
              <Button type="submit">
                {step === "signIn" ? "Sign in" : "Register"}
              </Button>
            </Group>
          </Stack>
        </Form>
      </Flex>
      <Flex
        bg="red.1"
        flex={1}
        h={isMobile ? "50%" : "100%"}
        p="xl"
        direction="column"
        justify="space-between"
      >
        <Flex direction="column">
          <Title c="black" fw="600">
            Tiktik Record Stream ●
          </Title>
          <Text c="black" fw="500">
            This app allows users to follow TikTok users and automatically
            records any live streams whenever they go live. Users will never
            miss another stream as the recordings are stored and made accessible
            within the app.
          </Text>
        </Flex>
      </Flex>
    </Group>
  );
}
