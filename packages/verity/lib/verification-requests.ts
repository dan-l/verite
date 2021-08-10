import { v4 as uuidv4 } from "uuid"
import {
  InputDescriptorConstraintField,
  InputDescriptorConstraintStatusDirective
} from "../types"
import type { PresentationDefinition, VerificationRequest } from "../types"

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30
const KYC_PRESENTATION_DEFINITION_ID = "KYCAMLPresentationDefinition"
const CREDIT_SCORE_PRESENTATION_DEFINITION_ID =
  "CreditScorePresentationDefinition"

export function kycPresentationDefinition(
  trustedAuthorities: string[] = []
): PresentationDefinition {
  const requiredFields: Record<string, string> = {
    authorityId: "string",
    approvalDate: "string"
  }

  const fields: InputDescriptorConstraintField[] = Object.keys(
    requiredFields
  ).map((key) => {
    return {
      path: [
        `$.credentialSubject.KYCAMLAttestation.${key}`,
        `$.vc.credentialSubject.KYCAMLAttestation.${key}`,
        `$.KYCAMLAttestation.${key}`
      ],
      purpose: `The KYC/AML Attestation is missing the field: '${key}'.`,
      predicate: "required",
      filter: {
        type: requiredFields[key]
      }
    }
  })

  if (trustedAuthorities.length > 0) {
    fields.push({
      path: ["$.issuer", "$.vc.issuer", "$.iss", "$.issuer.id"],
      purpose:
        "We can only verify KYC/AML credentials attested by a trusted authority.",
      filter: {
        type: "string",
        pattern: trustedAuthorities.join("|")
      }
    })
  }

  return {
    id: KYC_PRESENTATION_DEFINITION_ID,
    input_descriptors: [
      {
        id: "kycaml_input",
        name: "Proof of KYC",
        purpose: "Please provide a valid credential from a KYC/AML issuer",
        schema: [
          {
            uri: "https://verity.id/schemas/identity/1.0.0/KYCAMLAttestation",
            required: true
          }
        ],
        constraints: {
          statuses: {
            active: {
              directive: InputDescriptorConstraintStatusDirective.REQUIRED
            }
          },
          fields
        }
      }
    ]
  }
}

// TODO(kim)
// TODO: How do we better pass these parameters?
export const generateKycVerificationRequest = (
  from: string,
  replyUrl: string,
  replyTo: string,
  callbackUrl?: string,
  trustedAuthorities: string[] = [],
  id = uuidv4()
): VerificationRequest => {
  const now = Date.now()
  const expires = now + ONE_MONTH

  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://identity.foundation/presentation-exchange/definition/v1"
    ],
    type: ["VerifiablePresentation", "PresentationDefinition"],
    request: {
      id,
      from: from,
      created_time: now,
      expires_time: expires,
      reply_url: replyUrl,
      reply_to: [replyTo],
      callback_url: callbackUrl,
      challenge: "e1b35ae0-9e0e-11ea-9bbf-a387b27c9e61" // TODO: Challenge
    },
    presentation_definition: kycPresentationDefinition(trustedAuthorities)
  }
}

function creditScorePresentationDefinition(
  trustedAuthorities: string[] = [],
  minimumCreditScore?: number
): PresentationDefinition {
  const requiredFields: Record<string, string> = {
    score: "number",
    scoreType: "string",
    provider: "string"
  }

  const fields: InputDescriptorConstraintField[] = Object.keys(
    requiredFields
  ).map((key) => {
    return {
      path: [
        `$.credentialSubject.CreditScoreAttestation.${key}`,
        `$.vc.credentialSubject.CreditScoreAttestation.${key}`,
        `$.CreditScoreAttestation.${key}`
      ],
      purpose: `The Credit Score Attestation is missing the field: '${key}'.`,
      predicate: "required",
      filter: {
        type: requiredFields[key]
      }
    }
  })

  if (trustedAuthorities.length > 0) {
    fields.push({
      path: ["$.issuer", "$.vc.issuer", "$.iss", "$.issuer.id"],
      purpose:
        "We can only verify Credit Score credentials attested by a trusted authority.",
      filter: {
        type: "string",
        pattern: trustedAuthorities.join("|")
      }
    })
  }

  if (minimumCreditScore) {
    fields.push({
      path: [
        "$.credentialSubject.CreditScoreAttestation.score",
        "$.vc.credentialSubject.CreditScoreAttestation.score",
        "$.CreditScoreAttestation.score"
      ],
      purpose: `We can only verify Credit Score credentials that are above ${minimumCreditScore}.`,
      filter: {
        type: "number",
        exclusiveMinimum: minimumCreditScore
      }
    })
  }

  return {
    id: CREDIT_SCORE_PRESENTATION_DEFINITION_ID,
    input_descriptors: [
      {
        id: "creditScore_input",
        name: "Proof of Credit Score",
        purpose: "Please provide a valid credential from a Credit Score issuer",
        schema: [
          {
            uri: "https://verity.id/schemas/identity/1.0.0/CreditScoreAttestation",
            required: true
          }
        ],
        constraints: {
          statuses: {
            active: {
              directive: InputDescriptorConstraintStatusDirective.REQUIRED
            }
          },
          fields
        }
      }
    ]
  }
}

export const generateCreditScoreVerificationRequest = (
  from: string,
  replyUrl: string,
  replyTo: string,
  callbackUrl?: string,
  trustedAuthorities: string[] = [],
  minimumCreditScore?: number,
  id = uuidv4()
): VerificationRequest => {
  const now = Date.now()
  const expires = now + ONE_MONTH

  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://identity.foundation/presentation-exchange/definition/v1"
    ],
    type: ["VerifiablePresentation", "PresentationDefinition"],
    request: {
      id,
      from: from,
      created_time: now,
      expires_time: expires,
      reply_url: replyUrl,
      reply_to: [replyTo],
      callback_url: callbackUrl,
      challenge: "e1b35ae0-9e0e-11ea-9bbf-a387b27c9e61" // TODO: Challenge
    },
    presentation_definition: creditScorePresentationDefinition(
      trustedAuthorities,
      minimumCreditScore
    )
  }
}
