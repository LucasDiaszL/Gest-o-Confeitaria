import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import QRCode from "qrcode";

export function MFASetup() {
  const [qr, setQr] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [message, setMessage] = useState("");

  // 🔥 CORREÇÃO DEFINTIVA: Lógica movida para dentro do useEffect.
  // O Linter aceita isso perfeitamente porque a função fica isolada no ciclo de montagem.
  useEffect(() => {
    async function inicializarMFA() {
      try {
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: "totp",
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        setFactorId(data.id);

        const qrCode = await QRCode.toDataURL(data.totp.uri);
        setQr(qrCode);
      } catch (err) {
        console.error("Erro ao inicializar MFA:", err);
      }
    }

    inicializarMFA();
  }, []); // Array vazia = roda apenas uma vez ao montar a tela

  // Função de verificação protegida com useCallback
  const verifyFactor = useCallback(async () => {
    if (!factorId || !verifyCode) return;
    
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: verifyCode,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("2FA ativado com sucesso!");
  }, [factorId, verifyCode]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        Configurar 2FA
      </h2>

      {qr && (
        <img
          src={qr}
          alt="QR Code"
          className="w-64"
        />
      )}

      <input
        placeholder="Código do app"
        value={verifyCode}
        onChange={(e) => setVerifyCode(e.target.value)}
        className="w-full p-4 rounded-xl bg-slate-100"
      />

      <button
        onClick={verifyFactor}
        className="w-full p-4 bg-green-500 text-white rounded-xl"
      >
        Verificar
      </button>

      {message && (
        <div>
          {message}
        </div>
      )}
    </div>
  );
}