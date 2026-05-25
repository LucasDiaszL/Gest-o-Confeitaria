# Arquitetura do Sistema

## Visão Geral

O Doce Controle segue uma arquitetura cliente-servidor baseada em frontend web integrado ao Supabase.

O sistema foi desenvolvido visando:

- organização modular;
- facilidade de manutenção;
- escalabilidade futura;
- separação de responsabilidades.

---

## Stack Tecnológica

Frontend:
- React
- Vite
- Tailwind CSS

Backend/Serviços:
- Supabase

Banco de dados:
- PostgreSQL (Supabase)

Versionamento:
- Git + GitHub

---

## Fluxo de comunicação

Usuário
   ↓
Interface React
   ↓
Hooks
   ↓
Services
   ↓
Supabase API
   ↓
Banco PostgreSQL

---

## Estrutura do projeto

src/
├── components/
├── pages/
├── hooks/
├── services/
├── assets/
└── supabase/

---

## Justificativa arquitetural

React foi utilizado pela componentização e reutilização de código.

Supabase foi adotado devido à integração entre autenticação, API e persistência de dados.