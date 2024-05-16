import { Project } from 'ts-morph';

async function findUnusedVariables() {
  // Create a new TypeScript project
  const project = new Project();

  // Load all TypeScript files in the 'src' directory
  const sourceFiles = project.addSourceFilesAtPaths('src/**/*.ts');

  // Object to store variable usage
  const variableUsage: { [key: string]: boolean } = {};

  // Iterate over each source file
  sourceFiles.forEach(sourceFile => {
    // Get all variable declarations in the source file
    const variableDeclarations = sourceFile.getVariableDeclarations();

    // Mark all variable declarations as unused by default
    variableDeclarations.forEach(variableDeclaration => {
      const variableName = variableDeclaration.getName();
      variableUsage[variableName] = false;
    });

    // Traverse the AST of the source file
    sourceFile.forEachDescendant(node => {
      // Check if the node is an identifier (variable usage)
      if (node.getKindName() === 'Identifier') {
        // Get the name of the identifier
        const identifierName = node.getText();

        // Check if the identifier corresponds to a variable declaration
        if (variableUsage.hasOwnProperty(identifierName)) {
          // Mark the variable as used
          variableUsage[identifierName] = true;
        }
      }
    });
  });

  // Generate Markdown report with unused variables
  const unusedVariables = Object.entries(variableUsage)
    .filter(([_, used]) => !used)
    .map(([variable]) => `- [${variable}](#${variable})`)
    .join('\n');

  // Write the report to a file
  await writeFile('unused_variables.md', unusedVariables);
}

async function writeFile(filePath: string, content: string) {
  const fs = require('fs').promises;
  await fs.writeFile(filePath, content, 'utf-8');
}

// Run the function to find unused variables
findUnusedVariables()
  .then(() => console.log('Unused variables report generated successfully.'))
  .catch(error => console.error('Error generating unused variables report:', error));
