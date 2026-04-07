"use client";

import { Card, Text, Group, ThemeIcon } from "@mantine/core";
import {
  IconFileStack,
  IconScissors,
  IconRotateClockwise,
  IconFileExport,
  IconFileShredder,
  IconLock,
  IconLockOpen,
  IconLayersSubtract,
  IconDroplet,
  IconFileInfo,
  IconListNumbers,
  IconFileZip,
  IconFileTypeDocx,
  IconFileText,
  IconFile,
} from "@tabler/icons-react";
import Link from "next/link";
import type { Tool } from "@/lib/tools";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  IconFileStack,
  IconScissors,
  IconRotateClockwise,
  IconFileExport,
  IconFileShredder,
  IconLock,
  IconLockOpen,
  IconLayersSubtract,
  IconDroplet,
  IconFileInfo,
  IconListNumbers,
  IconFileZip,
  IconFileTypeDocx,
  IconFileText,
};

const categoryColor: Record<string, string> = {
  organize: "indigo",
  security: "red",
  modify: "teal",
  convert: "orange",
};

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = iconMap[tool.icon] || IconFile;
  const color = categoryColor[tool.category] || "gray";

  return (
    <Card
      component={Link}
      href={`/tools/${tool.id}`}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        cursor: "pointer",
        transition: "transform 150ms ease, box-shadow 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
      }}
    >
      <Group gap="md" wrap="nowrap">
        <ThemeIcon size={48} radius="md" variant="light" color={color}>
          <Icon size={24} />
        </ThemeIcon>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} size="sm" truncate>
            {tool.name}
          </Text>
          <Text size="xs" c="dimmed" lineClamp={2}>
            {tool.description}
          </Text>
        </div>
      </Group>
    </Card>
  );
}
