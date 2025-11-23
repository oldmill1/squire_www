import { OpenAIService } from './OpenAIService';

// Simple test function to verify the OpenAI service works
export async function testOpenAIService(apiKey: string): Promise<void> {
	try {
		console.log('Testing OpenAI service...');

		const openAIService = new OpenAIService(apiKey);

		// Test 1: Simple text generation
		console.log('Test 1: Simple text generation');
		const simpleResponse = await openAIService.generateText(
			'Write a short haiku about programming',
			'You are a poet who writes about technology.',
			100
		);
		console.log('Haiku:', simpleResponse);

		// Test 2: Generate items
		console.log('\nTest 2: Generate items');
		const items = await openAIService.generateItems(
			'healthy breakfast ideas',
			'Generate a list of healthy breakfast options.',
			5
		);
		console.log('Breakfast ideas:', items);

		// Test 3: Generate JSON
		console.log('\nTest 3: Generate JSON');
		const jsonData = await openAIService.generateJson(
			'Create a profile for a software developer',
			'Generate a realistic developer profile.',
			{
				type: 'object',
				properties: {
					name: { type: 'string' },
					yearsExperience: { type: 'number' },
					skills: { type: 'array', items: { type: 'string' } },
					preferredLanguage: { type: 'string' }
				},
				required: ['name', 'yearsExperience', 'skills', 'preferredLanguage']
			}
		);
		console.log('Developer profile:', jsonData);

		console.log('\n✅ All tests passed!');
	} catch (error) {
		console.error('❌ Test failed:', error);
		throw error;
	}
}

// Note: This test function should be called with your actual API key
// Example usage in a component or script:
// await testOpenAIService('your-openai-api-key-here');
