"use client";

import { Group, Text, rem } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { IconUpload, IconFileTypePdf, IconX } from "@tabler/icons-react";

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
  multiple?: boolean;
  files: File[];
  onRemove: (index: number) => void;
}

export default function FileDropzone({ onDrop, multiple = false, files, onRemove }: FileDropzoneProps) {
  return (
    <div>
      <Dropzone
        onDrop={onDrop}
        accept={[MIME_TYPES.pdf]}
        multiple={multiple}
        style={{
          border: "2px dashed var(--mantine-color-indigo-4)",
          borderRadius: "var(--mantine-radius-md)",
          backgroundColor: "var(--mantine-color-indigo-light)",
          minHeight: rem(160),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Group
          justify="center"
          gap="xl"
          style={{ pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload size={52} color="var(--mantine-color-indigo-6)" stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFileTypePdf size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
          </Dropzone.Idle>
          <div>
            <Text size="lg" inline>
              {multiple ? "Arrastra PDFs aquí" : "Arrastra un PDF aquí"}
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              o haz clic para seleccionar
            </Text>
          </div>
        </Group>
      </Dropzone>

      {files.length > 0 && (
        <div style={{ marginTop: rem(12) }}>
          {files.map((file, i) => (
            <Group
              key={`${file.name}-${i}`}
              justify="space-between"
              py={4}
              px="sm"
              style={{
                borderRadius: "var(--mantine-radius-sm)",
                backgroundColor: "var(--mantine-color-default-hover)",
                marginBottom: 4,
              }}
            >
              <Group gap="xs">
                <IconFileTypePdf size={16} />
                <Text size="sm" truncate style={{ maxWidth: 300 }}>
                  {file.name}
                </Text>
                <Text size="xs" c="dimmed">
                  ({(file.size / 1024).toFixed(0)} KB)
                </Text>
              </Group>
              <IconX
                size={16}
                style={{ cursor: "pointer" }}
                onClick={() => onRemove(i)}
                color="var(--mantine-color-red-6)"
              />
            </Group>
          ))}
        </div>
      )}
    </div>
  );
}
