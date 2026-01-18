#!/usr/bin/env node

/**
 * Blog Feature Validation & Testing Script
 * This script helps verify that the blog feature is working correctly
 */

const fs = require('fs');
const path = require('path');

const testResults = {
  passed: [],
  failed: [],
};

function checkFileExists(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    testResults.passed.push(`✅ ${description} - Found at ${filePath}`);
    return true;
  } else {
    testResults.failed.push(`❌ ${description} - Missing at ${filePath}`);
    return false;
  }
}

function checkFileContains(filePath, searchString, description) {
  const fullPath = path.join(process.cwd(), filePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes(searchString)) {
      testResults.passed.push(`✅ ${description}`);
      return true;
    } else {
      testResults.failed.push(`❌ ${description} - Pattern not found`);
      return false;
    }
  } catch (error) {
    testResults.failed.push(`❌ ${description} - Error reading file: ${error.message}`);
    return false;
  }
}

console.log('🔍 Blog Feature Validation\n');
console.log('==========================\n');

// 1. Database & Schema
console.log('1️⃣  Database Schema...');
checkFileContains(
  'prisma/schema.prisma',
  'model Blog',
  'Blog model exists in Prisma schema'
);
checkFileContains(
  'prisma/schema.prisma',
  'published',
  'Blog has published field'
);
console.log();

// 2. API Routes
console.log('2️⃣  API Routes...');
checkFileExists('src/app/api/blog/route.ts', 'Blog list/create API endpoint');
checkFileExists('src/app/api/blog/[id]/route.ts', 'Blog detail/edit/delete API endpoint');
checkFileContains(
  'src/app/api/blog/route.ts',
  'GET',
  'Blog API has GET method for listing'
);
checkFileContains(
  'src/app/api/blog/route.ts',
  'POST',
  'Blog API has POST method for creating'
);
console.log();

// 3. Public Pages
console.log('3️⃣  Public Blog Pages...');
checkFileExists('src/app/blog/page.tsx', 'Blog listing page');
checkFileExists('src/app/blog/[slug]/page.tsx', 'Blog detail page');
checkFileContains(
  'src/app/blog/page.tsx',
  'pagination',
  'Blog listing has pagination'
);
checkFileContains(
  'src/app/blog/[slug]/page.tsx',
  'markdown',
  'Blog detail page supports markdown'
);
console.log();

// 4. Admin Pages
console.log('4️⃣  Admin Pages...');
checkFileExists('src/app/admin/blog/page.tsx', 'Admin blog management dashboard');
checkFileExists('src/app/admin/blog/[id]/page.tsx', 'Admin blog editor');
checkFileContains(
  'src/app/admin/blog/[id]/page.tsx',
  'parseMarkdown',
  'Admin editor has markdown parser'
);
checkFileContains(
  'src/app/admin/blog/[id]/page.tsx',
  'showPreview',
  'Admin editor has preview mode'
);
console.log();

// 5. Components
console.log('5️⃣  Components...');
checkFileExists('src/components/BlogCard.tsx', 'BlogCard component');
checkFileExists('src/components/LatestBlogPostsSection.tsx', 'LatestBlogPostsSection component');
checkFileExists('src/components/MarkdownGuide.tsx', 'MarkdownGuide component');
checkFileContains(
  'src/components/Header.tsx',
  'blog',
  'Header navigation includes blog link'
);
console.log();

// 6. Homepage Integration
console.log('6️⃣  Homepage Integration...');
checkFileContains(
  'src/app/page.tsx',
  'LatestBlogPostsSection',
  'Homepage imports LatestBlogPostsSection'
);
checkFileContains(
  'src/app/page.tsx',
  '<LatestBlogPostsSection',
  'Homepage uses LatestBlogPostsSection component'
);
console.log();

// 7. Documentation
console.log('7️⃣  Documentation...');
checkFileExists('BLOG_FEATURE.md', 'Complete blog feature documentation');
checkFileExists('BLOG_QUICKSTART.md', 'Blog quick start guide');
console.log();

// Summary
console.log('==========================\n');
console.log('📊 Test Results Summary\n');
console.log(`✅ Passed: ${testResults.passed.length}`);
console.log(`❌ Failed: ${testResults.failed.length}`);

if (testResults.passed.length > 0) {
  console.log('\n✅ Passed Tests:');
  testResults.passed.forEach((result) => console.log(`  ${result}`));
}

if (testResults.failed.length > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.failed.forEach((result) => console.log(`  ${result}`));
}

console.log('\n==========================\n');

if (testResults.failed.length === 0) {
  console.log('🎉 All checks passed! Blog feature is ready to use.\n');
  console.log('Next Steps:');
  console.log('1. Navigate to /admin/blog to create your first blog post');
  console.log('2. Use the markdown editor with live preview');
  console.log('3. Publish and view on /blog');
  console.log('4. See homepage for latest posts section\n');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Please review the issues above.\n');
  process.exit(1);
}
