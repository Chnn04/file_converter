"use client";

import { useState } from "react";
import {
  Container,
  Title,
  Text,
  TextInput,
  SimpleGrid,
  Stack,
  Badge,
  Group,
  SegmentedControl,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { tools, categories } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = tools.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container size="xl" py={48}>
      <Stack align="center" gap="sm" mb={40}>
        <Title order={1} ta="center">
          Herramientas PDF
        </Title>
        <Text c="dimmed" size="lg" ta="center" maw={500}>
          Procesa tus documentos PDF directamente en el navegador.
          Sin servidores, sin subir archivos. Todo local y privado.
        </Text>
        <Badge variant="light" color="green" size="lg" mt="xs">
          100% en el navegador — tus archivos no salen de tu equipo
        </Badge>
      </Stack>

      <Group justify="center" mb="md">
        <SegmentedControl
          value={category}
          onChange={setCategory}
          data={[
            { value: "all", label: "Todas" },
            ...categories.map((c) => ({ value: c.id, label: c.label })),
          ]}
        />
      </Group>

      <TextInput
        placeholder="Buscar herramienta..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="lg"
        size="md"
        maw={400}
        mx="auto"
      />

      {filtered.length === 0 ? (
        <Text ta="center" c="dimmed" py="xl">
          No se encontraron herramientas
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </SimpleGrid>
      )}

      <Text ta="center" c="dimmed" size="xs" mt={60}>
        Basado en conceptos de Stirling-PDF (MIT License). Procesamiento PDF con pdf-lib.
      </Text>
    </Container>
  );
}
