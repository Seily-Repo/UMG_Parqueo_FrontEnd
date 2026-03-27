import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useRegistration } from "../../context/RegistrationContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Mail, ArrowRight } from "lucide-react";

export function EmailVerification() {
  const navigate = useNavigate();
  const { currentRegistration, updateRegistration } = useRegistration();

  const [email, setEmail] = useState(currentRegistration.institutionalEmail ?? "");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(Boolean(currentRegistration.otpExpected)); // si hay otpExpected, asumimos que ya se envió
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInstitutional = useMemo(() => {
    // Cambia el dominio al que usen ustedes
    return email.trim().toLowerCase().endsWith("@miumg.edu.gt");
  }, [email]);

  async function handleSendCode() {
    setError(null);

    if (!email.trim()) {
      setError("Ingrese su correo institucional.");
      return;
    }
    if (!isInstitutional) {
      setError("Use su correo institucional (ej: usuario@miumg.edu.gt).");
      return;
    }

    setLoading(true);
    try {
      // Mock: generamos un OTP local para demo
      const otp = String(Math.floor(100000 + Math.random() * 900000));

      updateRegistration({
        institutionalEmail: email.trim(),
        otpExpected: otp, // SOLO para demo. En real se valida en backend.
        emailVerified: false,
        otpVerifiedAt: undefined,
      });

      setSent(true);

      console.log("OTP demo:", otp);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError(null);

    if (!sent) {
      setError("Primero envíe el código.");
      return;
    }
    if (!code.trim()) {
      setError("Ingrese el código.");
      return;
    }

    if (code.trim() !== currentRegistration.otpExpected) {
      setError("Código incorrecto. Revise e intente de nuevo.");
      return;
    }

    updateRegistration({
      emailVerified: true,
      otpVerifiedAt: new Date(), // Date (como en tu interfaz)
    });

    navigate("/parking/user/confirmacion");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Verificación por correo</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Para confirmar tu registro, verificaremos tu correo institucional.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">Correo institucional</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@miumg.edu.gt"
            />
          </div>

          <Button className="w-full" onClick={handleSendCode} disabled={loading}>
            Enviar código
          </Button>

          {sent && (
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Código de verificación</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 dígitos"
              />
              <Button className="w-full" onClick={handleVerify}>
                Confirmar registro <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500">
                (En demo, el código se imprime en la consola).
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}