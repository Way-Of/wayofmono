const SKILL_PATH_LABEL_PATTERN = /(?:^|\/)skills\/([^/]+)\/SKILL\.md$/i;

export function formatAgentSkillBadgeLabel(skillId: string): string {
  const trimmedSkillId = skillId.trim();
  if (!trimmedSkillId) {
    return skillId;
  }

  const match = trimmedSkillId.match(SKILL_PATH_LABEL_PATTERN);
  if (match?.[1]) {
    return match[1];
  }

  return trimmedSkillId;
}
