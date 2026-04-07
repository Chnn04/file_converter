"use client";

import {
  Group,
  Text,
  ActionIcon,
  useMantineColorScheme,
  Container,
  Anchor,
} from "@mantine/core";
import { IconSun, IconMoon, IconFileTypePdf } from "@tabler/icons-react";
import Link from "next/link";

export default function Header() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--mantine-color-default-border)",
        backgroundColor: "var(--mantine-color-body)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Container size="xl" py="sm">
        <Group justify="space-between">
          <Anchor component={Link} href="/" underline="never">
            <Group gap="xs">
              <IconFileTypePdf size={32} color="var(--mantine-color-indigo-filled)" />
              <Text fw={700} size="xl" c="var(--mantine-color-text)">
                PDF Hub
              </Text>
            </Group>
          </Anchor>

          <Group gap="sm">
            <Anchor component={Link} href="/" size="sm" c="dimmed" underline="hover">
              Herramientas
            </Anchor>
            <Anchor component={Link} href="/login" size="sm" c="dimmed" underline="hover">
              Iniciar sesión
            </Anchor>
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={toggleColorScheme}
              aria-label="Cambiar tema"
            >
              {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </header>
  );
}
