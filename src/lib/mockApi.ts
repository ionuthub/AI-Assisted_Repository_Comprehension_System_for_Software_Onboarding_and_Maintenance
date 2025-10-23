// Mock API for local development when serverless function isn't available
export async function mockExplainCode(code: string, skillLevel: string): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockExplanations: Record<string, string> = {
    beginner: `This code does something simple. Think of it like giving instructions to a computer. The computer reads each line and does what it says. It's like following a recipe step by step!`,
    intermediate: `This code demonstrates a common programming pattern. It uses variables to store data and performs operations on them. The syntax follows JavaScript conventions and would be used in typical application logic.`,
    advanced: `This code snippet illustrates fundamental programming concepts including variable assignment and arithmetic operations. From an architectural perspective, this represents basic computational logic that could be optimized through various patterns depending on the broader system context.`,
  };

  return mockExplanations[skillLevel] || mockExplanations.beginner;
}
