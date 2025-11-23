import { OpenAIService, type CompletionRequest } from './OpenAIService';

// Example usage patterns for the OpenAI service

export class OpenAIExample {
	private openAIService: OpenAIService;

	constructor(apiKey: string) {
		this.openAIService = new OpenAIService(apiKey);
	}

	// Example 1: Generate a todo list
	async generateTodoList(topic: string): Promise<string[]> {
		const instructions = 'You are a helpful assistant that generates practical todo lists.';
		const prompt = `Generate a todo list for: ${topic}`;

		return await this.openAIService.generateItems(prompt, instructions, 8);
	}

	// Example 2: Generate blog post ideas
	async generateBlogIdeas(subject: string): Promise<string[]> {
		const instructions =
			'You are a creative content strategist. Generate engaging blog post titles.';
		const prompt = `Generate blog post ideas about: ${subject}`;

		return await this.openAIService.generateItems(prompt, instructions, 5);
	}

	// Example 3: Generate structured data
	async generateProjectSummary(projectDescription: string): Promise<{
		title: string;
		description: string;
		keyFeatures: string[];
		estimatedTime: string;
	}> {
		const instructions = 'You are a project manager. Create a structured project summary.';
		const prompt = `Create a project summary for: ${projectDescription}`;

		const schema = {
			type: 'object',
			properties: {
				title: { type: 'string' },
				description: { type: 'string' },
				keyFeatures: { type: 'array', items: { type: 'string' } },
				estimatedTime: { type: 'string' }
			},
			required: ['title', 'description', 'keyFeatures', 'estimatedTime']
		};

		return await this.openAIService.generateJson(prompt, instructions, schema);
	}

	// Example 4: Custom chat completion
	async customCompletion(
		messages: Array<{ role: 'user' | 'assistant'; content: string }>
	): Promise<string> {
		const request: CompletionRequest = {
			messages: messages,
			instructions: 'You are a helpful AI assistant.',
			temperature: 0.7,
			maxTokens: 500
		};

		const response = await this.openAIService.createCompletion(request);
		return response.message;
	}

	// Example 5: Generate code snippets
	async generateCodeSnippet(language: string, description: string): Promise<string> {
		const instructions = `You are an expert programmer. Generate clean, well-commented code in ${language}.`;
		const prompt = `Generate a ${language} code snippet that: ${description}`;

		return await this.openAIService.generateText(prompt, instructions, 800);
	}
}

// Usage example:
/*
const example = new OpenAIExample('your-openai-api-key');

// Generate todo list
const todos = await example.generateTodoLists('planning a vacation');
console.log(todos);

// Generate blog ideas
const ideas = await example.generateBlogIdeas('artificial intelligence');
console.log(ideas);

// Generate project summary
const summary = await example.generateProjectSummary('build a mobile app');
console.log(summary);
*/
