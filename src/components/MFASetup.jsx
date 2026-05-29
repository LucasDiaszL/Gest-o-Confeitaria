import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import QRCode from "qrcode";

export function MFASetup() {

  const [qr, setQr] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    generateFactor();
  }, []);

  const generateFactor = async () => {

    const { data, error } =
      await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setFactorId(data.id);

    const qrCode =
      await QRCode.toDataURL(data.totp.uri);

    setQr(qrCode);
  };

  const verifyFactor = async () => {

    const { error } =
      await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode,
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("2FA ativado com sucesso!");
  };

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
        onChange={(e)=>setVerifyCode(e.target.value)}
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