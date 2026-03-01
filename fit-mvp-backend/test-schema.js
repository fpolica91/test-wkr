const { UpdateGoalRequestSchema } = require('../packages/api-client/dist/schemas');

console.log('Testing UpdateGoalRequestSchema...');

// Test 1: Empty object (should be valid for partial)
console.log('\nTest 1: Empty object');
try {
  const result = UpdateGoalRequestSchema.parse({});
  console.log('✓ Valid:', result);
} catch (error) {
  console.log('✗ Error:', error.errors || error.issues || error.message);
}

// Test 2: With description only
console.log('\nTest 2: With description only');
try {
  const result = UpdateGoalRequestSchema.parse({
    description: 'Test description'
  });
  console.log('✓ Valid:', result);
} catch (error) {
  console.log('✗ Error:', error.errors || error.issues || error.message);
  console.log('Details:', error.issues || error.errors);
}

// Test 3: With date
console.log('\nTest 3: With date');
try {
  const result = UpdateGoalRequestSchema.parse({
    targetDate: '2026-06-28T00:00:00.000Z'
  });
  console.log('✓ Valid:', result);
} catch (error) {
  console.log('✗ Error:', error.errors || error.issues || error.message);
  console.log('Details:', error.issues || error.errors);
}

// Test 4: With all fields
console.log('\nTest 4: With all fields');
try {
  const result = UpdateGoalRequestSchema.parse({
    goalType: 'GENERAL_FITNESS',
    currentValue: 2,
    description: 'I want to lose belly fat',
    targetDate: '2026-06-28T00:00:00.000Z'
  });
  console.log('✓ Valid:', result);
} catch (error) {
  console.log('✗ Error:', error.errors || error.issues || error.message);
  console.log('Details:', error.issues || error.errors);
}