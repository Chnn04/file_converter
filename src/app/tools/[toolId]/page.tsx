"use client";

import { use } from "react";
import { Container, Title, Text, Anchor, Group } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { getToolById } from "@/lib/tools";
import ToolShell from "@/components/ToolShell";

export default function ToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = use(params);
  const tool = getToolById(toolId);

  if (!tool) {
    return (
      <Container size="sm" py="xl">
        <Anchor component={Link} href="/" size="sm" c="dimmed" mb="md" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <IconArrowLeft size={14} /> Volver
        </Anchor>
        <Title order={2} mt="md">Herramienta no encontrada</Title>
        <Text c="dimmed" mt="sm">
          La herramienta &quot;{toolId}&quot; no existe. Vuelve al inicio para ver las herramientas disponibles.
        </Text>
      </Container>
    );
  }

  return <ToolShell tool={tool} />;
}
