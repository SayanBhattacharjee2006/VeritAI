import json
import unittest
from unittest.mock import AsyncMock, patch

from app.agents import claim_refiner, judge_agent
from app.api.routes.verify import _apply_evidence_sufficiency_guard
from app.models.claim import ExtractedClaim


class JudgeAgentTests(unittest.IsolatedAsyncioTestCase):
    async def test_judge_claim_flips_true_when_reasoning_says_claim_is_false(self):
        mocked_response = json.dumps({
            'reasoning': (
                'The evidence directly contradicts the statement. '
                'The claim is false based on the summary provided.'
            ),
            'verdict': 'true',
            'raw_confidence': 92,
        })

        with patch(
            'app.agents.judge_agent.chat',
            new=AsyncMock(return_value=mocked_response),
        ):
            verdict, reasoning, raw_conf = await judge_agent.judge_claim(
                'Narendra Modi is dead',
                'Multiple reliable sources show Narendra Modi is alive.',
            )

        self.assertEqual(verdict, 'false')
        self.assertIn('claim is false', reasoning.lower())
        self.assertEqual(raw_conf, 92.0)

    async def test_judge_claim_flips_false_when_reasoning_supports_claim(self):
        mocked_response = json.dumps({
            'reasoning': (
                'The evidence supports the claim and confirms the claim '
                'without contradiction.'
            ),
            'verdict': 'false',
            'raw_confidence': 81,
        })

        with patch(
            'app.agents.judge_agent.chat',
            new=AsyncMock(return_value=mocked_response),
        ):
            verdict, _, raw_conf = await judge_agent.judge_claim(
                'Capital of France is Paris',
                'Authoritative sources confirm Paris is the capital of France.',
            )

        self.assertEqual(verdict, 'true')
        self.assertEqual(raw_conf, 81.0)

    async def test_judge_claim_keeps_partial_for_ambiguous_role_claim(self):
        mocked_response = json.dumps({
            'reasoning': (
                'The evidence shows Surya Kumar Yadav captains India in T20Is, '
                'but not across every cricket format. The claim is only partly '
                'supported, so partial is the correct verdict.'
            ),
            'verdict': 'partial',
            'raw_confidence': 79,
        })

        with patch(
            'app.agents.judge_agent.chat',
            new=AsyncMock(return_value=mocked_response),
        ):
            verdict, reasoning, raw_conf = await judge_agent.judge_claim(
                'Surya Kumar Yadav is captain of Indian cricket team',
                'He captains India in T20Is, while other formats have different captains.',
            )

        self.assertEqual(verdict, 'partial')
        self.assertIn('partly', reasoning.lower())
        self.assertEqual(raw_conf, 79.0)


class VerifyGuardTests(unittest.TestCase):
    def test_sparse_low_confidence_evidence_becomes_unverifiable(self):
        verdict, reasoning, confidence = _apply_evidence_sufficiency_guard(
            'false',
            'Available evidence is limited.',
            55.0,
            1,
        )

        self.assertEqual(verdict, 'unverifiable')
        self.assertIn('Insufficient web evidence was found', reasoning)
        self.assertEqual(confidence, 45.0)

    def test_clear_multi_source_result_is_unchanged(self):
        verdict, reasoning, confidence = _apply_evidence_sufficiency_guard(
            'true',
            'Multiple authoritative sources support the claim.',
            94.0,
            3,
        )

        self.assertEqual(verdict, 'true')
        self.assertEqual(reasoning, 'Multiple authoritative sources support the claim.')
        self.assertEqual(confidence, 94.0)


class ClaimRefinerTests(unittest.IsolatedAsyncioTestCase):
    def test_prompt_mentions_ambiguous_role_context(self):
        self.assertIn('ambiguous claims', judge_agent.SYSTEM.lower())
        self.assertIn('critical rule', judge_agent.SYSTEM.lower())
        self.assertIn('captain', claim_refiner.SYSTEM.lower())
        self.assertIn('president', claim_refiner.SYSTEM.lower())
        self.assertIn('ceo', claim_refiner.SYSTEM.lower())
        self.assertIn('role context is ambiguous', claim_refiner.SYSTEM.lower())

    async def test_refine_claims_preserves_ambiguous_role_note(self):
        original = ExtractedClaim(
            id='claim-1',
            text='Surya Kumar Yadav is captain of Indian cricket team',
        )
        mocked_response = json.dumps({
            'claims': [
                {
                    'id': 'claim-1',
                    'text': (
                        'Surya Kumar Yadav is captain of Indian cricket team '
                        '(Note: role context is ambiguous - verify across all contexts)'
                    ),
                    'is_temporal': False,
                }
            ]
        })

        with patch(
            'app.agents.claim_refiner.chat',
            new=AsyncMock(return_value=mocked_response),
        ):
            refined = await claim_refiner.refine_claims([original])

        self.assertEqual(len(refined), 1)
        self.assertIn('role context is ambiguous', refined[0].text.lower())


if __name__ == '__main__':
    unittest.main()
