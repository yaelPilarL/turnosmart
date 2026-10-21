import { Router } from 'express';
import {
  onboardingSchema,
  updateBusinessSchema,
  type BusinessDto,
  type MeResponse,
} from '@turnosmart/shared';
import { authenticate, requirePermission, requireProfile, type TokenVerifier } from '../../middleware/auth';
import { parse } from '../../lib/http';
import type { BusinessRecord, IdentityRepository, ProfileWithBusiness } from './repository';

const toBusinessDto = (b: BusinessRecord): BusinessDto => ({
  id: b.id,
  name: b.name,
  timezone: b.timezone,
  createdAt: b.createdAt.toISOString(),
});

function toMe(user: { id: string; email: string | null }, found: ProfileWithBusiness | null): MeResponse {
  if (!found) return { onboarded: false, user };
  return {
    onboarded: true,
    user,
    profile: { id: found.profile.id, fullName: found.profile.fullName, role: found.profile.role },
    business: toBusinessDto(found.business),
  };
}

export function identityRouter(deps: { verifier: TokenVerifier; identity: IdentityRepository }): Router {
  const router = Router();
  const auth = authenticate(deps.verifier);

  router.get('/me', auth, async (req, res) => {
    const found = await deps.identity.findProfileWithBusiness(req.user!.id);
    res.json(toMe(req.user!, found));
  });

  router.post('/onboarding', auth, async (req, res) => {
    const input = parse(onboardingSchema, req.body);
    const result = await deps.identity.onboard({
      userId: req.user!.id,
      businessName: input.businessName,
      timezone: input.timezone,
      fullName: input.fullName ?? null,
    });
    res.status(result.created ? 201 : 200).json(toMe(req.user!, result));
  });

  router.patch(
    '/business',
    auth,
    requireProfile(deps.identity),
    requirePermission('business:update'),
    async (req, res) => {
      const input = parse(updateBusinessSchema, req.body);
      const business = await deps.identity.updateBusiness(req.auth!.businessId, input);
      res.json(toBusinessDto(business));
    },
  );

  return router;
}
