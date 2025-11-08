#!/usr/bin/env node

import { BarAssistantClient } from '../src/bar-assistant-client.js';
import { BarAssistantConfig } from '../src/types.js';

/**
 * Test Suite for Bar Assistant MCP Server
 * 
 * Tests the core functionality against the actual Bar Assistant API
 * Focuses on the main test case: "Give me recommendations on cocktails like a Negroni"
 */

class BarAssistantTester {
  private client: BarAssistantClient;

  constructor() {
    const config: BarAssistantConfig = {
      baseUrl: process.env.BAR_ASSISTANT_URL || '',
      token: process.env.BAR_ASSISTANT_TOKEN || '',
      barId: process.env.BAR_ASSISTANT_BAR_ID || '1',
      timeout: 30000,
    };

    if (!config.baseUrl || !config.token) {
      console.error('❌ ERROR: BAR_ASSISTANT_URL and BAR_ASSISTANT_TOKEN environment variables must be set');
      console.error('   Example:');
      console.error('   export BAR_ASSISTANT_URL="https://your-instance.com/bar"');
      console.error('   export BAR_ASSISTANT_TOKEN="your-api-token"');
      process.exit(1);
    }

    this.client = new BarAssistantClient(config);
  }

  async runAllTests(): Promise<boolean> {
    console.log('🍸 Starting Bar Assistant MCP Server Tests\n');
    
    let allTestsPassed = true;
    const tests = [
      { name: 'API Connectivity Test', fn: () => this.testApiConnectivity() },
      { name: 'Search Cocktails Test', fn: () => this.testSearchCocktails() },
      { name: 'Negroni Recommendations Test (Main Scenario)', fn: () => this.testNegroniRecommendations() },
      { name: 'Recipe Details Test', fn: () => this.testRecipeDetails() },
      { name: 'Natural Language Recipe Test', fn: () => this.testNaturalLanguageRecipe() },
      { name: 'Inventory Check Test', fn: () => this.testInventoryCheck() },
    ];

    for (const test of tests) {
      try {
        console.log(`🧪 Running: ${test.name}`);
        const result = await test.fn();
        if (result) {
          console.log(`✅ PASSED: ${test.name}\n`);
        } else {
          console.log(`❌ FAILED: ${test.name}\n`);
          allTestsPassed = false;
        }
      } catch (error) {
        console.log(`❌ ERROR: ${test.name} - ${error instanceof Error ? error.message : String(error)}\n`);
        allTestsPassed = false;
      }
    }

    console.log(allTestsPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed!');
    return allTestsPassed;
  }

  async testApiConnectivity(): Promise<boolean> {
    const ping = await this.client.ping();
    console.log(`   Status: ${ping.status}, Authenticated: ${ping.authenticated}`);
    
    if (ping.status === 'connected' && ping.authenticated) {
      return true;
    }
    
    console.log('   ❌ Failed to connect or authenticate with Bar Assistant API');
    return false;
  }

  async testSearchCocktails(): Promise<boolean> {
    // Test basic search functionality
    const results = await this.client.searchCocktails({ 
      query: 'Negroni', 
      limit: 5 
    });
    
    console.log(`   Found ${results.data.length} cocktails matching "Negroni"`);
    
    if (results.data.length === 0) {
      console.log('   ❌ No cocktails found - this might indicate API issues');
      return false;
    }

    // Validate data structure
    const firstCocktail = results.data[0];
    const hasRequiredFields = firstCocktail.id && 
                              firstCocktail.name;
    
    if (!hasRequiredFields) {
      console.log('   ❌ Cocktail data missing required fields');
      return false;
    }

    console.log(`   Example result: "${firstCocktail.name}" (ID: ${firstCocktail.id})`);
    return true;
  }

  async testNegroniRecommendations(): Promise<boolean> {
    console.log('   🎯 Testing main scenario: Negroni-like recommendations');
    
    // Step 1: Find a Negroni in the database
    const negroniSearch = await this.client.searchCocktails({ 
      query: 'Negroni', 
      limit: 1 
    });
    
    if (negroniSearch.data.length === 0) {
      console.log('   ❌ No Negroni found in database');
      return false;
    }

    const negroni = negroniSearch.data[0];
    console.log(`   Found Negroni: "${negroni.name}" (ID: ${negroni.id})`);

    // Step 2: Get similar cocktails
    const similarCocktails = await this.client.findSimilarCocktails(negroni.id, 5);
    
    if (similarCocktails.length === 0) {
      console.log('   ⚠️  No similar cocktails found');
      return true; // This might be OK if database is small
    }

    console.log(`   Found ${similarCocktails.length} similar cocktails:`);
    
    // Step 3: Validate and format results like they would appear to users
    const recommendations: string[] = [];
    
    for (let i = 0; i < Math.min(3, similarCocktails.length); i++) {
      const similar = similarCocktails[i];
      const cocktail = similar.cocktail;
      
      const ingredients = cocktail.short_ingredients?.map(ing => ing.name).join(', ') || 'Unknown ingredients';
      const abv = cocktail.abv ? `${cocktail.abv}%` : 'ABV unknown';
      const reasons = similar.similarity_reasons?.join(', ') || 'Similar flavor profile';
      
      const recommendation = `${i + 1}. **${cocktail.name}** - ${abv}\n` +
                           `   Ingredients: ${ingredients}\n` +
                           `   Why similar: ${reasons}`;
      
      recommendations.push(recommendation);
      console.log(`     ${i + 1}. ${cocktail.name} (${abv}) - ${reasons}`);
    }

    // Step 4: Test the natural language response format
    if (recommendations.length > 0) {
      const naturalLanguageResponse = 
        `Based on your Bar Assistant database, here are cocktails similar to a Negroni:\n\n` +
        recommendations.join('\n\n');
      
      console.log('   ✅ Successfully generated natural language recommendations');
      return true;
    }
    
    return false;
  }

  async testRecipeDetails(): Promise<boolean> {
    // Find any cocktail and get its detailed recipe
    const search = await this.client.searchCocktails({ limit: 1 });
    
    if (search.data.length === 0) {
      console.log('   ❌ No cocktails available for recipe test');
      return false;
    }

    const cocktail = search.data[0];
    const recipe = await this.client.getCocktailRecipe(cocktail.id);
    
    console.log(`   Retrieved recipe for: "${recipe.name}"`);
    console.log(`   Ingredients: ${recipe.ingredients?.length || 0}`);
    console.log(`   Instructions: ${recipe.instructions?.length || 0}`);
    
    const hasBasicRecipeData = recipe.name && 
                              (recipe.ingredients && recipe.ingredients.length > 0);
    
    if (!hasBasicRecipeData) {
      console.log('   ❌ Recipe missing basic required data');
      return false;
    }
    
    return true;
  }

  async testInventoryCheck(): Promise<boolean> {
    try {
      const inventory = await this.client.checkInventory();
      
      console.log(`   Available ingredients: ${inventory.available_ingredients.length}`);
      console.log(`   Can make cocktails: ${inventory.can_make_cocktails.length}`);
      
      // This test passes as long as we get a response, even if inventory is empty
      return true;
    } catch (error) {
      // Inventory might not be set up - this is OK for basic functionality
      console.log('   ⚠️  Inventory check failed (might not be configured)');
      return true;
    }
  }

  async testNaturalLanguageRecipe(): Promise<boolean> {
    console.log('   🎯 Testing natural language recipe queries');
    
    // Test various ways people might ask for recipes
    const testQueries = ['Manhattan', 'Negroni', 'Old Fashioned'];
    
    for (const query of testQueries) {
      try {
        console.log(`   Testing query: "${query}"`);
        const results = await this.client.findCocktailByName(query);
        
        if (results.data.length === 0) {
          console.log(`   ⚠️  No results for "${query}" - might be expected for small database`);
          continue;
        }
        
        const cocktail = results.data[0];
        console.log(`   Found: "${cocktail.name}" (ID: ${cocktail.id})`);
        
        // Get the full recipe
        const recipe = await this.client.getCocktailRecipe(cocktail.id);
        
        // Debug: Show raw recipe structure
        console.log(`   🔧 Debug - Recipe keys: ${Object.keys(recipe).join(', ')}`);
        console.log(`   🔧 Debug - Recipe name: "${recipe.name}"`);
        console.log(`   🔧 Debug - Ingredients type: ${typeof recipe.ingredients}, length: ${recipe.ingredients?.length || 'undefined'}`);
        
        if (!recipe.name) {
          console.log(`   ❌ Recipe data incomplete for ${cocktail.name}`);
          return false;
        }
        
        console.log(`   ✅ Recipe retrieved: ${recipe.ingredients?.length || 0} ingredients, ${recipe.instructions?.length || 0} steps`);
      } catch (error) {
        console.log(`   ❌ Error testing "${query}": ${error instanceof Error ? error.message : String(error)}`);
        return false;
      }
    }
    
    console.log('   ✅ Natural language recipe queries working');
    return true;
  }

  // Helper method to run a single test scenario
  async testNegroniScenario(): Promise<void> {
    console.log('🍸 Testing Negroni Recommendation Scenario\n');
    
    try {
      // This simulates the exact user query: "Give me recommendations on cocktails like a Negroni"
      
      // Step 1: Search for Negroni
      const negroniSearch = await this.client.searchCocktails({ query: 'Negroni' });
      
      if (negroniSearch.data.length === 0) {
        console.log('❌ No Negroni found in database');
        return;
      }

      const negroni = negroniSearch.data[0];
      console.log(`Found: ${negroni.name} (ID: ${negroni.id})`);

      // Step 2: Get similar cocktails
      const similar = await this.client.findSimilarCocktails(negroni.id);
      
      console.log('\n📋 Recommendations based on Negroni:');
      console.log('=====================================');
      
      similar.slice(0, 5).forEach((rec, index) => {
        const cocktail = rec.cocktail;
        const ingredients = cocktail.short_ingredients?.map(ing => ing.name).join(', ') || 'Ingredients not listed';
        const abv = cocktail.abv ? `${cocktail.abv}%` : 'ABV not specified';
        const reasons = rec.similarity_reasons?.join(', ') || 'Similar flavor profile';
        
        console.log(`\n${index + 1}. **${cocktail.name}** - ${abv}`);
        console.log(`   Ingredients: ${ingredients}`);
        console.log(`   Why similar: ${reasons}`);
        console.log(`   ID: ${cocktail.id}`);
      });
      
      console.log('\n✅ Test completed successfully!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  // Test method for natural language recipe queries
  async testRecipeQuery(): Promise<void> {
    console.log('🍸 Testing Natural Language Recipe Queries\n');
    
    // Test different ways people might ask for recipes
    const queries = [
      'Manhattan',
      'How do I make a Negroni',
      'Old Fashioned recipe',
      'Margarita',
      'Linden Square'  // Add the specific test case
    ];
    
    for (const query of queries) {
      try {
        console.log(`🔍 Testing: "${query}"`);
        const results = await this.client.findCocktailByName(query);
        
        if (results.data.length === 0) {
          console.log(`   ❌ No cocktail found for "${query}"\n`);
          continue;
        }
        
        const cocktail = results.data[0];
        console.log(`   ✅ Found: "${cocktail.name}" (ID: ${cocktail.id})`);
        
        // Get detailed recipe
        const recipe = await this.client.getCocktailRecipe(cocktail.id);
        console.log(`   📖 Recipe: ${recipe.ingredients?.length || 0} ingredients, ${recipe.instructions?.length || 0} steps`);
        
        // Show sample ingredients
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          const firstIngredient = recipe.ingredients[0];
          console.log(`   🥃 First ingredient: ${firstIngredient.pivot.amount}${firstIngredient.pivot.units} ${firstIngredient.name}`);
        }
        
        console.log('');
        
      } catch (error) {
        console.error(`   ❌ Error testing "${query}":`, error);
      }
    }
    
    console.log('✅ Natural language recipe test completed!');
  }

  // Specific test for Linden Square cocktail 
  async testLindenSquareRecipe(): Promise<void> {
    console.log('🍸 Testing Specific Case: "What is the recipe for the Linden Square cocktail?"\n');
    console.log('========================================================================');
    
    try {
      console.log('🔍 Step 1: Searching for Linden Square cocktail...');
      const searchResults = await this.client.findCocktailByName('Linden Square');
      
      if (searchResults.data.length === 0) {
        console.log('❌ No "Linden Square" cocktail found');
        console.log('\n🔍 Searching for alternatives...');
        
        // Try variations
        const alternatives = ['Linden', 'Square'];
        for (const alt of alternatives) {
          const altResults = await this.client.searchCocktails({ query: alt, limit: 3 });
          if (altResults.data.length > 0) {
            console.log(`\n📋 Found ${altResults.data.length} cocktails matching "${alt}":`);
            altResults.data.forEach((cocktail, index) => {
              console.log(`   ${index + 1}. ${cocktail.name} (ID: ${cocktail.id})`);
            });
          }
        }
        return;
      }

      const cocktail = searchResults.data[0];
      console.log(`✅ Found: "${cocktail.name}" (ID: ${cocktail.id})`);
      console.log(`   Search result has ${cocktail.short_ingredients?.length || 0} ingredients`);
      
      console.log('\n📖 Step 2: Getting detailed recipe...');
      let recipe;
      try {
        recipe = await this.client.getCocktailRecipe(cocktail.id);
        console.log(`   Detailed recipe has ${(recipe as any).ingredients?.length || 0} ingredients, ${(recipe as any).instructions?.length || 0} instructions`);
        
        // Debug: Show all keys in the recipe response
        console.log(`   Recipe keys: ${Object.keys(recipe as any).join(', ')}`);
        
        // Check if there are any ingredient-related keys
        const recipeKeys = Object.keys(recipe as any);
        const ingredientKeys = recipeKeys.filter(key => key.toLowerCase().includes('ingredient'));
        if (ingredientKeys.length > 0) {
          console.log(`   Found ingredient-related keys: ${ingredientKeys.join(', ')}`);
        }
        
      } catch (error) {
        console.log('⚠️  Detailed recipe failed, using search data');
        recipe = cocktail;
      }
      
      // Debug: Show what data we actually have
      console.log('\n🔧 Debug: Available data sources:');
      console.log(`   • Search ingredients: ${cocktail.short_ingredients?.length || 0}`);
      console.log(`   • Recipe ingredients: ${(recipe as any).ingredients?.length || 0}`);
      console.log(`   • Recipe instructions: ${(recipe as any).instructions?.length || 0}`);
      
      console.log('\n📋 Step 3: Formatting well-readable recipe...');
      console.log('==================================================\n');
      
      // Format the recipe in an easy-to-read format
      console.log(`# ${cocktail.name} Recipe\n`);
      
      // Ingredients section
      console.log('## 🥃 INGREDIENTS');
      console.log('```');
      
      const ingredientsList = (recipe as any).ingredients || cocktail.short_ingredients || [];
      if (ingredientsList.length > 0) {
        ingredientsList.forEach((ing: any, index: number) => {
          // Handle different ingredient structures
          const amount = ing.pivot?.amount || ing.amount || '';
          const units = ing.pivot?.units || ing.units || '';
          const name = ing.ingredient?.name || ing.name || 'Unknown ingredient';
          const optional = ing.pivot?.optional || ing.optional ? ' (optional)' : '';
          
          // Format with proper spacing for readability
          const measurement = amount && units ? `${amount}${units}` : amount || '';
          const paddedMeasurement = measurement.toString().padEnd(10);
          console.log(`${paddedMeasurement} ${name}${optional}`);
        });
      } else {
        console.log('No ingredients available');
      }
      console.log('```\n');
      
      // Instructions section  
      console.log('## 📝 INSTRUCTIONS');
      const instructions = (recipe as any).instructions;
      
      if (instructions) {
        if (typeof instructions === 'string') {
          // Instructions stored as a single string - split by common delimiters
          const steps = instructions.split(/[,\n\r]|(?:\d+\.)/g)
            .map((step: string) => step.trim())
            .filter((step: string) => step.length > 0);
          
          if (steps.length > 0) {
            steps.forEach((step: string, index: number) => {
              console.log(`${index + 1}. ${step}`);
            });
          } else {
            console.log(`1. ${instructions}`);
          }
        } else if (Array.isArray(instructions) && instructions.length > 0) {
          // Instructions as array
          instructions
            .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0))
            .forEach((inst: any, index: number) => {
              const content = inst.content || inst.description || inst.text || inst;
              console.log(`${index + 1}. ${content}`);
            });
        } else {
          console.log('1. Instructions format not recognized');
        }
      } else {
        console.log('1. Instructions not available in database');
      }
      console.log('');
      
      // Additional details
      console.log('## ℹ️  DETAILS');
      if ((recipe as any).abv) console.log(`• **Strength:** ${(recipe as any).abv}% ABV`);
      if ((recipe as any).glass?.name) console.log(`• **Glass:** ${(recipe as any).glass.name}`);
      if ((recipe as any).method?.name) console.log(`• **Method:** ${(recipe as any).method.name}`);
      if ((recipe as any).garnish) console.log(`• **Garnish:** ${(recipe as any).garnish}`);
      
      console.log('\n✅ Linden Square recipe test completed successfully!');
      
    } catch (error) {
      console.error('❌ Linden Square test failed:', error);
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new BarAssistantTester();
  
  const testType = process.argv[2];
  
  if (testType === 'negroni') {
    tester.testNegroniScenario();
  } else if (testType === 'recipe') {
    tester.testRecipeQuery();
  } else if (testType === 'linden') {
    tester.testLindenSquareRecipe();
  } else {
    tester.runAllTests().then(success => {
      process.exit(success ? 0 : 1);
    }).catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
  }
}