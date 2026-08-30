import { describe, test, expect } from 'vitest';
import { formatSkillsForPrompt } from './skills.js';
import { createSyntheticSourceInfo } from './source-info.js';

// Mock Skill interface
interface Skill {
	name: string;
	description: string;
	body?: string;
	filePath: string;
	baseDir: string;
	sourceInfo: any;
	disableModelInvocation: boolean;
}

describe('formatSkillsForPrompt', () => {
	test('default behavior includes read tool preamble and XML only', () => {
		const skills = [
			{
				name: 'test-skill-1',
				description: 'Test skill 1',
				body: 'This is the skill body content.',
				filePath: '/path/to/skill-1',
				baseDir: '/path/to',
				sourceInfo: createSyntheticSourceInfo('/path/to/skill-1', { source: 'test', scope: 'temporary', origin: 'top-level' }),
				disableModelInvocation: false,
			},
		];
		const result = formatSkillsForPrompt(skills);
		expect(result).toContain('The following skills provide specialized instructions for specific tasks.');
		expect(result).toContain('Use the read tool to load a skill\'s file when the task matches its description.');
		expect(result).toContain('<name>test-skill-1</name>');
		expect(result).toContain('<description>Test skill 1</description>');
		expect(result).toContain('<location>/path/to/skill-1</location>');
		expect(result).not.toContain('<content>This is the skill body content.</content>');
	});

	test('doNotInclude read tool preamble option removes preamble', () => {
		const skills = [
			{
				name: 'test-skill-1',
				description: 'Test skill 1',
				body: 'This is the skill body content.',
				filePath: '/path/to/skill-1',
				baseDir: '/path/to',
				sourceInfo: createSyntheticSourceInfo('/path/to/skill-1', { source: 'test', scope: 'temporary', origin: 'top-level' }),
				disableModelInvocation: false,
			},
		];
		const result = formatSkillsForPrompt(skills, { doNotInclude: 'read-tool-preamble' });
		expect(result).not.toContain('The following skills provide specialized instructions for specific tasks.');
		expect(result).toContain('<available_skills>');
		expect(result).toContain('<name>test-skill-1</name>');
		expect(result).not.toContain('<content>This is the skill body content.</content>');
	});

	test('includeBody option includes body in XML', () => {
		const skills = [
			{
				name: 'test-skill-1',
				description: 'Test skill 1',
				body: 'This is the skill body content.',
				filePath: '/path/to/skill-1',
				baseDir: '/path/to',
				sourceInfo: createSyntheticSourceInfo('/path/to/skill-1', { source: 'test', scope: 'temporary', origin: 'top-level' }),
				disableModelInvocation: false,
			},
		];
		const result = formatSkillsForPrompt(skills, { includeBody: true });
		expect(result).toContain('The following skills provide specialized instructions for specific tasks.');
		expect(result).toContain('<content>This is the skill body content.</content>');
	});

	test('doNotInclude and includeBody together work correctly', () => {
		const skills = [
			{
				name: 'test-skill-1',
				description: 'Test skill 1',
				body: 'This is the skill body content.',
				filePath: '/path/to/skill-1',
				baseDir: '/path/to',
				sourceInfo: createSyntheticSourceInfo('/path/to/skill-1', { source: 'test', scope: 'temporary', origin: 'top-level' }),
				disableModelInvocation: false,
			},
		];
		const result = formatSkillsForPrompt(skills, { doNotInclude: 'read-tool-preamble', includeBody: true });
		expect(result).not.toContain('The following skills provide specialized instructions for specific tasks.');
		expect(result).toContain('<available_skills>');
		expect(result).toContain('<content>This is the skill body content.</content>');
	});

	test('skills with disableModelInvocation=true are excluded', () => {
		const skills = [
			{
				name: 'test-skill-1',
				description: 'Test skill 1',
				body: 'This is the skill body content.',
				filePath: '/path/to/skill-1',
				baseDir: '/path/to',
				sourceInfo: createSyntheticSourceInfo('/path/to/skill-1', { source: 'test', scope: 'temporary', origin: 'top-level' }),
				disableModelInvocation: true,
			},
		];
		const result = formatSkillsForPrompt(skills);
		expect(result).toBe('');
	});

	test('empty skills array returns empty string', () => {
		const skills: Skill[] = [];
		const result = formatSkillsForPrompt(skills);
		expect(result).toBe('');
	});

	test('custom preamble works when provided', () => {
		const skills = [
			{
				name: 'test-skill-1',
				description: 'Test skill 1',
				filePath: '/path/to/skill-1',
				baseDir: '/path/to',
				sourceInfo: createSyntheticSourceInfo('/path/to/skill-1', { source: 'test', scope: 'temporary', origin: 'top-level' }),
				disableModelInvocation: false,
			},
		];
		const customPreamble = 'Custom preamble for testing';
		const result = formatSkillsForPrompt(skills, { preamble: customPreamble });
		expect(result).toContain('Custom preamble for testing');
		expect(result).not.toContain('The following skills provide specialized instructions for specific tasks.');
	});

	test('empty preamble removes preamble entirely', () => {
		const skills = [
			{
				name: 'test-skill-1',
				description: 'Test skill 1',
				filePath: '/path/to/skill-1',
				baseDir: '/path/to',
				sourceInfo: createSyntheticSourceInfo('/path/to/skill-1', { source: 'test', scope: 'temporary', origin: 'top-level' }),
				disableModelInvocation: false,
			},
		];
		const result = formatSkillsForPrompt(skills, { preamble: '' });
		expect(result).toContain('<available_skills>');
		expect(result).not.toContain('The following skills provide specialized instructions for specific tasks.');
	});
});
