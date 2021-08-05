import {
  decodeVerifiableCredential,
  kycAmlVerifiableCredentialPayload
} from "../../lib/utils/credentials"
import { signVerifiableCredential } from "../../lib/utils/sign-fns"
import { Issuer, Verifiable, W3CCredential } from "../../types"
import { randomDidKey, randomIssuer } from "../support/did-fns"
import { kycAmlAttestationFixture } from "./attestations"
import { revocationListFixture } from "./revocation-list"

export async function generateVerifiableCredential(
  issuer?: Issuer,
  clientDid?: string
): Promise<Verifiable<W3CCredential>> {
  issuer = issuer || (await randomIssuer())

  if (!clientDid) {
    const clientDidKey = await randomDidKey()
    clientDid = clientDidKey.controller
  }

  const signedCredential = await signVerifiableCredential(
    issuer,
    kycAmlVerifiableCredentialPayload(
      clientDid,
      kycAmlAttestationFixture,
      revocationListFixture
    )
  )

  return decodeVerifiableCredential(signedCredential)
}
