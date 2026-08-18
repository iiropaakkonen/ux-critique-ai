# UX Critique AI

An AI-powered UI/UX critique tool that evaluates interface screenshots against a structured, confidence-aware rubric — distinguishing well-established usability/trust research from an original, smaller-scale study, rather than presenting all findings with equal certainty.

## Why this exists

Most "AI reviews your UI" tools apply a single undifferentiated rubric and present every finding with the same confidence. This project takes a different approach: findings are explicitly tiered.

- **Established** — grounded in peer-reviewed trust and HCI research (Mayer et al.'s trust model, Hancock et al.'s elaborated trust model, McKnight et al., Nielsen's usability heuristics).
- **Exploratory** — derived from an original empirical study (my Master's thesis, *Design Framework for Trustworthy User Interfaces*, University of Turku, 2026), which validated a Trustworthy UI Design Framework (TUIDF) against a control prototype across two focus groups. Findings from this tier are flagged with their actual confidence limitations rather than stated as fact.

The tool is designed to keep learning: every finding can be accepted, dismissed, or flagged by a user, feeding a growing signal on which criteria actually hold up in practice — an explicit response to validating a framework on a small sample size, rather than pretending it's settled.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind, shadcn/ui
- **Backend:** Next.js API routes
- **Database:** PostgreSQL via Supabase, accessed with Prisma 7 (driver adapter pattern)
- **File storage:** Supabase Storage
- **AI:** Anthropic API (vision-capable model), structured JSON output validated with Zod
- **Deployment:** Vercel

## Status

🚧 In active development.

- [x] Project scaffold, database schema, seeded rubric criteria
- [x] Screenshot upload pipeline (storage + database record)
- [x] Claude API integration (rubric-driven critique generation)
- [x] Results UI with tier-based display
- [x] Feedback loop (accept/dismiss/flag per finding)
- [ ] Tests + CI
- [ ] Production hardening (rate limiting, error tracking)

## Background

This project extends the rubric developed and empirically tested in my Master's thesis at the University of Turku, applying it as a working tool rather than a static checklist.

## Live demo

You will find the live demo here once it is up.