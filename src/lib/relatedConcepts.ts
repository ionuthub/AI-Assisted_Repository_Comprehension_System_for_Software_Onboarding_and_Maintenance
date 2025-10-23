export interface Concept {
  name: string;
  description: string;
  link?: string;
}

export interface RelatedConcepts {
  primary: Concept;
  related: Concept[];
}

const CONCEPT_GRAPH: Record<string, Concept & { related: string[] }> = {
  variables: {
    name: "Variables",
    description: "Named containers that store values in memory",
    related: ["const", "let", "var", "scope", "assignment", "data-types"],
    link: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Variables"
  },
  const: {
    name: "const",
    description: "Declares a constant variable that cannot be reassigned",
    related: ["variables", "let", "var", "immutability", "scope"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const"
  },
  let: {
    name: "let",
    description: "Declares a block-scoped variable that can be reassigned",
    related: ["variables", "const", "var", "scope", "hoisting"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let"
  },
  var: {
    name: "var",
    description: "Declares a function-scoped variable (older syntax)",
    related: ["variables", "let", "const", "scope", "hoisting"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var"
  },
  functions: {
    name: "Functions",
    description: "Reusable blocks of code that perform specific tasks",
    related: ["arrow-functions", "parameters", "return", "scope", "callbacks"],
    link: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Functions"
  },
  "arrow-functions": {
    name: "Arrow Functions",
    description: "Concise syntax for writing functions using =>",
    related: ["functions", "callbacks", "this", "parameters"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions"
  },
  loops: {
    name: "Loops",
    description: "Repeat code blocks multiple times",
    related: ["for", "while", "array-methods", "iteration"],
    link: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Looping_code"
  },
  for: {
    name: "for Loop",
    description: "Loop that runs a specific number of times",
    related: ["loops", "while", "array-methods", "iteration"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for"
  },
  while: {
    name: "while Loop",
    description: "Loop that continues while a condition is true",
    related: ["loops", "for", "do-while", "conditions"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while"
  },
  conditions: {
    name: "Conditionals",
    description: "Execute code based on whether conditions are true or false",
    related: ["if", "else", "switch", "ternary", "logical-operators"],
    link: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/conditionals"
  },
  if: {
    name: "if Statement",
    description: "Execute code if a condition is true",
    related: ["conditions", "else", "else-if", "logical-operators"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else"
  },
  else: {
    name: "else Statement",
    description: "Execute code if the if condition is false",
    related: ["if", "else-if", "conditions"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else"
  },
  "array-methods": {
    name: "Array Methods",
    description: "Built-in functions for working with arrays",
    related: ["map", "filter", "reduce", "forEach", "arrays"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array"
  },
  map: {
    name: "Array.map()",
    description: "Transform each element in an array",
    related: ["array-methods", "filter", "forEach", "callbacks"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map"
  },
  filter: {
    name: "Array.filter()",
    description: "Keep only elements that match a condition",
    related: ["array-methods", "map", "forEach", "callbacks"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter"
  },
  reduce: {
    name: "Array.reduce()",
    description: "Combine array elements into a single value",
    related: ["array-methods", "map", "filter", "callbacks", "accumulator"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce"
  },
  objects: {
    name: "Objects",
    description: "Collections of key-value pairs",
    related: ["properties", "methods", "destructuring", "spread-operator"],
    link: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects"
  },
  classes: {
    name: "Classes",
    description: "Blueprints for creating objects with properties and methods",
    related: ["objects", "constructors", "inheritance", "methods"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes"
  },
  async: {
    name: "Async/Await",
    description: "Handle asynchronous operations with cleaner syntax",
    related: ["promises", "callbacks", "error-handling", "try-catch"],
    link: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises"
  },
  promises: {
    name: "Promises",
    description: "Objects representing eventual completion of async operations",
    related: ["async", "callbacks", "then", "catch"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise"
  },
  scope: {
    name: "Scope",
    description: "Determines where variables are accessible",
    related: ["variables", "global", "local", "closure"],
    link: "https://developer.mozilla.org/en-US/docs/Glossary/Scope"
  },
  "data-types": {
    name: "Data Types",
    description: "Different kinds of values (string, number, boolean, etc.)",
    related: ["strings", "numbers", "booleans", "null", "undefined"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures"
  },
  strings: {
    name: "Strings",
    description: "Text values enclosed in quotes",
    related: ["data-types", "template-literals", "string-methods"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String"
  },
  numbers: {
    name: "Numbers",
    description: "Numeric values (integers and decimals)",
    related: ["data-types", "math", "operators"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number"
  },
  booleans: {
    name: "Booleans",
    description: "Values that are either true or false",
    related: ["data-types", "conditions", "logical-operators"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean"
  },
  operators: {
    name: "Operators",
    description: "Symbols that perform operations on values",
    related: ["arithmetic", "logical-operators", "comparison"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators"
  },
  "logical-operators": {
    name: "Logical Operators",
    description: "Combine conditions using &&, ||, and !",
    related: ["operators", "conditions", "booleans"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND"
  },
  "spread-operator": {
    name: "Spread Operator",
    description: "Expand arrays or objects into individual elements",
    related: ["arrays", "objects", "destructuring"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax"
  },
  destructuring: {
    name: "Destructuring",
    description: "Extract values from arrays or objects into variables",
    related: ["arrays", "objects", "spread-operator"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment"
  },
  "template-literals": {
    name: "Template Literals",
    description: "Strings with embedded expressions using backticks",
    related: ["strings", "variables", "interpolation"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals"
  },
  "error-handling": {
    name: "Error Handling",
    description: "Manage and respond to errors gracefully",
    related: ["try-catch", "throw", "finally"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling"
  },
  "try-catch": {
    name: "try...catch",
    description: "Catch and handle errors in code",
    related: ["error-handling", "finally", "throw"],
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch"
  }
};

export const extractConcepts = (explanation: string): string[] => {
  const concepts: string[] = [];
  const lowerExplanation = explanation.toLowerCase();

  for (const conceptKey in CONCEPT_GRAPH) {
    const concept = CONCEPT_GRAPH[conceptKey];
    if (lowerExplanation.includes(concept.name.toLowerCase())) {
      concepts.push(conceptKey);
    }
  }

  return [...new Set(concepts)];
};

export const getRelatedConcepts = (explanation: string): RelatedConcepts[] => {
  const concepts = extractConcepts(explanation);
  
  return concepts.map(conceptKey => {
    const concept = CONCEPT_GRAPH[conceptKey];
    const relatedKeys = concept.related || [];
    
    const related = relatedKeys
      .map(key => CONCEPT_GRAPH[key])
      .filter(Boolean)
      .slice(0, 3); // Limit to 3 related concepts

    return {
      primary: {
        name: concept.name,
        description: concept.description,
        link: concept.link
      },
      related
    };
  });
};

export const getAllConcepts = (): Record<string, Concept> => {
  const result: Record<string, Concept> = {};
  for (const key in CONCEPT_GRAPH) {
    const { related, ...concept } = CONCEPT_GRAPH[key];
    result[key] = concept;
  }
  return result;
};
