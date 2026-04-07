"use client";

import { useState, useCallback } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  TextInput,
  NumberInput,
  PasswordInput,
  Select,
  Group,
  Alert,
  Progress,
  Paper,
  Anchor,
  Divider,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconDownload,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconFileZip,
} from "@tabler/icons-react";
import Link from "next/link";
import type { Tool, ProcessResult } from "@/lib/tools";
import { downloadBlob, downloadAsZip } from "@/lib/download";
import FileDropzone from "./FileDropzone";

export default function ToolShell({ tool }: { tool: Tool }) {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const opt of tool.options) {
      if (opt.defaultValue !== undefined) defaults[opt.id] = String(opt.defaultValue);
    }
    return defaults;
  });
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(
    (dropped: File[]) => {
      if (tool.multiFile) {
        setFiles((prev) => [...prev, ...dropped]);
      } else {
        setFiles(dropped.slice(0, 1));
      }
      setResult(null);
      setError(null);
    },
    [tool.multiFile]
  );

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }, []);

  const setOption = useCallback((id: string, value: string) => {
    setOptions((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await tool.process(files, options);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al procesar el archivo");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (data: Uint8Array, filename: string) => {
    downloadBlob(data, filename);
  };

  const handleDownloadAll = () => {
    if (result) downloadAsZip(result.files);
  };

  const canProcess = files.length > 0 && tool.options
    .filter((o) => o.required)
    .every((o) => options[o.id]?.trim());

  return (
    <Container size="sm" py="xl">
      <Anchor component={Link} href="/" size="sm" c="dimmed" mb="md" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <IconArrowLeft size={14} /> Volver a herramientas
      </Anchor>

      <Title order={2} mb={4}>
        {tool.name}
      </Title>
      <Text c="dimmed" mb="lg">
        {tool.description}
      </Text>

      <Stack gap="lg">
        <FileDropzone
          onDrop={handleDrop}
          multiple={tool.multiFile}
          files={files}
          onRemove={handleRemove}
        />

        {tool.options.length > 0 && files.length > 0 && (
          <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="sm">Opciones</Text>
            <Stack gap="sm">
              {tool.options.map((opt) => {
                switch (opt.type) {
                  case "text":
                  case "pageRange":
                    return (
                      <TextInput
                        key={opt.id}
                        label={opt.label}
                        placeholder={opt.placeholder}
                        value={options[opt.id] || ""}
                        onChange={(e) => setOption(opt.id, e.currentTarget.value)}
                        required={opt.required}
                      />
                    );
                  case "password":
                    return (
                      <PasswordInput
                        key={opt.id}
                        label={opt.label}
                        value={options[opt.id] || ""}
                        onChange={(e) => setOption(opt.id, e.currentTarget.value)}
                        required={opt.required}
                      />
                    );
                  case "number":
                    return (
                      <NumberInput
                        key={opt.id}
                        label={opt.label}
                        value={parseFloat(options[opt.id] || String(opt.defaultValue ?? 0))}
                        onChange={(val) => setOption(opt.id, String(val))}
                        min={opt.min}
                        max={opt.max}
                      />
                    );
                  case "select":
                    return (
                      <Select
                        key={opt.id}
                        label={opt.label}
                        data={opt.selectOptions || []}
                        value={options[opt.id] || String(opt.defaultValue ?? "")}
                        onChange={(val) => setOption(opt.id, val || "")}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </Stack>
          </Paper>
        )}

        {files.length > 0 && (
          <Button
            size="md"
            onClick={handleProcess}
            disabled={!canProcess || loading}
            loading={loading}
            leftSection={loading ? <IconLoader2 size={18} /> : undefined}
            fullWidth
          >
            {loading ? "Procesando..." : "Procesar"}
          </Button>
        )}

        {error && (
          <Alert color="red" icon={<IconAlertCircle size={18} />} title="Error">
            {error}
          </Alert>
        )}

        {result && (
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="sm">
              <Group gap="xs">
                <IconCheck size={20} color="var(--mantine-color-green-6)" />
                <Text fw={600} c="green">Completado</Text>
              </Group>
              {result.files.length > 1 && (
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconFileZip size={14} />}
                  onClick={handleDownloadAll}
                >
                  Descargar todo (.zip)
                </Button>
              )}
            </Group>
            <Divider mb="sm" />
            <Stack gap="xs">
              {result.files.map((f, i) => (
                <Group key={i} justify="space-between">
                  <Text size="sm">{f.filename}</Text>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconDownload size={14} />}
                    onClick={() => handleDownload(f.data, f.filename)}
                  >
                    Descargar
                  </Button>
                </Group>
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
