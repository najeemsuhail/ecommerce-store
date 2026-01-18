# Blog Feature Documentation

## Overview

The e-commerce store now includes a complete blogging system with markdown support. This allows store admins to create and manage blog posts that appear on the public site.

## Features

### Public Blog Pages
- **Blog Listing** (`/blog`) - View all published blog posts with pagination
- **Blog Detail** (`/blog/[slug]`) - Read individual blog posts with full markdown formatting
- **Latest Blog Posts** - Section on homepage showing 3 most recent blog posts
- **Blog Navigation** - Added to main header navigation (desktop & mobile)

### Admin Blog Management
- **Admin Dashboard** (`/admin/blog`) - Manage all blog posts with table view
- **Create/Edit Blog** (`/admin/blog/new`, `/admin/blog/[id]`) - Create and edit blog posts
- **Markdown Editor** - Rich editor with live preview and syntax guide
- **Draft/Published** - Toggle between draft and published status

## Markdown Support

The blog editor supports full markdown syntax with live preview. Here's what's supported:

### Headers
```markdown
# Heading 1 (h1)
## Heading 2 (h2)
### Heading 3 (h3)
```

### Text Formatting
```markdown
**bold text**       - Bold emphasis
*italic text*       - Italic emphasis
`inline code`       - Code highlighting
```

### Lists
```markdown
* Item 1            - Unordered list
* Item 2
* Item 3

- Alternative bullet style also works
```

### Links & Images
```markdown
[Link text](https://example.com)        - Creates a clickable link
![Alt text](image-url.jpg)              - Embeds an image
```

### Code Blocks
```markdown
```
code block
without syntax highlighting
```

```javascript
// Code block with syntax highlighting
const greeting = "Hello, World!";
```
```

### Blockquotes
```markdown
> This is a blockquote
> It can span multiple lines
```

### Paragraphs & Line Breaks
```markdown
First paragraph

Second paragraph        - Double line break creates new paragraph

Line 1
Line 2                  - Single line break is ignored

Line 1  
Line 2                  - Two spaces + line break = soft break
```

## Database Schema

### Blog Model
```prisma
model Blog {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  content       String   @db.Text
  excerpt       String?
  featuredImage String?
  author        String?
  published     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([published])
  @@index([createdAt])
}
```

## API Endpoints

### List Blogs
```
GET /api/blog?page=1&limit=10
```
Returns published blogs with pagination.

**Response:**
```json
{
  "success": true,
  "blogs": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Get Single Blog
```
GET /api/blog/[id]
```
Returns a single blog by ID.

### Create Blog (Admin)
```
POST /api/blog
Authorization: Bearer [token]
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Blog Post Title",
  "slug": "blog-post-slug",
  "content": "# Content\n\nMarkdown formatted content",
  "excerpt": "Short description",
  "featuredImage": "https://example.com/image.jpg",
  "author": "Author Name",
  "published": true
}
```

### Update Blog (Admin)
```
PUT /api/blog/[id]
Authorization: Bearer [token]
```

### Delete Blog (Admin)
```
DELETE /api/blog/[id]
Authorization: Bearer [token]
```

## Usage Guide

### Creating a Blog Post

1. Navigate to `/admin/blog` in your admin panel
2. Click "New Blog" button
3. Fill in the blog details:
   - **Title**: The blog post title (required)
   - **Slug**: URL-friendly identifier (required) - used in `/blog/[slug]`
   - **Author**: Author name (optional)
   - **Featured Image**: URL to blog cover image (optional)
   - **Excerpt**: Short description for blog listing (optional)
   - **Content**: Full blog content in markdown (required)

4. Click "? Syntax" button to view markdown syntax guide
5. Use "👁️ Preview" button to see how your content will look
6. Check "Publish this blog" to make it public
7. Click "Save Blog" to save

### Markdown Tips

- **Always use double line breaks** to create separate paragraphs
- Use **syntax highlighting** for code blocks with language specification
- **Links open in new tabs** automatically
- **Inline code** is styled with background color for contrast
- **Headers help structure** your content - use them liberally
- **Blockquotes** are great for highlighting key information

### Best Practices

1. **Use descriptive slugs** - Use hyphens, no spaces or special characters
2. **Write compelling excerpts** - This appears in blog listings
3. **Add featured images** - Improves visual appeal on listings
4. **Use headers properly** - Help with readability and SEO
5. **Keep formatting consistent** - Use the syntax guide as reference
6. **Preview before publishing** - Always check the preview pane
7. **Draft first** - Save as draft and review before publishing

## File Structure

```
src/
├── app/
│   ├── blog/
│   │   ├── page.tsx           # Blog listing page
│   │   └── [slug]/
│   │       └── page.tsx       # Blog detail page
│   ├── admin/blog/
│   │   ├── page.tsx           # Admin blog management
│   │   └── [id]/
│   │       └── page.tsx       # Blog create/edit form
│   └── api/blog/
│       ├── route.ts           # List and create blogs
│       └── [id]/
│           └── route.ts       # Get, update, delete blog
├── components/
│   ├── BlogCard.tsx           # Blog preview card
│   ├── LatestBlogPostsSection.tsx  # Homepage section
│   ├── MarkdownGuide.tsx       # Markdown syntax guide
│   └── Header.tsx             # Updated with blog link
└── lib/
    └── prisma.ts              # Database client
```

## Testing Checklist

- [ ] Create a test blog with markdown content
- [ ] Verify markdown renders correctly in preview
- [ ] Check blog appears on public /blog page
- [ ] Verify pagination works on blog listing
- [ ] Check blog detail page displays formatted content
- [ ] Verify latest 3 blogs appear on homepage
- [ ] Test blog navigation in header (desktop & mobile)
- [ ] Verify admin blog management page shows all blogs
- [ ] Test edit functionality for existing blogs
- [ ] Test delete functionality with confirmation
- [ ] Verify draft/published toggle works

## Troubleshooting

### Blog not appearing on public site
- Check that blog is marked as "Published"
- Verify `published` field is set to `true` in database
- Ensure featured image URL (if set) is valid

### Markdown not rendering correctly
- Double-check syntax in markdown guide
- Use double line breaks for paragraphs
- Ensure code blocks have proper ``` delimiters
- Preview pane shows how it will render

### Links not opening
- Verify full URL is used (include https://)
- Links automatically open in new tabs

### Admin operations failing
- Verify bearer token is present in Authorization header
- Check token is valid and has admin privileges
- Ensure required fields (title, slug, content) are provided

## Future Enhancements

- [ ] Search functionality for blog posts
- [ ] Blog categories and tags
- [ ] Comment system
- [ ] Social sharing buttons
- [ ] Related posts suggestion
- [ ] Blog post views counter
- [ ] Export to PDF
- [ ] Scheduled publishing
- [ ] Bulk operations (publish/unpublish)
- [ ] Full-text search index

## Performance Notes

- Blogs are indexed by `published` and `createdAt` for fast queries
- Pagination set to 10 items per page by default
- Latest blog section limited to 3 posts for performance
- Consider implementing caching for frequently accessed blogs

## Security

- Blog creation/editing requires authentication token
- All admin operations require Bearer token in Authorization header
- User input is sanitized before storage
- Markdown is rendered safely without script injection

## Related Components

- [Header.tsx](../components/Header.tsx) - Navigation integration
- [BlogCard.tsx](../components/BlogCard.tsx) - Reusable blog preview
- [LatestBlogPostsSection.tsx](../components/LatestBlogPostsSection.tsx) - Homepage widget
- [MarkdownGuide.tsx](../components/MarkdownGuide.tsx) - Syntax reference

