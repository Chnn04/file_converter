"use client";

import { useState } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Anchor,
  Alert,
  Divider,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Revisa tu correo para confirmar la cuenta.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

  return (
    <Container size={420} py={60}>
      <Title ta="center" order={2}>
        {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5} mb={30}>
        {mode === "login" ? (
          <>
            ¿No tienes cuenta?{" "}
            <Anchor component="button" size="sm" onClick={() => setMode("signup")}>
              Regístrate
            </Anchor>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Anchor component="button" size="sm" onClick={() => setMode("login")}>
              Inicia sesión
            </Anchor>
          </>
        )}
      </Text>

      {!supabaseConfigured && (
        <Alert color="yellow" icon={<IconAlertCircle size={18} />} mb="md">
          Supabase no está configurado. Copia <code>.env.local.example</code> a{" "}
          <code>.env.local</code> y añade tus claves de Supabase.
        </Alert>
      )}

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="tu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              type="email"
            />
            <PasswordInput
              label="Contraseña"
              placeholder="Tu contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />

            {error && (
              <Alert color="red" icon={<IconAlertCircle size={16} />} p="xs">
                {error}
              </Alert>
            )}
            {success && (
              <Alert color="green" icon={<IconCheck size={16} />} p="xs">
                {success}
              </Alert>
            )}

            <Button type="submit" fullWidth loading={loading} disabled={!supabaseConfigured}>
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </Button>
          </Stack>
        </form>

        <Divider my="md" />

        <Anchor component={Link} href="/" size="sm" c="dimmed" ta="center" display="block">
          ← Volver a herramientas (sin cuenta)
        </Anchor>
      </Paper>
    </Container>
  );
}
