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
  UnstyledButton,
} from "@mantine/core";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { useMobile } from "~/lib/useMobile";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signUp" | "signIn">("signIn");
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
              <UnstyledButton
                onClick={() => {
                  setStep(step === "signIn" ? "signUp" : "signIn");
                }}
              >
                {step === "signIn" ? "Register" : "Go to Login"}
              </UnstyledButton>
            </Group>
          </Stack>
        </Form>
      </Flex>
      <Flex
        bg="yellow.1"
        flex={1}
        h={isMobile ? "50%" : "100%"}
        p="xl"
        direction="column"
        justify="space-between"
      >
        <Flex direction="column">
          <Title c="orange" fw="600">
            Tiktik Record Stream ●
          </Title>
          <Text c="orange" fw="500">
            Automatically record TikTok users streams when they go live.
          </Text>
        </Flex>
        <Text c="dimmed" size="sm">
          This app is a fun project I&apos;ve developed, and it&apos;s currently
          free to use. I&apos;m covering around $100 per month for backend
          costs, including proxy servers, database, and storage. However, if the
          costs become too high, I may need to shut down the service. If you
          find it useful and want to support the project, feel free to donate on
          GitHub—
        </Text>
      </Flex>
    </Group>
  );
}
