import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export const useMobile = () => {
  const theme = useMantineTheme();
  const isMobileSize = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  return isMobileSize;
};
