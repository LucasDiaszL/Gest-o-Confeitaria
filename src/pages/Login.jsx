import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import QRCode from "qrcode";

export function Login() {

  const [modoCadastro, setModoCadastro] =
    useState(false);

  const [nome, setNome] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [token, setToken] =
    useState("");

  const [step, setStep] =
    useState("credentials");

  const [loading, setLoading] =
    useState(false);

  const [erro, setErro] =
    useState("");

  // MFA
  const [qrCode, setQrCode] =
    useState("");

  const [factorId, setFactorId] =
    useState("");

  // LOGIN
  const handleLogin = async (e) => {

    e.preventDefault();

    setErro("");
    setLoading(true);

    try {

      // LOGIN
      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;

      // LISTA FATORES
      const {
        data: factors,
        error: factorError,
      } = await supabase.auth.mfa.listFactors();

      if (factorError) throw factorError;

      // NÃO POSSUI MFA
      if (factors.totp.length === 0) {

        await handleEnableMFA();

        return;
      }

      // POSSUI MFA
      setFactorId(
        factors.totp[0].id
      );

      setStep("mfa");

    } catch (err) {

      setErro(err.message);

    } finally {

      setLoading(false);
    }
  };

  // CADASTRO
  const handleCadastro = async (e) => {

    e.preventDefault();

    setErro("");
    setLoading(true);

    try {

      const { error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome,
            },
          },
        });

      if (error) throw error;

      alert(
        "Conta criada com sucesso!"
      );

      setModoCadastro(false);

      setNome("");
      setEmail("");
      setPassword("");

    } catch (err) {

      setErro(err.message);

    } finally {

      setLoading(false);
    }
  };

  // ATIVAR MFA
  const handleEnableMFA = async () => {

    try {

      const {
        data,
        error,
      } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (error) throw error;

      setFactorId(data.id);

      // GERA QR
      const qr =
        await QRCode.toDataURL(
          data.totp.uri
        );

      setQrCode(qr);

      setStep("setup-mfa");

    } catch (err) {

      setErro(err.message);
    }
  };

  // CONFIRMAR SETUP MFA
  const handleVerifySetupMFA = async (e) => {

    e.preventDefault();

    setErro("");
    setLoading(true);

    try {

      const { error } =
        await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code: token,
        });

      if (error) throw error;

      // REFRESH JWT -> aal2
      await supabase.auth.refreshSession();

      setToken("");

      setStep("logged");

      window.location.reload();

    } catch (err) {

      setErro(err.message);

    } finally {

      setLoading(false);
    }
  };

  // LOGIN MFA
  const handleVerifyMFA = async (e) => {

    e.preventDefault();

    setErro("");
    setLoading(true);

    try {

      const { error } =
        await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code: token,
        });

      if (error) throw error;

      // REFRESH JWT
      await supabase.auth.refreshSession();

      setStep("logged");

      window.location.reload();

    } catch (err) {

      setErro(err.message);

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="flex h-screen items-center justify-center bg-[#FDF8F9]">

      <div className="w-full max-w-sm bg-white p-10 rounded-[3rem] shadow-xl">

        {/* HEADER */}
        <div className="text-center mb-8">

          <span className="text-5xl">
            🧁
          </span>

          <h1 className="text-2xl font-black mt-4">
            Doce Controle
          </h1>

        </div>

        {/* ERRO */}
        {erro && (

          <div className="bg-red-100 p-3 rounded-xl mb-4 text-red-500 text-sm">

            {erro}

          </div>

        )}

        {/* LOGIN */}
        {step === "credentials" &&
          !modoCadastro && (

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >

            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e)=>
                setEmail(e.target.value)
              }
              className="w-full p-4 rounded-xl bg-slate-100"
            />

            <input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e)=>
                setPassword(e.target.value)
              }
              className="w-full p-4 rounded-xl bg-slate-100"
            />

            <button
              className="w-full p-4 bg-slate-900 text-white rounded-xl"
            >
              {loading
                ? "Entrando..."
                : "Entrar"}
            </button>

            <button
              type="button"
              onClick={()=>
                setModoCadastro(true)
              }
              className="w-full text-sm text-pink-500"
            >
              Criar conta
            </button>

          </form>
        )}

        {/* CADASTRO */}
        {modoCadastro && (

          <form
            onSubmit={handleCadastro}
            className="space-y-4"
          >

            <input
              placeholder="Nome"
              value={nome}
              onChange={(e)=>
                setNome(e.target.value)
              }
              className="w-full p-4 rounded-xl bg-slate-100"
            />

            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e)=>
                setEmail(e.target.value)
              }
              className="w-full p-4 rounded-xl bg-slate-100"
            />

            <input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e)=>
                setPassword(e.target.value)
              }
              className="w-full p-4 rounded-xl bg-slate-100"
            />

            <button
              className="w-full p-4 bg-pink-500 text-white rounded-xl"
            >
              {loading
                ? "Criando..."
                : "Cadastrar"}
            </button>

            <button
              type="button"
              onClick={()=>
                setModoCadastro(false)
              }
              className="w-full text-sm"
            >
              Voltar
            </button>

          </form>
        )}

        {/* SETUP MFA */}
        {step === "setup-mfa" && (

          <form
            onSubmit={handleVerifySetupMFA}
            className="space-y-4"
          >

            <div className="text-center">

              <h2 className="font-bold mb-4">
                Escaneie o QR Code
              </h2>

              {qrCode && (

                <img
                  src={qrCode}
                  alt="QR Code"
                  className="mx-auto w-52"
                />

              )}

              <p className="text-sm text-slate-500 mt-4">

                Use:
                <br />

                Google Authenticator,
                Authy ou Microsoft Authenticator.

              </p>

            </div>

            <input
              placeholder="Código do autenticador"
              value={token}
              onChange={(e)=>
                setToken(e.target.value)
              }
              className="w-full p-4 rounded-xl bg-slate-100"
            />

            <button
              className="w-full p-4 bg-green-500 text-white rounded-xl"
            >
              {loading
                ? "Verificando..."
                : "Ativar autenticação"}
            </button>

          </form>
        )}

        {/* LOGIN MFA */}
        {step === "mfa" && (

          <form
            onSubmit={handleVerifyMFA}
            className="space-y-4"
          >

            <div className="text-center">

              <h2 className="font-bold">
                Autenticação 2FA
              </h2>

              <p className="text-sm text-slate-500 mt-2">

                Digite o código do aplicativo autenticador

              </p>

            </div>

            <input
              placeholder="000000"
              value={token}
              onChange={(e)=>
                setToken(e.target.value)
              }
              className="w-full p-4 rounded-xl bg-slate-100"
            />

            <button
              className="w-full p-4 bg-green-500 text-white rounded-xl"
            >
              {loading
                ? "Verificando..."
                : "Verificar código"}
            </button>

          </form>
        )}

      </div>

    </div>
  );
}