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
import { useState } from "react";
import { useMobile } from "~/lib/useMobile";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [step] = useState<"signUp" | "signIn">("signIn");
  const isMobile = useMobile();

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
            Usage of this app has already cost around 10 USD per day since it
            launched. Unfortunately, due to these costs, I&apos;m temporarily
            removing access to the system. If you like the app and would like to
            continue using it, consider supporting by donating on GitHub. With
            your support, I’ll provide access again. The platform costs about
            300 USD per month to maintain, and I’m not covering that alone :)
          </Text>
        </Flex>
      </Flex>
    </Group>
  );
}
