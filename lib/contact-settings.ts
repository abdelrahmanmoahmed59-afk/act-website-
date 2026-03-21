import { contactTemplate } from '@/lib/content/contact-template'
import type { ContactSettingsInput } from '@/lib/validation/contact'

type LocalizedText = ContactSettingsInput['title']

function normalizeRequiredString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function normalizeLocalizedText(value: unknown, fallback: LocalizedText, options?: { allowEmpty?: boolean }): LocalizedText {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const allowEmpty = options?.allowEmpty ?? false

  return {
    en:
      typeof source.en === 'string' && (allowEmpty || source.en.trim())
        ? source.en.trim()
        : fallback.en,
    ar:
      typeof source.ar === 'string' && (allowEmpty || source.ar.trim())
        ? source.ar.trim()
        : fallback.ar,
  }
}

function splitLegacyLine(value: unknown): [string, string] {
  if (typeof value !== 'string') return ['', '']

  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return ['', '']
  if (lines.length === 1) return [lines[0], '']
  return [lines[0], lines.slice(1).join(' ')]
}

function splitLegacyIntro(value: unknown) {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : null
  if (!source) return null

  const [enLineOne, enLineTwo] = splitLegacyLine(source.en)
  const [arLineOne, arLineTwo] = splitLegacyLine(source.ar)

  if (!enLineOne && !enLineTwo && !arLineOne && !arLineTwo) return null

  return {
    introLineOne: { en: enLineOne, ar: arLineOne },
    introLineTwo: { en: enLineTwo, ar: arLineTwo },
  }
}

export function normalizeContactSettings(input: unknown): ContactSettingsInput {
  const source = input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
  const legacyIntro = splitLegacyIntro(source.intro)

  return {
    title: normalizeLocalizedText(source.title, contactTemplate.title),
    introLineOne: normalizeLocalizedText(
      source.introLineOne,
      legacyIntro?.introLineOne ?? contactTemplate.introLineOne
    ),
    introLineTwo: normalizeLocalizedText(
      source.introLineTwo,
      legacyIntro?.introLineTwo ?? { en: '', ar: '' },
      { allowEmpty: true }
    ),
    emailText: normalizeRequiredString(source.emailText, contactTemplate.emailText),
    phoneNum: normalizeRequiredString(source.phoneNum, contactTemplate.phoneNum),
    address: normalizeLocalizedText(source.address, contactTemplate.address),
    mapSrc: normalizeRequiredString(source.mapSrc, contactTemplate.mapSrc),
  }
}
